import { initializeApp } from "https://gstatic.com";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://gstatic.com";

const firebaseConfig = {
    apiKey: "AIzaSyBibVt41A2cU1_zA7efXLP5mxz-uo8T-2w",
    authDomain: "://firebaseapp.com",
    projectId: "school-tracker-2026-1",
    storageBucket: "school-tracker-2026-1.firebasestorage.app",
    messagingSenderId: "353230380490",
    appId: "1:353230380490:web:a738ed00704059c8a83333"
};

const ALLOWED_EMAILS = ["a.greegoriev@gmail.com"];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const loadingScreen = document.getElementById('loading-screen');
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const authMessage = document.getElementById('auth-message');

let intervalId = null;

onAuthStateChanged(auth, (user) => {
    loadingScreen.style.display = 'none';
    if (user) {
        if (ALLOWED_EMAILS.includes(user.email.toLowerCase())) {
            authScreen.style.display = 'none';
            appScreen.style.display = 'flex';
            document.body.style.justifyContent = 'flex-start';
            if (!intervalId) {
                updateTracker();
                intervalId = setInterval(updateTracker, 1000);
            }
        } else {
            authMessage.innerText = "❌ Доступ запрещен. Этот Email отсутствует в списке семьи.";
            authMessage.style.color = "red";
            authScreen.style.display = 'block';
            appScreen.style.display = 'none';
            signOut(auth);
        }
    } else {
        authScreen.style.display = 'block';
        appScreen.style.display = 'none';
        document.body.style.justifyContent = 'center';
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }
});

document.getElementById('login-btn').addEventListener('click', () => {
    signInWithPopup(auth, provider).catch((error) => {
        alert("Ошибка входа: " + error.message);
    });
});

document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.reload();
    });
});

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
