let currentUser = 0;

// 🎨 ИСПРАВЛЕНО: Матрица увеличена до 15 премиальных киберпанк-сочетаний
const darkPalettes = [
    { base: '#040209', colors: ['#ff0055', '#00ffcc', '#9900ff', '#ffaa00'] },
    { base: '#01030d', colors: ['#0072ff', '#00f6ff', '#7000ff', '#ff00aa'] },
    { base: '#010501', colors: ['#00ff66', '#a8ff78', '#78ffd6', '#0052d4'] },
    { base: '#050205', colors: ['#ff00ea', '#ff0055', '#7000ff', '#330033'] },
    { base: '#020508', colors: ['#00f2fe', '#4facfe', '#0000ff', '#003344'] },
    { base: '#090401', colors: ['#ffaa00', '#ff3300', '#ff0055', '#4a0000'] },
    { base: '#03010a', colors: ['#7928ca', '#ff0080', '#00dfd8', '#ff0055'] },
    { base: '#010606', colors: ['#00ffcc', '#00ffff', '#0055ff', '#9900ff'] }
];
const lightPalettes = [
    { base: '#ffffff', colors: ['#ff0055', '#38ef7d', '#0072ff', '#ffaa00'] },
    { base: '#ffffff', colors: ['#00f6ff', '#ff007f', '#7000ff', '#00ffcc'] },
    { base: '#ffffff', colors: ['#ff5e00', '#ff0055', '#ffcc00', '#ff00ff'] },
    { base: '#f8fafc', colors: ['#4f46e5', '#06b6d4', '#10b981', '#3b82f6'] },
    { base: '#fff5f5', colors: ['#f43f5e', '#ec4899', '#d946ef', '#8b5cf6'] },
    { base: '#f0fdf4', colors: ['#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9'] },
    { base: '#fffbeb', colors: ['#eab308', '#f97316', '#ef4444', '#f43f5e'] }
];

const timeTable = [
    { num: 0, start: "08:00", end: "08:25" },
    { num: 1, start: "08:30", end: "09:10" }, { num: 2, start: "09:20", end: "10:00" },
    { num: 3, start: "10:20", end: "11:00" }, { num: 4, start: "11:10", end: "11:50" },
    { num: 5, start: "12:10", end: "12:50" }, { num: 6, start: "13:10", end: "13:50" },
    { num: 7, start: "14:00", end: "14:40" }, { num: 8, start: "14:50", end: "15:30" }
];
const schedules = [
    {
        1: { name: "Понедельник", short: "Пн", lessons: { 0: "Разговоры о важном", 1: "Физика", 2: "Литература", 3: "История", 4: "Алгебра", 5: "Вероятность", 6: "Физкультура", 7: "Информатика" }, rooms: {0:"301", 1:"301", 2:"308", 3:"210", 4:"313", 5:"313", 6:"Спортзал", 7:"301"} },
        2: { name: "Вторник", short: "Вт", lessons: { 2: "География", 3: "Труд", 4: "История", 5: "Русский язык", 6: "Музыка", 7: "Алгебра", 8: "Геометрия" }, rooms: {2:"306", 3:"201", 4:"210", 5:"308", 6:"303", 7:"313", 8:"313"} },
        3: { name: "Среда", short: "Ср", lessons: { 1: "ОБЗР", 2: "Биология", 3: "Физкультура", 4: "Английский язык", 5: "Физика", 6: "География" }, rooms: {1:"203", 2:"306", 3:"Спортзал", 4:"305", 5:"301", 6:"306"} },
        4: { name: "Четверг", short: "Чт", lessons: { 3: "Биология", 4: "Английский язык", 5: "История", 6: "Русский язык", 7: "Химия" }, rooms: {3:"203", 4:"305", 5:"210", 6:"308", 7:"316"} },
        5: { name: "Пятница", short: "Пт", lessons: { 3: "Химия", 4: "Алгебра", 5: "Русский язык", 6: "Английский язык", 7: "Литература", 8: "Геометрия" }, rooms: {3:"316", 4:"313", 5:"308", 6:"305", 7:"308", 8:"313"} }
    },
    {
        1: { name: "Понедельник", short: "Пн", lessons: { 0: "Разговоры о важном", 1: "Русский язык", 2: "Математика", 3: "Физкультура", 4: "Биология", 5: "География", 6: "Английский язык" }, rooms: {} },
        2: { name: "Вторник", short: "Вт", lessons: { 1: "Труд (технология)", 2: "Труд (технология)", 3: "Математика", 4: "Русский язык", 5: "Литература", 6: "История" }, rooms: {} },
        3: { name: "Среда", short: "Ср", lessons: { 1: "Русский язык", 2: "Математика", 3: "История", 4: "Физкультура", 5: "Литература" }, rooms: {} },
        4: { name: "Четверг", short: "Чт", lessons: { 1: "Музыка", 2: "Русский язык", 3: "Математика", 4: "ИЗО", 5: "Литература" }, rooms: {} },
        5: { name: "Пятница", short: "Пт", lessons: { 1: "Английский язык", 2: "История", 3: "Русский язык", 4: "Математика" }, rooms: {} }
    }
];

