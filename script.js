const timeTable = [
    { num: 1, start: "08:30", end: "09:10" }, { num: 2, start: "09:20", end: "10:00" },
    { num: 3, start: "10:20", end: "11:00" }, { num: 4, start: "11:10", end: "11:50" },
    { num: 5, start: "12:10", end: "12:50" }, { num: 6, start: "13:10", end: "13:50" },
    { num: 7, start: "14:00", end: "14:40" }, { num: 8, start: "14:50", end: "15:30" }
];

const daysData = {
    1: { name: "Понедельник", short: "Пн", lessons: { 1: "Физика", 2: "Литература", 3: "История", 4: "Алгебра", 5: "Вероятность", 6: "Физкультура", 7: "Информатика" }, rooms: {1:"301", 2:"308", 3:"210", 4:"313", 5:"313", 6:"Спортзал", 7:"301"} },
    2: { name: "Вторник", short: "Вт", lessons: { 2: "География", 3: "Труд", 4: "История", 5: "Русский язык", 6: "Музыка", 7: "Алгебра", 8: "Геометрия" }, rooms: {2:"306", 3:"201", 4:"210", 5:"308", 6:"303", 7:"313", 8:"313"} },
    3: { name: "Среда", short: "Ср", lessons: { 1: "ОБЗР", 2: "Биология", 3: "Физкультура", 4: "Английский язык", 5: "Физика", 6: "География" }, rooms: {1:"203", 2:"306", 3:"Спортзал", 4:"305", 5:"301", 6:"306"} },
    4: { name: "Четверг", short: "Чт", lessons: { 3: "Биология", 4: "Английский язык", 5: "История", 6: "Русский язык", 7: "Химия" }, rooms: {3:"203", 4:"305", 5:"210", 6:"308", 7:"316"} },
    5: { name: "Пятница", short: "Пт", lessons: { 3: "Химия", 4: "Алгебра", 5: "Русский язык", 6: "Английский язык", 7: "Литература", 8: "Геометрия" }, rooms: {3:"316", 4:"313", 5:"308", 6:"305", 7:"308", 8:"313"} }
};

const canvas = document.getElementById('bg-canvas'); const ctx = canvas.getContext('2d');
const swiper = document.getElementById('swiper'); const pullIndicator = document.getElementById('pull-indicator'); const pullSvg = document.getElementById('pull-svg');
let startX = 0, startY = 0, currentTranslate = 0, prevTranslate = 0, isDragging = false, currentIdx = 0, dragDirection = null, lastHeartbeat = Date.now(), activePalette = null;

let blobs = [];
let mouse = { x: null, y: null, targetX: null, targetY: null, active: false };

let matrixScale = 1, startHypot = 0, isZuming = false, lastTapTime = 0;

const currentHour = new Date().getHours(); document.documentElement.setAttribute('data-theme', (currentHour < 7 || currentHour >= 19) ? 'dark' : 'light');

const darkPalettes = [{ base: '#040209', colors: ['#ff0055', '#00ffcc', '#9900ff', '#ffaa00'] }, { base: '#01030d', colors: ['#0072ff', '#00f6ff', '#7000ff', '#ff00aa'] }, { base: '#010501', colors: ['#00ff66', '#a8ff78', '#78ffd6', '#0052d4'] }];
const lightPalettes = [{ base: '#ffffff', colors: ['#ff0055', '#38ef7d', '#0072ff', '#ffaa00'] }, { base: '#ffffff', colors: ['#00f6ff', '#ff007f', '#7000ff', '#00ffcc'] }, { base: '#ffffff', colors: ['#ff5e00', '#ff0055', '#ffcc00', '#ff00ff'] }];

function parseTime(tStr) { let [h, m] = tStr.split(':').map(Number); return h * 60 + m; }

function selectRandomPalette() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    activePalette = (isDark ? darkPalettes : lightPalettes)[Math.floor(Math.random() * 3)];
    const soloColor = activePalette.colors[0]; // Исправлено: строго ПЕРВЫЙ цвет строки извлекается в CSS
    document.documentElement.style.setProperty('--accent', soloColor);
    document.documentElement.style.setProperty('--neon-glow', soloColor + (isDark ? '66' : '33'));
    initBlobs();
}
function initBlobs() {
    blobs = [];
    for (let i = 0; i < 5; i++) {
        blobs.push({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * (canvas.width * 0.7) + canvas.width * 0.5,
            color: activePalette.colors[i % activePalette.colors.length]
        });
    }
}

