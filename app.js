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