const canvas = document.getElementById('bg-canvas'); const ctx = canvas.getContext('2d');
const swiper = document.getElementById('swiper'); const pullIndicator = document.getElementById('pull-indicator'); const pullSvg = document.getElementById('pull-svg');
let startX = 0, startY = 0, currentTranslate = 0, prevTranslate = 0, isDragging = false, currentIdx = 0, dragDirection = null, lastHeartbeat = Date.now(), activePalette = null;

let blobs = []; let mouse = { x: null, y: null, targetX: null, targetY: null, active: false };
let matrixScale = 1, startHypot = 0, isZuming = false, lastTapTime = 0;
let panX = 0, panY = 0, startPanX = 0, startPanY = 0, isPanning = false;

const currentHour = new Date().getHours(); document.documentElement.setAttribute('data-theme', (currentHour < 7 || currentHour >= 19) ? 'dark' : 'light');
function parseTime(tStr) { let [h, m] = tStr.split(':').map(Number); return h * 60 + m; }

function selectRandomPalette() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const list = isDark ? darkPalettes : lightPalettes;
    activePalette = list[Math.floor(Math.random() * list.length)]; // СЛУЧАЙНЫЙ ВЫБОР ИЗ РАСШИРЕННОЙ БАЗЫ
    const soloColor = activePalette.colors[0]; // ЖЕСТКАЯ ФИКСАЦИЯ ИНДЕКСА ЦВЕТА НАВИГАЦИИ
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
    if (!activePalette) selectRandomPalette();
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
    const rect = canvas.getBoundingClientRect(); const clientX = e.touches.length ? e.touches[0].clientX : e.clientX; const clientY = e.touches.length ? e.touches[0].clientY : e.clientY;
    mouse.targetX = (clientX - rect.left) * (canvas.width / rect.width); mouse.targetY = (clientY - rect.top) * (canvas.height / rect.height);
}

window.addEventListener('touchstart', e => { 
    if(e.target.closest('.navigation-tabs')) return;
    if (e.touches.length === 2 && currentIdx === 1 && e.target.closest('.week-matrix-box')) {
        isZuming = true; isPanning = false; isDragging = false; const grid = document.getElementById('matrix-grid'); grid.style.transition = 'none';
        let rect = grid.getBoundingClientRect();
        let midX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
        let midY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;
        grid.style.transformOrigin = `${midX}px ${midY}px`;
        startHypot = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        return;
    }
    if (e.touches.length === 1) {
        if (currentIdx === 1 && e.target.closest('.week-matrix-box') && matrixScale > 1.05) {
            isPanning = true; isDragging = false; startPanX = e.touches[0].clientX - panX; startPanY = e.touches[0].clientY - panY; return;
        }
        isDragging = true; dragDirection = null; startX = e.touches[0].clientX; startY = e.touches[0].clientY;
        if (!e.target.closest('.lessons-list') && !e.target.closest('.week-matrix-box') && !e.target.closest('.switch-name-link')) { mouse.active = true; updateMousePos(e); }
    }
});