function renderLoop() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = activePalette.base + (isDark ? '25' : '35'); ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = isDark ? 'screen' : 'difference';
    if (mouse.active && mouse.targetX !== null) {
        if (mouse.x === null) { mouse.x = mouse.targetX; mouse.y = mouse.targetY; }
        mouse.x += (mouse.targetX - mouse.x) * 0.08; mouse.y += (mouse.targetY - mouse.y) * 0.08;
    }
    blobs.forEach((blob) => {
        blob.x += blob.vx; blob.y += blob.vy;
        if (blob.x < -100 || blob.x > canvas.width + 100) blob.vx *= -1;
        if (blob.y < -100 || blob.y > canvas.height + 100) blob.vy *= -1;
        if (mouse.active && mouse.x !== null) {
            let dx = mouse.x - blob.x; let dy = mouse.y - blob.y; let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < canvas.width * 0.6) { blob.x += (dx / dist) * 0.8; blob.y += (dy / dist) * 0.8; }
        }
        ctx.save(); let radialGrad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
        radialGrad.addColorStop(0, blob.color + (isDark ? '99' : 'bb')); radialGrad.addColorStop(0.3, blob.color + '22'); radialGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = radialGrad; ctx.beginPath(); ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    });
    requestAnimationFrame(renderLoop);
}

function updateMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX; 
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    mouse.targetX = (clientX - rect.left) * (canvas.width / rect.width); mouse.targetY = (clientY - rect.top) * (canvas.height / rect.height);
}

window.addEventListener('touchstart', e => { 
    if(e.target.closest('.navigation-tabs')) return;
    
    // Внедрено: Магическое высчитывание центроида (живой точки касания пальцев) для Фокуса Зума
    if (e.touches.length === 2 && e.target.closest('.week-matrix-box')) {
        isZuming = true; isDragging = false; mouse.active = false;
        const grid = document.getElementById('matrix-grid');
        grid.style.transition = 'none';
        
        let t1 = e.touches[0], t2 = e.touches[1];
        let rect = grid.getBoundingClientRect();
        // Находим геометрическую середину между подушечками двух пальцев Кирилла
        let midX = ((t1.clientX + t2.clientX) / 2) - rect.left;
        let midY = ((t1.clientY + t2.clientY) / 2) - rect.top;
        
        // Мгновенно перенаправляем "якорь" CSS трансформации в эту точку!
        grid.style.transformOrigin = `${midX}px ${midY}px`;
        startHypot = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        return;
    }
    
    isDragging = true; dragDirection = null; const touch = e.touches; startX = touch[0].clientX; startY = touch[0].clientY;
    if (!e.target.closest('.lessons-list') && !e.target.closest('.week-matrix-box') && e.touches.length === 1) { mouse.active = true; updateMousePos(e); }
});

window.addEventListener('touchmove', e => {
    if (isZuming && e.touches.length === 2) {
        e.preventDefault();
        let t1 = e.touches[0], t2 = e.touches[1];
        let currentHypot = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        let factor = currentHypot / (startHypot || 1);
        matrixScale = Math.min(Math.max(matrixScale * factor, 0.7), 2.5); 
        document.getElementById('matrix-grid').style.transform = `scale(${matrixScale})`;
        startHypot = currentHypot;
        return;
    }
    if (!isDragging || e.touches.length > 1) return;
    const touch = e.touches; let diffX = touch[0].clientX - startX; let diffY = touch[0].clientY - startY;
    if (mouse.active) updateMousePos(e);
    
    if (!dragDirection) {
        if (Math.abs(diffX) > Math.abs(diffY) + 15) dragDirection = 'horizontal';
        else if (diffY > 15 && currentIdx === 0) dragDirection = 'pull';
    }
    if (dragDirection === 'horizontal') {
        currentTranslate = prevTranslate + diffX; swiper.style.transform = `translateX(${currentTranslate}px)`;
    } else if (dragDirection === 'pull') {
        e.preventDefault();
        let pullDistance = Math.min(diffY * 0.4, 90);
        pullIndicator.style.transform = `translate3d(-50%, ${pullDistance}px, 0)`; pullIndicator.style.opacity = Math.min(pullDistance / 60, 1);
        pullSvg.style.transform = `rotate(${pullDistance * 4}deg)`;
    }
}, { passive: false });
window.addEventListener('touchend', () => {
    isDragging = false; isZuming = false; mouse.active = false; mouse.x = mouse.y = mouse.targetX = mouse.targetY = null;
    if (dragDirection === 'horizontal') {
        let movedBy = currentTranslate - prevTranslate;
        if (movedBy < -100 && currentIdx < 1) currentIdx++; if (movedBy > 100 && currentIdx > 0) currentIdx--; switchScreen(currentIdx);
    } else if (dragDirection === 'pull') {
        let lastY = parseFloat(pullIndicator.style.transform.replace(/[^0-9.]/g,'')) || 0;
        pullIndicator.style.transition = 'all 0.3s ease';
        if (lastY > 55) { pullIndicator.classList.add('refreshing'); pullIndicator.style.transform = 'translate3d(-50%, 60px, 0)'; setTimeout(() => location.reload(true), 600); }
        else { pullIndicator.style.transform = 'translate3d(-50%, 0, 0)'; pullIndicator.style.opacity = '0'; }
    }
});

