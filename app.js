const HASHED_KEY = "accdb61253228627734b63ffdb49dd2dc708425b07e5fb618d92f46f342ca0be";

const BG_ALGO = {
    morning: "https://unsplash.com",
    day: "https://unsplash.com",
    evening: "https://unsplash.com",
    night: "https://unsplash.com"
};

const BG_MODES = ['auto', 'morning', 'day', 'evening', 'night'];

// Функция мгновенного шифрования в браузере
async function hashKey(str) {
    const utf8 = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');
}

function getBgByTime() {
    const hr = new Date().getHours();
    if (hr >= 6 && hr < 12) return BG_ALGO.morning;
    if (hr >= 12 && hr < 17) return BG_ALGO.day;
    if (hr >= 17 && hr < 22) return BG_ALGO.evening;
    return BG_ALGO.night;
}

function applyBackground() {
    const bgContainer = document.getElementById('parallax-bg');
    const mode = localStorage.getItem('bg_mode') || 'auto';
    if(bgContainer) bgContainer.style.backgroundImage = "url('" + (mode === 'auto' ? getBgByTime() : BG_ALGO[mode]) + "')";
}

function initUX() {
    const themeBtn = document.getElementById('theme-toggle');
    const bgBtn = document.getElementById('bg-toggle');
    const bgContainer = document.getElementById('parallax-bg');

    if(localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-theme');
    applyBackground();

    if(themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
        });
    }

    if(bgBtn) {
        bgBtn.addEventListener('click', () => {
            let cur = BG_MODES.indexOf(localStorage.getItem('bg_mode') || 'auto');
            let next = (cur + 1) % BG_MODES.length;
            localStorage.setItem('bg_mode', BG_MODES[next]);
            applyBackground();
        });
    }

    if(bgContainer) {
        if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== 'function') {
            window.addEventListener('deviceorientation', (e) => {
                const x = Math.min(Math.max(e.gamma, -15), 15) * 0.8;
                const y = Math.min(Math.max(e.beta - 45, -15), 15) * 0.8;
                bgContainer.style.transform = "translate3d(" + x + "px, " + y + "px, 0) scale(1.05)";
            });
        } else {
            window.addEventListener('mousemove', (e) => {
                const x = (e.clientX - window.innerWidth / 2) * 0.03;
                const y = (e.clientY - window.innerHeight / 2) * 0.03;
                bgContainer.style.transform = "translate3d(" + x + "px, " + y + "px, 0) scale(1.05)";
            });
        }
    }
}

const loginForm = document.getElementById('login-form');
const appContent = document.getElementById('app-content');
const navPanel = document.getElementById('nav-panel');
const passField = document.getElementById('pass-field');
const submitBtn = document.getElementById('submit-pass');

function startApp() {
    if(loginForm) loginForm.style.display = 'none';
    if(appContent) appContent.style.display = 'flex';
    if(navPanel) navPanel.style.display = 'flex';
    initUX();
    updateTracker();
    setInterval(updateTracker, 1000);
}

// Проверка: если хэш совпадает со старой сессией — пускаем сразу
if (localStorage.getItem('school_access_hash') === HASHED_KEY) {
    startApp();
} else {
    if(submitBtn && passField) {
        submitBtn.addEventListener('click', async () => {
            const inputHash = await hashKey(passField.value); // Шифруем введенный текст
            if (inputHash === HASHED_KEY) {
                localStorage.setItem('school_access_hash', HASHED_KEY);
                startApp();
            } else {
                alert('Неверный семейный пароль!');
                passField.value = '';
            }
        });
        passField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submitBtn.click();
        });
    }
}

const timeSlots = [
    { number: 1, start: "08:30", end: "09:10", breakAfter: 10 },
    { number: 2, start: "09:20", end: "10:00", breakAfter: 20 },
    { number: 3, start: "10:20", end: "11:00", breakAfter: 10 },
    { number: 4, start: "11:10", end: "11:50", breakAfter: 20 },
    { number: 5, start: "12:10", end: "12:50", breakAfter: 20 },
    { number: 6, start: "13:10", end: "13:50", breakAfter: 10 },
    { number: 7, start: "14:00", end: "14:40", breakAfter: 10 },
    { number: 8, start: "14:50", end: "15:30", breakAfter: 10 },
    { number: 9, start: "15:40", end: "16:20", breakAfter: 0 }
];

