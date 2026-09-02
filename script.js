const timeTable = [
    { num: 1, start: "08:30", end: "09:10" },
    { num: 2, start: "09:20", end: "10:00" },
    { num: 3, start: "10:20", end: "11:00" },
    { num: 4, start: "11:10", end: "11:50" },
    { num: 5, start: "12:10", end: "12:50" },
    { num: 6, start: "13:10", end: "13:50" },
    { num: 7, start: "14:00", end: "14:40" },
    { num: 8, start: "14:50", end: "15:30" }
];

const daysData = {
    1: { name: "Понедельник", short: "Пн", lessons: { 1: "Физика", 2: "Литература", 3: "История", 4: "Алгебра", 5: "Вероятность", 6: "Физкультура", 7: "Информатика" }, rooms: {1:"301", 2:"308", 3:"210", 4:"313", 5:"313", 6:"Спортзал", 7:"301"} },
    2: { name: "Вторник", short: "Вт", lessons: { 2: "География", 3: "Труд", 4: "История", 5: "Русский язык", 6: "Музыка", 7: "Алгебра", 8: "Геометрия" }, rooms: {2:"306", 3:"201", 4:"210", 5:"308", 6:"303", 7:"313", 8:"313"} },
    3: { name: "Среда", short: "Ср", lessons: { 1: "ОБЗР", 2: "Биология", 3: "Физкультура", 4: "Английский язык", 5: "Физика", 6: "География" }, rooms: {1:"203", 2:"306", 3:"Спортзал", 4:"305", 5:"301", 6:"306"} },
    4: { name: "Четверг", short: "Чт", lessons: { 3: "Биология", 4: "Английский язык", 5: "История", 6: "Русский язык", 7: "Химия" }, rooms: {3:"203", 4:"305", 5:"210", 6:"308", 7:"316"} },
    5: { name: "Пятница", short: "Пт", lessons: { 3: "Химия", 4: "Алгебра", 5: "Русский язык", 6: "Английский язык", 7: "Литература", 8: "Геометрия" }, rooms: {3:"316", 4:"313", 5:"308", 6:"305", 7:"308", 8:"313"} }
};

const currentHour = new Date().getHours();
document.documentElement.setAttribute('data-theme', (currentHour < 7 || currentHour >= 19) ? 'dark' : 'light');

document.getElementById('theme-toggle').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
    generateFluidBackground();
});

const swiper = document.getElementById('swiper');
let startX = 0, currentTranslate = 0, prevTranslate = 0, isDragging = false, currentIdx = 0;

window.addEventListener('touchstart', e => { startX = e.touches.clientX; isDragging = true; swiper.style.transition = 'none'; });
window.addEventListener('touchmove', e => {
    if (!isDragging) return;
    currentTranslate = prevTranslate + (e.touches.clientX - startX);
    swiper.style.transform = `translateX(${currentTranslate}px)`;
});
window.addEventListener('touchend', () => {
    if (!isDragging) return; isDragging = false;
    let movedBy = currentTranslate - prevTranslate;
    if (movedBy < -100 && currentIdx < 1) currentIdx++;
    if (movedBy > 100 && currentIdx > 0) currentIdx--;
    currentTranslate = currentIdx * -window.innerWidth; prevTranslate = currentTranslate;
    swiper.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    swiper.style.transform = `translateX(${currentTranslate}px)`;
    generateFluidBackground();
});

function buildMatrix() {
    const grid = document.getElementById('matrix-grid'); grid.innerHTML = '';
    let corner = document.createElement('div'); corner.className = 'matrix-cell header'; corner.innerText = '№'; grid.appendChild(corner);
    for (let d = 1; d <= 5; d++) {
        let cell = document.createElement('div'); cell.className = 'matrix-cell header'; cell.innerText = daysData[d].short; grid.appendChild(cell);
    }
    for (let l = 1; l <= 8; l++) {
        let numCell = document.createElement('div'); numCell.className = 'matrix-cell num-col'; numCell.innerText = l; grid.appendChild(numCell);
        for (let d = 1; d <= 5; d++) {
            let cell = document.createElement('div'); const name = daysData[d].lessons[l];
            cell.className = name ? 'matrix-cell' : 'matrix-cell empty';
            if (name) cell.innerText = name; grid.appendChild(cell);
        }
    }
}

const canvas = document.getElementById('bg-canvas'); const ctx = canvas.getContext('2d');
function resizeCanvas() { canvas.width = window.innerWidth * 1.1; canvas.height = window.innerHeight * 1.1; generateFluidBackground(); }