window.addEventListener('click', e => { 
    if (e.target.closest('.navigation-tabs') || e.target.closest('.lessons-list')) return; 
    
    if (e.target.closest('.week-matrix-box')) {
        let currentTime = Date.now();
        let tapLength = currentTime - lastTapTime;
        if (tapLength < 300 && tapLength > 0) {
            matrixScale = 1;
            const grid = document.getElementById('matrix-grid');
            grid.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            grid.style.transform = 'scale(1)';
            e.preventDefault();
            return;
        }
        lastTapTime = currentTime;
    }
    
    activePalette = null; selectRandomPalette(); 
});

function switchScreen(index) {
    currentIdx = index; currentTranslate = currentIdx * -window.innerWidth; prevTranslate = currentTranslate;
    const sDay = document.getElementById('slide-day'), sWeek = document.getElementById('slide-week'), randomEffect = Math.floor(Math.random() * 3) + 1;
    sDay.style.transition = sWeek.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'; swiper.style.transform = 'none';

    if (randomEffect === 1) {
        if (index === 0) { sDay.style.transform = 'translate3d(0,0,0) rotateY(0deg)'; sDay.style.opacity = '1'; sDay.style.filter = 'blur(0px)'; sWeek.style.transform = 'translate3d(100%,0,-300px) rotateY(90deg)'; sWeek.style.opacity = '0'; }
        else { sDay.style.transform = 'translate3d(-100%,0,-300px) rotateY(-90deg)'; sDay.style.opacity = '0'; sWeek.style.transform = 'translate3d(-100%,0,0) rotateY(0deg)'; sWeek.style.opacity = '1'; sWeek.style.filter = 'blur(0px)'; }
    } else if (randomEffect === 2) {
        if (index === 0) { sDay.style.transform = 'translate3d(0,0,0) scale(1)'; sDay.style.opacity = '1'; sDay.style.filter = 'blur(0px)'; sWeek.style.transform = 'translate3d(0,0,0) scale(0.7)'; sWeek.style.opacity = '0'; sWeek.style.filter = 'blur(15px)'; }
        else { sDay.style.transform = 'translate3d(-100%,0,0) scale(0.7)'; sDay.style.opacity = '0'; sDay.style.filter = 'blur(15px)'; sWeek.style.transform = 'translate3d(-100%,0,0) scale(1)'; sWeek.style.opacity = '1'; sWeek.style.filter = 'blur(0px)'; }
    } else {
        if (index === 0) { sDay.style.transform = 'translate3d(0,0,0)'; sDay.style.opacity = '1'; sDay.style.filter = 'blur(0px)'; sWeek.style.transform = 'translate3d(100%,0,0)'; sWeek.style.opacity = '0'; }
        else { sDay.style.transform = 'translate3d(-100%,0,0)'; sDay.style.opacity = '0'; sWeek.style.transform = 'translate3d(-100%,0,0)'; sWeek.style.opacity = '1'; sWeek.style.filter = 'blur(0px)'; }
    }
    const shift = (document.querySelector('.navigation-tabs').offsetWidth - 12) / 2;
    document.getElementById('nav-carriage').style.transform = `translateX(${index * shift}px)`;
    document.querySelectorAll('.tab-btn').forEach((btn, i) => btn.classList.toggle('active', i === index));
}

function buildMatrix() {
    const grid = document.getElementById('matrix-grid'); grid.innerHTML = '';
    let corner = document.createElement('div'); corner.className = 'matrix-cell header'; corner.innerText = '№'; grid.appendChild(corner);
    for (let d = 1; d <= 5; d++) { let cell = document.createElement('div'); cell.className = 'matrix-cell header'; cell.innerText = daysData[d].short; grid.appendChild(cell); }
    for (let l = 1; l <= 8; l++) {
        let numCell = document.createElement('div'); numCell.className = 'matrix-cell num-col'; numCell.innerText = l; grid.appendChild(numCell);
        for (let d = 1; d <= 5; d++) {
            let cell = document.createElement('div'); const name = daysData[d].lessons[l]; cell.className = name ? 'matrix-cell' : 'matrix-cell empty';
            if (name) { cell.innerText = name; if (name.length > 11) cell.style.fontSize = '7px'; if (name.length > 14) cell.style.fontSize = '6px'; }
            grid.appendChild(cell);
        }
    }
}

window.addEventListener('deviceorientation', e => {
    if (!e.gamma || !e.beta) return;
    let x = Math.min(Math.max(e.gamma, -30), 30) / 1.5, y = Math.min(Math.max(e.beta - 45, -30), 30) / 1.5;
    canvas.style.transform = `translate3d(${x * 1.1}px,${y * 1.1}px,0) scale(1.15)`;
    document.querySelectorAll('.gyro-tilt').forEach(el => el.style.transform = `rotateY(${x / 2}deg) rotateX(${-y / 2}deg) translateZ(15px)`);
});

function resizeCanvas() { canvas.width = window.innerWidth * 1.2; canvas.height = window.innerHeight * 1.2; }
buildMatrix(); canvas.width = window.innerWidth * 1.2; canvas.height = window.innerHeight * 1.2; selectRandomPalette(); renderLoop();
