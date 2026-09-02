const HASHED_KEY = "accdb61253228627734b63ffdb49dd2dc708425b07e5fb618d92f46f342ca0be";

// AI и стоковые фоны на выбор
const BACKGROUNDS = {
    none: "",
    panel: "url('https://easy-peasy.ai')",
    cars: "url('https://dreamstime.com')",
    mc: "url('https://lacasadellafibra.com')"
};

async function hashKey(string) {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function checkAccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const keyFromUrl = urlParams.get('key');
    if (keyFromUrl) {
        const hashedInput = await hashKey(keyFromUrl);
        if (hashedInput === HASHED_KEY) {
            localStorage.setItem('school_access_hash', HASHED_KEY);
            window.history.replaceState({}, document.title, window.location.pathname);
            return true;
        }
    }
    return localStorage.getItem('school_access_hash') === HASHED_KEY;
}

// Переключатели кастомизации
function initThemeAndBgs() {
    const themeBtn = document.getElementById('theme-toggle');
    const bgSelect = document.getElementById('bg-selector');
    
    // Проверка сохраненных настроек
    if(localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-theme');
    const savedBg = localStorage.getItem('bg_type') || 'none';
    bgSelect.value = savedBg;
    document.body.style.backgroundImage = BACKGROUNDS[savedBg];

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });

    bgSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        document.body.style.backgroundImage = BACKGROUNDS[val];
        localStorage.setItem('bg_type', val);
    });
}

// Запуск системы
async function init() {
    document.getElementById('loading-screen').style.display = 'none';
    if (await checkAccess()) {
        document.getElementById('app-screen').style.display = 'block';
        initThemeAndBgs();
        updateTracker();
        setInterval(updateTracker, 1000);
    } else {
        document.body.innerHTML = "<div style='text-align:center; margin-top:100px;'><h1 style='font-size:48px; margin-bottom:10px;'>404</h1><p style='color:#666;'>Страница не найдена или доступ ограничен.</p></div>";
    }
}
init();

// БАЗА ДАННЫХ
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
    const minutes = Math.floor(secondsTotal / 60);
    const seconds = secondsTotal % 60;
    return minutes + " мин. " + (seconds < 10 ? "0" : "") + seconds + " сек.";
}

// Динамические статусы-цвета
function setStatusColors(type, secondsLeft = 9999) {
    const root = document.documentElement;
    if (type === 'lesson') {
        if (secondsLeft <= 300) { // Меньше 5 минут до конца урока
            root.style.setProperty('--status-color', '#ff9f1c'); // Оранжевый
            root.style.setProperty('--border-glow', '#ff9f1c');
        } else {
            root.style.setProperty('--status-color', '#4a90e2'); // Модный синий
            root.style.setProperty('--border-glow', 'transparent');
        }
    } else if (type === 'break') {
        root.style.setProperty('--status-color', '#2ec4b6'); // Расслабляющий бирюзовый
        root.style.setProperty('--border-glow', '#2ec4b6');
    } else {
        root.style.setProperty('--status-color', '#999999');
        root.style.setProperty('--border-glow', 'transparent');
    }
}