function generateFluidBackground() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const darkPalettes = [['#0f172a', '#1e1b4b', '#2e1065'], ['#022c22', '#064e3b', '#022c22'], ['#1e1b4b', '#311042', '#0f172a'], ['#1c1917', '#44403c', '#0c0a09']];
    const lightPalettes = [['#f8fafc', '#f1f5f9', '#cbd5e1'], ['#f4f4f9', '#e8e8f4', '#c8c8e6'], ['#fef7e0', '#fcebc4', '#f9d27d']];
    const list = isDark ? darkPalettes : lightPalettes; const palette = list[Math.floor(Math.random() * list.length)];
    let grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, palette); grad.addColorStop(0.5, palette); grad.addColorStop(1, palette);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
    for(let i=0; i<2; i++) {
        ctx.beginPath(); let x = Math.random() * canvas.width; let y = Math.random() * canvas.height; let r = Math.random() * (canvas.width / 2) + 100;
        let radGrad = ctx.createRadialGradient(x, y, 10, x, y, r); radGrad.addColorStop(0, isDark ? 'rgba(0,255,204,0.08)' : 'rgba(255,59,48,0.05)'); radGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrad; ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
}

document.getElementById('bg-generate').addEventListener('click', generateFluidBackground);
window.addEventListener('resize', resizeCanvas);
window.addEventListener('deviceorientation', e => {
    if (!e.gamma || !e.beta) return;
    let x = e.gamma / 3, y = e.beta / 3; canvas.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
    document.getElementById('header1').style.transform = `translate(${-x/2}px, ${-y/2}px)`;
    document.getElementById('header2').style.transform = `translate(${-x/2}px, ${-y/2}px)`;
});

function parseTime(tStr) { let [h, m] = tStr.split(':').map(Number); return h * 60 + m; }

function updateLogic() {
    const now = new Date(); let day = now.getDay(), currentMinutes = now.getHours() * 60 + now.getMinutes();
    let isWeekend = (day === 0 || day === 6), targetDay = day;
    if (!isWeekend && daysData[day]) {
        const lastLessonNum = Math.max(...Object.keys(daysData[day].lessons).map(Number));
        const lastLessonEnd = parseTime(timeTable[lastLessonNum - 1].end);
        if (currentMinutes > lastLessonEnd) { targetDay = day + 1; if (targetDay > 5) targetDay = 1; }
    } else if (isWeekend) { targetDay = 1; }
    const isDisplayingToday = (targetDay === day); const activeDayInfo = daysData[targetDay];
    document.getElementById('day-title').innerText = isDisplayingToday ? `Сегодня (${activeDayInfo.name})` : `Расписание на завтра (${activeDayInfo.name})`;
    const listContainer = document.getElementById('day-lessons'); listContainer.innerHTML = '';
    let activeLessonId = null, currentStatusText = "Уроки закончены", timeDiffText = "--:--", subText = "Хорошего отдыха!";

    if (isDisplayingToday && daysData[day]) {
        const todayLessons = daysData[day].lessons;
        const firstLessonNum = Math.min(...Object.keys(todayLessons).map(Number));
        const firstLessonStart = parseTime(timeTable[firstLessonNum - 1].start);
        if (currentMinutes < firstLessonStart) {
            currentStatusText = "До начала уроков"; let diff = firstLessonStart - currentMinutes;
            timeDiffText = `${Math.floor(diff / 60)}ч ${diff % 60}м`; subText = `Первый урок: ${todayLessons[firstLessonNum]}`;
        } else {
            for (let lNum of Object.keys(todayLessons).map(Number)) {
                let tBox = timeTable[lNum - 1];
                if (currentMinutes >= parseTime(tBox.start) && currentMinutes <= parseTime(tBox.end)) {
                    activeLessonId = lNum; currentStatusText = `Идет ${lNum}-й урок`;
                    timeDiffText = `${parseTime(tBox.end) - currentMinutes} мин`; subText = `До конца урока: ${todayLessons[lNum]}`; break;
                }
            }
            if (!activeLessonId) {
                const lessonsKeys = Object.keys(todayLessons).map(Number).sort();
                for (let i = 0; i < lessonsKeys.length - 1; i++) {
                    let currEnd = parseTime(timeTable[lessonsKeys[i] - 1].end); let nextStart = parseTime(timeTable[lessonsKeys[i+1] - 1].start);
                    if (currentMinutes > currEnd && currentMinutes < nextStart) {
                        currentStatusText = "Перемена"; timeDiffText = `${nextStart - currentMinutes} мин`;
                        subText = `Следующий: ${todayLessons[lessonsKeys[i+1]]}`; break;
                    }
                }
            }
        }
    } else { currentStatusText = "Уроки завершены"; timeDiffText = "Отдых"; subText = `Следующий день: ${activeDayInfo.name}`; }
    document.getElementById('timer-label').innerText = currentStatusText; document.getElementById('timer-time').innerText = timeDiffText; document.getElementById('timer-sub').innerText = subText;
    for (let slot = 1; slot <= 8; slot++) {
        const name = activeDayInfo.lessons[slot]; if (!name) continue;
        const row = document.createElement('div'); row.className = `lesson-row ${activeLessonId === slot ? 'active' : ''}`;
        row.innerHTML = `<div class="lesson-left"><div class="lesson-num">${slot}</div><div class="lesson-name">${name}</div></div><div class="lesson-meta"><div>каб. ${activeDayInfo.rooms[slot]}</div><div style="font-size:11px; opacity:0.6">${timeTable[slot-1].start}</div></div>`;
        listContainer.appendChild(row);
    }
}
buildMatrix(); resizeCanvas(); updateLogic(); setInterval(updateLogic, 20000);