const weeklyLessons = {
    1: { 1: "Физика (каб. 301)", 2: "Литература (каб. 308)", 3: "История (каб. 210)", 4: "Алгебра (каб. 313)", 5: "Вероятность (каб. 313)", 6: "Физкультура (спорт.зал)", 7: "Информатика (каб. 301)" },
    2: { 2: "География (каб. 306)", 3: "Труд (каб. 201)", 4: "История (каб. 210)", 5: "Русский язык (каб. 308)", 6: "Музыка (каб. 303)", 7: "Алгебра (каб. 313)", 8: "Геометрия (каб. 313)" },
    3: { 1: "ОБЗР (каб. 301)", 2: "Биология (каб. 203)", 3: "Физкультура (спорт.зал)", 4: "Англ.язык (каб. 305)", 5: "Физика (каб. 301)", 6: "География (каб. 306)" },
    4: { 3: "Биология (каб. 203)", 4: "Англ.язык (каб. 305)", 5: "История (каб. 210)", 6: "Русский язык (каб. 308)", 7: "Химия (каб. 316)" },
    5: { 3: "Химия (каб. 316)", 4: "Алгебра (каб. 313)", 5: "Русский язык (каб. 308)", 6: "Англ.язык (каб. 305)", 7: "Литература (каб. 308)", 8: "Геометрия (каб. 313)" }
};

function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function formatRemainingTime(secondsTotal) {
    const hours = Math.floor(secondsTotal / 3600);
    const minutes = Math.floor((secondsTotal % 3600) / 60);
    const seconds = secondsTotal % 60;
    const secStr = (seconds < 10 ? "0" : "") + seconds + " сек.";
    if (hours > 0) {
        return hours + " ч. " + minutes + " мин. <br><span style='font-size:22px; opacity:0.7; font-weight:700;'>" + secStr + "</span>";
    }
    return minutes + " мин. " + (seconds < 10 ? "0" : "") + seconds + " сек.";
}

function setStatusColors(type, secondsLeft = 9999) {
    const root = document.documentElement;
    if (type === 'lesson') {
        if (secondsLeft <= 300) {
            root.style.setProperty('--status-color', '#ff9f1c');
            root.style.setProperty('--border-glow', 'rgba(255, 159, 28, 0.4)');
        } else {
            root.style.setProperty('--status-color', 'var(--accent)');
            root.style.setProperty('--border-glow', 'rgba(255, 255, 255, 0.6)');
        }
    } else if (type === 'break') {
        root.style.setProperty('--status-color', '#34c759');
        root.style.setProperty('--border-glow', 'rgba(52, 199, 89, 0.4)');
    } else {
        root.style.setProperty('--status-color', '#8e8e93');
        root.style.setProperty('--border-glow', 'transparent');
    }
}

function renderScheduleTable(dayNum, isTomorrow) {
    const listContainer = document.getElementById('schedule-list');
    const titleContainer = document.getElementById('list-title');
    const daysText = {1:"Понедельник", 2:"Вторник", 3:"Среда", 4:"Четверг", 5:"Пятница"};
    if (titleContainer) titleContainer.innerText = (isTomorrow ? "Завтра: " : "Сегодня: ") + daysText[dayNum];
    const lessons = weeklyLessons[dayNum] || {};
    let html = "";
    timeSlots.forEach(slot => {
        const name = lessons[slot.number];
        if (name) {
            let activeClass = "";
            if (!isTomorrow) {
                const now = new Date();
                const curSec = (now.getHours()*60 + now.getMinutes())*60 + now.getSeconds();
                if (curSec >= timeToMinutes(slot.start)*60 && curSec < timeToMinutes(slot.end)*60) activeClass = " active-now";
            }
            html += '<div class="schedule-item' + activeClass + '"><span class="lesson-text">' + slot.number + '. ' + name + '</span><span class="time-text">' + slot.start + ' - ' + slot.end + '</span></div>';
        }
    });
    if (listContainer) listContainer.innerHTML = html;
}

