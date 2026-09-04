let currentUser = 0;
const allPalettes = [
    { base: '#040209', colors: ['#ff0055', '#00ffcc', '#9900ff', '#ffaa00'] },
    { base: '#01030d', colors: ['#0072ff', '#00f6ff', '#7000ff', '#ff00aa'] },
    { base: '#010501', colors: ['#00ff66', '#a8ff78', '#78ffd6', '#0052d4'] },
    { base: '#090202', colors: ['#ff3300', '#ff0055', '#ffcc00', '#9900ff'] },
    { base: '#020709', colors: ['#00f2fe', '#4facfe', '#0000ff', '#00ffcc'] },
    { base: '#06010a', colors: ['#b92b27', '#1565c0', '#7000ff', '#ff007f'] },
    { base: '#030303', colors: ['#ea00d9', '#711c91', '#0abdc6', '#091833'] },
    { base: '#05020c', colors: ['#fe5f75', '#fc9842', '#ff0055', '#7a00ff'] },
    { base: '#010604', colors: ['#00ffcc', '#38ef7d', '#11998e', '#00f6ff'] },
    { base: '#040209', colors: ['#ff0055', '#38ef7d', '#0072ff', '#ffaa00'] }, 
    { base: '#040209', colors: ['#00f6ff', '#ff007f', '#7000ff', '#00ffcc'] },
    { base: '#040209', colors: ['#ff5e00', '#ff0055', '#ffcc00', '#ff00ff'] },
    { base: '#040209', colors: ['#11998e', '#38ef7d', '#00ffcc', '#0072ff'] },
    { base: '#040209', colors: ['#7f00ff', '#ff007f', '#ff0055', '#9900ff'] } 
];

const timeTable = [
    { num: 0, start: "8:00", end: "8:25" },
    { num: 1, start: "8:30", end: "9:10" }, { num: 2, start: "9:20", end: "10:00" },
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
let blobs = [], mouse = { x: null, y: null, targetX: null, targetY: null, active: false };
let matrixScale = 1, startHypot = 0, isZuming = false, lastTapTime = 0, panX = 0, panY = 0, startPanX = 0, startPanY = 0, isPanning = false, gyroX = 0, gyroY = 0;
const currentHour = new Date().getHours(); document.documentElement.setAttribute('data-theme', (currentHour < 7 || currentHour >= 19) ? 'dark' : 'light');
function parseTime(tStr) { let [h, m] = tStr.split(':').map(Number); return h * 60 + m; }
function selectRandomPalette() {
    activePalette = allPalettes[Math.floor(Math.random() * allPalettes.length)];
    const soloColor = activePalette.colors[0];
    document.documentElement.style.setProperty('--accent', soloColor);
    document.documentElement.style.setProperty('--neon-glow', soloColor + '66');
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
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = activePalette.base + '25'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'screen';
    blobs.forEach((blob) => {
        blob.x += blob.vx; blob.y += blob.vy;
        if (blob.x < -100 || blob.x > canvas.width + 100) blob.vx *= -1;
        if (blob.y < -100 || blob.y > canvas.height + 100) blob.vy *= -1;
        ctx.save(); let radialGrad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
        radialGrad.addColorStop(0, blob.color + '99'); radialGrad.addColorStop(0.3, blob.color + '22'); radialGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = radialGrad; ctx.beginPath(); ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    });
    requestAnimationFrame(renderLoop);
}
function updateMousePos(e) {
    const rect = canvas.getBoundingClientRect(); const clientX = e.touches.length ? e.touches[0].clientX : e.clientX; const clientY = e.touches.length ? e.touches[0].clientY : e.clientY;
    mouse.targetX = (clientX - rect.left) * (canvas.width / rect.width); mouse.targetY = (clientY - rect.top) * (canvas.height / rect.height);
}
window.addEventListener('deviceorientation', e => {
    if (!e.gamma || !e.beta) return;
    gyroY = Math.min(Math.max(e.gamma / 1.5, -15), 15); gyroX = Math.min(Math.max((e.beta - 50) / 1.5, -15), 15);
    document.querySelectorAll('.timer-card, .day-schedule-box, .week-matrix-box').forEach(card => {
        card.style.transform = `rotateX(${gyroX}deg) rotateY(${gyroY}deg) translateZ(10px)`;
    });
});
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

window.addEventListener('touchmove', e => {
    if (isZuming && e.touches.length === 2 && currentIdx === 1) {
        e.preventDefault();
        let currentHypot = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        let factor = currentHypot / (startHypot || 1); matrixScale = Math.min(Math.max(matrixScale * factor, 1.0), 2.5); 
        document.getElementById('matrix-grid').style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${matrixScale})`; startHypot = currentHypot; return;
    }
    if (isPanning && e.touches.length === 1 && matrixScale > 1.05 && currentIdx === 1) {
        e.preventDefault(); panX = e.touches[0].clientX - startPanX; panY = e.touches[0].clientY - startPanY;
        document.getElementById('matrix-grid').style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${matrixScale})`; return;
    }
    if (!isDragging || e.touches.length > 1) return;
    let diffX = e.touches[0].clientX - startX, diffY = e.touches[0].clientY - startY;
    if (!dragDirection) {
        if (Math.abs(diffX) > Math.abs(diffY) + 15) dragDirection = 'horizontal';
        else if (diffY > 15 && currentIdx === 0 && document.querySelector('.lessons-list').scrollTop <= 1) dragDirection = 'pull';
    }
    if (dragDirection === 'horizontal') { currentTranslate = prevTranslate + diffX; swiper.style.transform = `translateX(${currentTranslate}px)`; }
    else if (dragDirection === 'pull') { e.preventDefault(); let pullDistance = Math.min(diffY * 0.4, 90); pullIndicator.style.transform = `translate3d(-50%,${pullDistance}px, 0)`; pullIndicator.style.opacity = Math.min(pullDistance / 60, 1); pullSvg.style.transform = `rotate(${pullDistance * 4}deg)`; }
}, { passive: false });

