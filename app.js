const HASHED_KEY = "accdb61253228627734b63ffdb49dd2dc708425b07e5fb618d92f46f342ca0be";

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

    const savedHash = localStorage.getItem('school_access_hash');
    return savedHash === HASHED_KEY;
}

// Элементы экрана
const loadingScreen = document.getElementById('loading-screen');
const appScreen = document.getElementById('app-screen');

// ЗАПУСК ПРИЛОЖЕНИЯ
async function init() {
    loadingScreen.style.display = 'none';
    
    if (await checkAccess()) {
        appScreen.style.display = 'flex';
        document.body.style.justifyContent = 'flex-start';
        updateTracker();
        setInterval(updateTracker, 1000);
    } else {
        document.body.innerHTML = "<div style='text-align:center; margin-top:100px;'><h1 style='font-size:48px; margin-bottom:10px;'>404</h1><p style='color:#666;'>Страница не найдена или доступ ограничен.</p></div>";
    }
}

init();

// БАЗА ДАННЫХ ВРЕМЕНИ ЗВОНКОВ КИРИЛЛА
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

// БАЗА ДАННЫХ ПРЕДМЕТОВ КИРИЛЛА
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

function updateTracker() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    document.getElementById('current-time-display').innerText = "Сегодня: " + now.toLocaleDateString('ru-RU', { weekday: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        document.getElementById('c1-title').innerText = "Выходной день";
        document.getElementById('c1-timer').innerText = "🎉";
        document.getElementById('c1-break').innerText = "Отдых";
        return;
    }
    processChildSchedule(dayOfWeek, 'c1');
}

function processChildSchedule(dayOfWeek, prefix) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const totalCurrentSeconds = currentMinutes * 60 + now.getSeconds();
    const todayLessons = weeklyLessons[dayOfWeek] || {};
    const lessonNumbers = Object.keys(todayLessons).map(Number).sort((a,b)=>a-b);
    if (lessonNumbers.length === 0) {
        document.getElementById(prefix + '-title').innerText = "Сегодня нет уроков";
        document.getElementById(prefix + '-timer').innerText = "🏡";
        document.getElementById(prefix + '-break').innerText = "Свободный день";
        return;
    }
    const firstLessonNum = lessonNumbers[0];
    const lastLessonNum = lessonNumbers[lessonNumbers.length - 1];
    const firstSlot = timeSlots.find(s => s.number === firstLessonNum);
    const lastSlot = timeSlots.find(s => s.number === lastLessonNum);
    const schoolStartSec = timeToMinutes(firstSlot.start) * 60;
    const schoolEndSec = timeToMinutes(lastSlot.end) * 60;

    if (totalCurrentSeconds < schoolStartSec) {
        const diff = schoolStartSec - totalCurrentSeconds;
        document.getElementById(prefix + '-title').innerText = "До начала занятий (" + todayLessons[firstLessonNum] + ")";
        document.getElementById(prefix + '-timer').innerText = formatRemainingTime(diff);
        document.getElementById(prefix + '-break').innerText = "Первый урок в " + firstSlot.start;
        return;
    }
    if (totalCurrentSeconds >= schoolEndSec) {
        document.getElementById(prefix + '-title').innerText = "Уроки окончены";
        document.getElementById(prefix + '-timer').innerText = "🏡 Домой";
        document.getElementById(prefix + '-break').innerText = "Все занятия на сегодня завершены";
        return;
    }
    for (let i = 0; i < timeSlots.length; i++) {
        const slot = timeSlots[i];
        const slotStartSec = timeToMinutes(slot.start) * 60;
        const slotEndSec = timeToMinutes(slot.end) * 60;
        const lessonName = todayLessons[slot.number];

        if (totalCurrentSeconds >= slotStartSec && totalCurrentSeconds < slotEndSec) {
            if (lessonName) {
                const diff = slotEndSec - totalCurrentSeconds;
                document.getElementById(prefix + '-title').innerText = "Сейчас: " + lessonName;
                document.getElementById(prefix + '-timer').innerText = formatRemainingTime(diff);
                const nextLessonNum = lessonNumbers.find(num => num > slot.number);
                if (nextLessonNum) {
                    document.getElementById(prefix + '-break').innerText = "Перемена: " + slot.breakAfter + " мин. \nДалее: " + todayLessons[nextLessonNum];
                } else {
                    document.getElementById(prefix + '-break').innerText = "Перемена: " + slot.breakAfter + " мин. (Последний урок!)";
                }
            } else {
                const diff = slotEndSec - totalCurrentSeconds;
                const nextLessonNum = lessonNumbers.find(num => num > slot.number);
                document.getElementById(prefix + '-title').innerText = "Свободное время (Окно)";
                document.getElementById(prefix + '-timer').innerText = formatRemainingTime(diff);
                document.getElementById(prefix + '-break').innerText = nextLessonNum ? "Далее: " + todayLessons[nextLessonNum] : "Скоро домой";
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
                return;
            }
        }
    }
}