function updateTracker() {
    const now = new Date();
    let dayOfWeek = now.getDay();
    
    document.getElementById('current-time-display').innerText = "Сегодня: " + now.toLocaleDateString('ru-RU', { weekday: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (dayOfWeek === 0 || dayOfWeek === 6) {
        document.getElementById('c1-title').innerText = "Выходные дни";
        document.getElementById('c1-timer').innerText = "🎉";
        document.getElementById('c1-break').innerText = "Отдых";
        setStatusColors('rest');
        renderScheduleTable(1, true); // На выходных показываем понедельник
        return;
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const totalCurrentSeconds = currentMinutes * 60 + now.getSeconds();
    
    const todayLessons = weeklyLessons[dayOfWeek] || {};
    const lessonNumbers = Object.keys(todayLessons).map(Number).sort((a,b)=>a-b);
    
    const lastLessonNum = lessonNumbers[lessonNumbers.length - 1];
    const lastSlot = timeSlots.find(s => s.number === lastLessonNum);
    const schoolEndSec = timeToMinutes(lastSlot.end) * 60;

    // Решаем, какое расписание выводить снизу
    if (totalCurrentSeconds >= schoolEndSec) {
        // День окончен -> выводим расписание на завтра
        let nextDay = dayOfWeek + 1;
        if (nextDay > 5) nextDay = 1; // Если пятница вечер — показываем пн
        renderScheduleTable(nextDay, true);
    } else {
        // День еще идет -> выводим текущее
        renderScheduleTable(dayOfWeek, false);
    }

    processChildSchedule(dayOfWeek, totalCurrentSeconds, todayLessons, lessonNumbers, schoolEndSec);
}

function renderScheduleTable(dayNum, isTomorrow) {
    const listContainer = document.getElementById('schedule-list');
    const titleContainer = document.getElementById('list-title');
    const daysText = {1:"Понедельник", 2:"Вторник", 3:"Среда", 4:"Четверг", 5:"Пятница"};
    
    titleContainer.innerText = (isTomorrow ? "Расписание на завтра (" : "Расписание на сегодня (") + daysText[dayNum] + ")";
    
    const lessons = weeklyLessons[dayNum] || {};
    let html = "";
    
    timeSlots.forEach(slot => {
        const name = lessons[slot.number];
        if (name) {
            let activeClass = "";
            // Подсветка текущего урока в таблице (только если смотрим "сегодня")
            if (!isTomorrow) {
                const now = new Date();
                const curSec = (now.getHours()*60 + now.getMinutes())*60 + now.getSeconds();
                if (curSec >= timeToMinutes(slot.start)*60 && curSec < timeToMinutes(slot.end)*60) {
                    activeClass = " active-now";
                }
            }
            html += `<div class="schedule-item${activeClass}"><span>${slot.number}. ${name}</span><span style="opacity:0.7">${slot.start}-${slot.end}</span></div>`;
        }
    });
    listContainer.innerHTML = html;
}

function processChildSchedule(dayOfWeek, totalCurrentSeconds, todayLessons, lessonNumbers, schoolEndSec) {
    const prefix = 'c1';
    const firstLessonNum = lessonNumbers[0];
    const firstSlot = timeSlots.find(s => s.number === firstLessonNum);
    const schoolStartSec = timeToMinutes(firstSlot.start) * 60;

    if (totalCurrentSeconds < schoolStartSec) {
        const diff = schoolStartSec - totalCurrentSeconds;
        document.getElementById(prefix + '-title').innerText = "До начала занятий (" + todayLessons[firstLessonNum] + ")";
        document.getElementById(prefix + '-timer').innerText = formatRemainingTime(diff);
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

if (totalCurrentSeconds >= slotStartSec && totalCurrentSeconds < slotEndSec) {const diff = slotEndSec - totalCurrentSeconds;if (lessonName) {document.getElementById(prefix + '-title').innerText = "Сейчас: " + lessonName;document.getElementById(prefix + '-timer').innerText = formatRemainingTime(diff);const nextLessonNum = lessonNumbers.find(num => num > slot.number);document.getElementById(prefix + '-break').innerText = nextLessonNum ? "Перемена: " + slot.breakAfter + " мин. \nДалее: " + todayLessons[nextLessonNum] : "Перемена: " + slot.breakAfter + " мин. (Последний урок!)";setStatusColors('lesson', diff);} else {document.getElementById(prefix + '-title').innerText = "Свободное время (Окно)";document.getElementById(prefix + '-timer').innerText = formatRemainingTime(diff);const nextLessonNum = lessonNumbers.find(num => num > slot.number);document.getElementById(prefix + '-break').innerText = nextLessonNum ? "Далее: " + todayLessons[nextLessonNum] : "Скоро домой";setStatusColors('rest');}return;}if (i < timeSlots.length - 1) {const nextSlot = timeSlots[i + 1];const nextSlotStartSec = timeToMinutes(nextSlot.start) * 60;if (totalCurrentSeconds >= slotEndSec && totalCurrentSeconds < nextSlotStartSec) {const diff = nextSlotStartSec - totalCurrentSeconds;const nextLessonNum = lessonNumbers.find(num => num > slot.number);document.getElementById(prefix + '-title').innerText = "Идет перемена";document.getElementById(prefix + '-timer').innerText = formatRemainingTime(diff);document.getElementById(prefix + '-break').innerText = nextLessonNum ? "Далее: " + todayLessons[nextLessonNum] : "Идем домой!";setStatusColors('break');return;}}}}