window.addEventListener('touchend', () => {
    isDragging = false; isZuming = false; isPanning = false; mouse.active = false;
    if (dragDirection === 'horizontal') { let movedBy = currentTranslate - prevTranslate; if (movedBy < -80 && currentIdx < 1) currentIdx++; if (movedBy > 80 && currentIdx > 0) currentIdx--; switchScreen(currentIdx); }
    else if (dragDirection === 'pull') { let lastY = parseFloat(pullIndicator.style.transform.replace(/[^0-9.]/g,'')) || 0; pullIndicator.style.transition = 'all 0.3s ease'; if (lastY > 55) { pullIndicator.classList.add('refreshing'); pullIndicator.style.transform = 'translate3d(-50%, 60px, 0)'; setTimeout(() => location.reload(true), 600); } else { pullIndicator.style.transform = 'translate3d(-50%, 0, 0)'; pullIndicator.style.opacity = '0'; } }
});

function switchScreen(index) {
    currentIdx = index; currentTranslate = currentIdx * -window.innerWidth; prevTranslate = currentTranslate;
    const sDay = document.getElementById('slide-day'), sWeek = document.getElementById('slide-week');
    sDay.style.transition = sWeek.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'; swiper.style.transform = 'none';
    if (index === 0) { sDay.style.transform = 'translate3d(0,0,0) rotateY(0deg)'; sDay.style.opacity = '1'; sWeek.style.transform = 'translate3d(100%,0,-300px) rotateY(90deg)'; sWeek.style.opacity = '0'; }
    else { sDay.style.transform = 'translate3d(-100%,0,-300px) rotateY(-90deg)'; sDay.style.opacity = '0'; sWeek.style.transform = 'translate3d(-100%,0,0) rotateY(0deg)'; sWeek.style.opacity = '1'; }
    const shift = (document.querySelector('.navigation-tabs').offsetWidth - 12) / 2;
    document.getElementById('nav-carriage').style.transform = `translateX(${index * shift}px)`;
    document.querySelectorAll('.tab-btn').forEach((btn, i) => btn.classList.toggle('active', i === index));
}
function buildMatrix() {
    const grid = document.getElementById('matrix-grid'); grid.innerHTML = '';
    let currentData = schedules[currentUser];
    let corner = document.createElement('div'); corner.className = 'matrix-cell header'; corner.innerText = '№'; grid.appendChild(corner);
    for (let d = 1; d <= 5; d++) { let cell = document.createElement('div'); cell.className = 'matrix-cell header'; cell.innerText = currentData[d].short; grid.appendChild(cell); }
    for (let l = 0; l <= 8; l++) {
        let numCell = document.createElement('div'); numCell.className = 'matrix-cell num-col'; numCell.innerText = l; grid.appendChild(numCell);
        for (let d = 1; d <= 5; d++) {
            let cell = document.createElement('div'); const name = currentData[d].lessons[l]; cell.className = name ? 'matrix-cell' : 'matrix-cell empty';
            if (name) { cell.innerText = name; if (name.length > 11) cell.style.fontSize = '7px'; if (name.length > 14) cell.style.fontSize = '6px'; }
            grid.appendChild(cell);
        }
    }
}