function updateTracker() {
    const now = new Date();
    let dayOfWeek = now.getDay();
    const currentTimeDisplay = document.getElementById('current-time-display');
    if(currentTimeDisplay) currentTimeDisplay.innerText = now.toLocaleDateString('ru-RU', { weekday: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (dayOfWeek === 0 || dayOfWeek === 6) {
        document.getElementById('c1-title').innerText = "Выходные дни";
        document.getElementById('c1-timer').innerText = "🎉";
        document.getElementById('c1-break').innerText = "Отдых";
        setStatusColors('rest');
        renderScheduleTable(1, true);
        return;
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const totalCurrentSeconds = currentMinutes * 60 + now.getSeconds();
    const todayLessons = weeklyLessons[dayOfWeek] || {};
    const lessonNumbers = Object.keys(todayLessons).map(Number).sort((a,b)=>a-b);
    const lastLessonNum = lessonNumbers[lessonNumbers.length - 1];
    const lastSlot = timeSlots.find(s => s.number === lastLessonNum);
    const schoolEndSec = timeToMinutes(lastSlot.end) * 60;

    if (totalCurrentSeconds >= schoolEndSec) {
        let nextDay = dayOfWeek + 1;
        if (nextDay > 5) nextDay = 1;
        renderScheduleTable(nextDay, true);
    } else {
        renderScheduleTable(dayOfWeek, false);
    }
    processChildSchedule(totalCurrentSeconds, todayLessons, lessonNumbers, schoolEndSec);
}

function processChildSchedule(totalCurrentSeconds, todayLessons, lessonNumbers, schoolEndSec) {
    const prefix = 'c1';
    const firstLessonNum = lessonNumbers;
    const firstSlot = timeSlots.find(s => s.number === firstLessonNum);
    const schoolStartSec = timeToMinutes(firstSlot.start) * 60;

    if (totalCurrentSeconds < schoolStartSec) {
        const diff = schoolStartSec - totalCurrentSeconds;
        document.getElementById(prefix + '-title').innerText = "До начала занятий (" + todayLessons[firstLessonNum] + ")";
        document.getElementById(prefix + '-timer').innerHTML = formatRemainingTime(diff);
        document.getElementById(prefix + '-break').innerText = "Первый урок в " + firstSlot.start;
        setStatusColors('rest');
        return;
    }

    if (totalCurrentSeconds >= schoolEndSec) {
        document.getElementById(prefix + '-title').innerText = "Уроки окончены";
        document.getElementById(prefix + '-timer').innerText = "🏡 Домой";
        document.getElementById(prefix + '-break').innerText = "Все занятия на сегодня завершены";
        setStatusColors('rest');
        return;
    }

    for (let i = 0; i < timeSlots.length; i++) {
        const slot = timeSlots[i];
        const slotStartSec = timeToMinutes(slot.start) * 60;
        const slotEndSec = timeToMinutes(slot.end) * 60;
        const lessonName = todayLessons[slot.number];

        if (totalCurrentSeconds >= slotStartSec && totalCurrentSeconds < slotEndSec) {
            const diff = slotEndSec - totalCurrentSeconds;
            if (lessonName) {
                document.getElementById(prefix + '-title').innerText = "Сейчас: " + lessonName;
                document.getElementById(prefix + '-timer').innerText = formatRemainingTime(diff);
                const nextLessonNum = lessonNumbers.find(num => num > slot.number);
                document.getElementById(prefix + '-break').innerText = nextLessonNum ? "Перемена: " + slot.breakAfter + " мин. \nДалее: " + todayLessons[nextLessonNum] : "Перемена: " + slot.breakAfter + " мин. (Последний урок!)";
                setStatusColors('lesson', diff);
            } else {
                document.getElementById(prefix + '-title').innerText = "Свободное время (Окно)";
                document.getElementById(prefix + '-timer').innerText = formatRemainingTime(diff);
                const nextLessonNum = lessonNumbers.find(num => num > slot.number);
                document.getElementById(prefix + '-break').innerText = nextLessonNum ? "Далее: " + todayLessons[nextLessonNum] : "Скоро домой";
                setStatusColors('rest');
            }
            return;
        }

        if (i < timeSlots.length - 1) {
            const nextSlot = timeSlots[i + 1];
            const nextSlotStartSec = timeToMinutes(nextSlot.start) * 60;

            if (totalCurrentSeconds >= slotEndSec && totalCurrentSeconds < nextSlotStartSec) {
                const diff = nextSlotStartSec - totalCurrentSeconds;
                const nextLessonNum = lessonNumbers.find(num => num > slot.number);
                document.getElementById(prefix + '-title').innerText = "Идет перемена";
                document.getElementById(prefix + '-timer').innerText = formatRemainingTime(diff);
                document.getElementById(prefix + '-break').innerText = nextLessonNum ? "Далее: " + todayLessons[nextLessonNum] : "Идем домой!";
                setStatusColors('break');
                return;
            }
        }
    }
}