window.addEventListener('click', e => { 
    if (e.target.closest('.navigation-tabs') || e.target.closest('.lessons-list') || e.target.closest('.cyber-rest-box')) return; 
    let nameLink = e.target.closest('.switch-name-link');
    if (nameLink) { currentUser = currentUser === 0 ? 1 : 0; nameLink.innerText = currentUser === 0 ? "Кирилла" : "Жени"; buildMatrix(); updateLogic(); return; }
    if (e.target.closest('.week-matrix-box')) {
        let currentTime = Date.now(); let tapLength = currentTime - lastTapTime;
        if (tapLength < 300 && tapLength > 0) { matrixScale = 1; panX = 0; panY = 0; const grid = document.getElementById('matrix-grid'); grid.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'; grid.style.transform = 'translate3d(0, 0, 0) scale(1)'; e.preventDefault(); return; }
        lastTapTime = currentTime;
    }
    activePalette = null; selectRandomPalette(); 
});

function updateLogic() {
    const now = new Date(); let day = now.getDay(), currentMinutes = now.getHours() * 60 + now.getMinutes(), currentSecs = now.getSeconds();
    if (Date.now() - lastHeartbeat > 120000) document.getElementById('outdated-badge').classList.add('show'); lastHeartbeat = Date.now();
    let currentData = schedules[currentUser], isWeekend = (day === 0 || day === 6), targetDay = day;
    if (!isWeekend && currentData[day]) {
        const lastLessonNum = Math.max(...Object.keys(currentData[day].lessons).map(Number));
        if (currentMinutes > parseTime(timeTable.find(t=>t.num===lastLessonNum).end)) { targetDay = day + 1; if (targetDay > 5) targetDay = 1; }
    } else if (isWeekend) { targetDay = 1; }
    const isDisplayingToday = (targetDay === day), activeDayInfo = currentData[targetDay];
    document.getElementById('day-title').innerText = isDisplayingToday ? `Сегодня (${activeDayInfo.name})` : `Расписание на след. уч. день (${activeDayInfo.name})`;
    const listContainer = document.getElementById('day-lessons'); listContainer.innerHTML = '';
    let activeLessonId = null, currentStatusText = "Уроки закончены", timeDiffText = "--:--", subText = "Хорошего отдыха!", lessonProgressPercent = 0, currentBreakTimePassed = 0, currentBreakTotal = 1;
    if (isDisplayingToday && currentData[day]) {
        const todayLessons = currentData[day].lessons, firstLessonNum = Math.min(...Object.keys(todayLessons).map(Number)), firstLessonStart = parseTime(timeTable.find(t=>t.num===firstLessonNum).start);
        if (currentMinutes < firstLessonStart) {
            let totalSecsDiff = (firstLessonStart * 60) - (currentMinutes * 60 + currentSecs);
            currentStatusText = "До начала уроков"; 
            if (totalSecsDiff < 60) { timeDiffText = `${totalSecsDiff} сек`; }
            else { let diff = firstLessonStart - currentMinutes; timeDiffText = diff >= 60 ? `${Math.floor(diff / 60)} ч. ${diff % 60} мин.` : `${diff} мин.`; }
            subText = `Первый урок: ${todayLessons[firstLessonNum]}`;
        } else {
            for (let lNum of Object.keys(todayLessons).map(Number)) {
                let tBox = timeTable.find(t=>t.num===lNum); let startM = parseTime(tBox.start), endM = parseTime(tBox.end);
                if (currentMinutes >= startM && currentMinutes <= endM) {
                    activeLessonId = lNum; currentStatusText = `Идет ${lNum === 0 ? '0-й' : lNum + '-й'} урок`;
                    let totalSecsDiff = (endM * 60) - (currentMinutes * 60 + currentSecs);
                    timeDiffText = totalSecsDiff < 60 ? `${totalSecsDiff} сек` : `${endM - currentMinutes} мин.`;
                    subText = `До конца урока: ${todayLessons[lNum]}`;
                    lessonProgressPercent = (currentMinutes * 60 + currentSecs - startM * 60) / (endM * 60 - startM * 60); break;
                }
            }
            if (activeLessonId === null) {
                const lessonsKeys = Object.keys(todayLessons).map(Number).sort();
                for (let i = 0; i < lessonsKeys.length - 1; i++) {
                    let currEnd = parseTime(timeTable.find(t=>t.num===lessonsKeys[i]).end), nextStart = parseTime(timeTable.find(t=>t.num===lessonsKeys[i+1]).start);
                    if (currentMinutes > currEnd && currentMinutes < nextStart) {
                        let totalSecsDiff = (nextStart * 60) - (currentMinutes * 60) - currentSecs;
                        let minsLeft = Math.ceil(totalSecsDiff / 60);
                        currentStatusText = "До конца перемены";
                        timeDiffText = totalSecsDiff < 60 ? `${totalSecsDiff} сек` : `${minsLeft} мин.`;
                        subText = `Следующий: ${todayLessons[lessonsKeys[i+1]]}`;
                        currentBreakTotal = nextStart - currEnd; currentBreakTimePassed = currentMinutes - currEnd; break;
                    }
                }
            }
        }
    } else { currentStatusText = "Уроки завершены"; timeDiffText = `<div class="cyber-rest-box"><div class="cyber-rest-status">ЧИИИЛ!!</div></div>`; subText = `Следующий день: ${activeDayInfo.name}`; }
    document.getElementById('timer-label').innerText = currentStatusText; document.getElementById('timer-time').innerHTML = timeDiffText; document.getElementById('timer-sub').innerText = subText;
    const activeLessonsKeys = Object.keys(activeDayInfo.lessons).map(Number).sort((a,b)=>a-b);
    for (let idx = 0; idx < activeLessonsKeys.length; idx++) {
        const slot = activeLessonsKeys[idx]; const name = activeDayInfo.lessons[slot];
        const row = document.createElement('div'); row.className = `lesson-row ${activeLessonId === slot ? 'active' : ''}`;
        const currentSlotTime = timeTable.find(t => t.num === slot);
        let progressHTML = '', roomHTML = '', breakBadgeHTML = '';
        if (activeLessonId === slot) { progressHTML = `<div class="lesson-progress-fill" style="width: ${(lessonProgressPercent * 100).toFixed(1)}%"></div>`; }
        if (activeDayInfo.rooms && activeDayInfo.rooms[slot]) { roomHTML = `<div class="lesson-room-sub">каб. ${activeDayInfo.rooms[slot]}</div>`; }
        if (idx < activeLessonsKeys.length - 1) {
            const nextSlot = activeLessonsKeys[idx + 1]; const nextSlotTime = timeTable.find(t => t.num === nextSlot);
            if (currentSlotTime && nextSlotTime) {
                let breakDuration = parseTime(nextSlotTime.start) - parseTime(currentSlotTime.end);
                if (breakDuration > 0) {
                    let arcOffset = 88; let isThisBreakNow = (isDisplayingToday && currentMinutes > parseTime(currentSlotTime.end) && currentMinutes < parseTime(nextSlotTime.start));
                    let currentOffset = isThisBreakNow ? arcOffset - (arcOffset * (((currentBreakTimePassed * 60) + currentSecs) / (currentBreakTotal * 60))) : arcOffset;
                    breakBadgeHTML = `<div class="break-radial-container"><svg class="break-radial-svg" viewBox="0 0 32 32"><circle class="break-radial-bg" cx="16" cy="16" r="14"/><circle class="break-radial-track" cx="16" cy="16" r="14" stroke-dasharray="${arcOffset}" stroke-dashoffset="${currentOffset}"/></svg><span class="break-radial-num">${breakDuration}</span></div>`;
                }
            }
        } else { breakBadgeHTML = `<div class="break-radial-spacer"></div>`; }
        row.innerHTML = `${progressHTML}<div class="lesson-left"><div class="lesson-title-block"><div class="lesson-num">${slot}</div><div class="lesson-name">${name}</div></div>${roomHTML}</div><div class="lesson-meta"><div class="lesson-time-row"><span>${currentSlotTime ? currentSlotTime.start : "--:--"}</span>${breakBadgeHTML}</div></div>`;
        listContainer.appendChild(row);
    }
}
function resizeCanvas() { canvas.width = window.innerWidth * 1.2; canvas.height = window.innerHeight * 1.2; }
buildMatrix(); resizeCanvas(); selectRandomPalette(); updateLogic(); setInterval(updateLogic, 1000); window.addEventListener('resize', resizeCanvas); renderLoop();
