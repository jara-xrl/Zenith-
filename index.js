/* ============================================================
   ZENITH v1.0 - JavaScript (Complete)
   نظام تسجيل دخول دائم عبر localStorage
   ============================================================ */

/* ============================================================
   1. Utilities - أدوات مساعدة
   ============================================================ */
const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function toast(message, duration = 3000) {
  const container = $('#toastContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

function showError(form, message) {
  const err = form.querySelector('.auth-error');
  if (!err) return;
  err.textContent = message;
  err.classList.add('show');
  setTimeout(() => err.classList.remove('show'), 3000);
}

/* ============================================================
   2. نظام تخزين الجلسة (Persistent Login DB)
   ============================================================ */
const DB = {
  USERS_KEY:   'zenith_users',
  SESSION_KEY: 'zenith_current',

  getUsers: () => {
    try {
      return JSON.parse(localStorage.getItem(DB.USERS_KEY) || '{}');
    } catch (e) {
      return {};
    }
  },

  saveUsers: (users) => {
    localStorage.setItem(DB.USERS_KEY, JSON.stringify(users));
  },

  getCurrent: () => {
    try {
      return JSON.parse(localStorage.getItem(DB.SESSION_KEY) || 'null');
    } catch (e) {
      return null;
    }
  },

  setCurrent: (user) => {
    localStorage.setItem(DB.SESSION_KEY, JSON.stringify({
      ...user,
      loginTime: Date.now()
    }));
  },

  clearCurrent: () => {
    localStorage.removeItem(DB.SESSION_KEY);
  },

  isLoggedIn: () => {
    return DB.getCurrent() !== null;
  }
};

/* ============================================================
   3. تجربة الدخول السينمائية
   ============================================================ */
const breachWindows = [
  { title: "⚠️ تحذير أمني",       msg: "تم اكتشاف اختراق غير مصرح به", x: 8,  y: 8  },
  { title: "🔓 خرق البيانات",      msg: "Accessing database...",        x: 55, y: 15 },
  { title: "📡 اتصال مشبوه",       msg: "IP: 192.168.XX.XX",            x: 20, y: 55 },
  { title: "💀 تم اختراق النظام",  msg: "Server compromised",           x: 60, y: 60 },
  { title: "🔥 جاري التشفير",      msg: "Encrypting files...",          x: 35, y: 35 }
];

const popupsContainer = $('#popups-container');
if (popupsContainer) {
  breachWindows.forEach((data, i) => {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.style.left = data.x + '%';
    popup.style.top  = data.y + '%';
    popup.style.animationDelay = (i * 0.4) + 's, 0s';
    popup.innerHTML = `
      <div class="popup-header">system.exe</div>
      <div class="popup-title">${data.title}</div>
      <div class="popup-msg">${data.msg}</div>
      <div class="progress-bar"><div class="progress-fill"></div></div>
    `;
    popupsContainer.appendChild(popup);
  });
}

/* HUD */
const hudGrid       = $('#hud-grid');
const hudCorners    = [$('#corner-tl'), $('#corner-tr'), $('#corner-bl'), $('#corner-br')];
const hudInfos      = [$('#info-tl'), $('#info-tr'), $('#info-bl'), $('#info-br')];
const hudTopBar     = $('#status-top');
const hudBottomBar  = $('#status-bottom');

function activateHUD() {
  if (hudGrid) hudGrid.classList.add('active');
  hudCorners.forEach(c => c && c.classList.add('active'));
  hudInfos.forEach(i => i && i.classList.add('active'));
  if (hudTopBar)    hudTopBar.classList.add('active');
  if (hudBottomBar) hudBottomBar.classList.add('active');
}

function deactivateHUD() {
  if (hudGrid) hudGrid.classList.remove('active');
  hudCorners.forEach(c => c && c.classList.remove('active'));
  hudInfos.forEach(i => i && i.classList.remove('active'));
  if (hudTopBar)    hudTopBar.classList.remove('active');
  if (hudBottomBar) hudBottomBar.classList.remove('active');
}

/* قيم متحركة */
setInterval(() => {
  const cpu   = $('#cpu-val');
  const users = $('#users-val');
  const ping  = $('#ping-val');
  if (cpu)   cpu.textContent = (8 + Math.random() * 40).toFixed(1) + '%';
  if (users) users.textContent = (12000 + Math.floor(Math.random() * 2000)).toLocaleString();
  if (ping)  ping.textContent = Math.floor(5 + Math.random() * 25) + 'ms';
}, 2000);

/* العناصر الأساسية */
const intro       = $('#intro');
const glitchStage = $('#glitch-stage');
const sunStage    = $('#sun-stage');
const authScreen  = $('#auth-screen');
const app         = $('#app');

/* ============================================================
   4. تشغيل المقدمة السينمائية (فقط إذا لم يكن مسجلاً)
   ============================================================ */
function runCinematicIntro() {
  activateHUD();

  // 2.5s: التشويش
  setTimeout(() => {
    if (popupsContainer) {
      popupsContainer.style.transition = 'opacity 0.4s';
      popupsContainer.style.opacity = '0';
    }
    if (glitchStage) glitchStage.classList.add('active');
  }, 2500);

  // 4.5s: الشمس
  setTimeout(() => {
    if (glitchStage) {
      glitchStage.style.transition = 'opacity 0.5s';
      glitchStage.style.opacity = '0';
    }
    if (sunStage) sunStage.classList.add('active');
    deactivateHUD();
  }, 4500);

  // 8s: إظهار الاسم
  setTimeout(() => {
    if (sunStage) sunStage.classList.add('show-name');
  }, 8000);

  // 10.5s: الانتقال لشاشة الدخول
  setTimeout(() => {
    if (intro) {
      intro.style.transition = 'opacity 1s ease';
      intro.style.opacity = '0';
      setTimeout(() => intro.remove(), 1100);
    }
    if (authScreen) authScreen.classList.add('active');
  }, 10500);
}

/* ============================================================
   5. دخول التطبيق (بعد التحقق من الجلسة)
   ============================================================ */
function enterApp(skipAnimation = false) {
  const user = DB.getCurrent();
  if (!user) {
    // لا يوجد مستخدم - إظهار شاشة الدخول
    if (authScreen) authScreen.classList.add('active');
    return;
  }

  // تحديث بيانات المستخدم في الهيدر
  const headerUserName = $('#headerUserName');
  const headerUserAvatar = $('#headerUserAvatar');
  if (headerUserName)   headerUserName.textContent = user.display;
  if (headerUserAvatar) headerUserAvatar.textContent = user.display[0].toUpperCase();

  // إخفاء شاشة الدخول والمقدمة
  if (authScreen) authScreen.classList.remove('active');
  if (intro && intro.parentNode) intro.remove();

  // إظهار التطبيق
  setTimeout(() => {
    if (app) app.classList.add('active');
    addLog('SUCCESS', `User ${user.username} signed in`);
  }, skipAnimation ? 0 : 400);
}

/* ============================================================
   6. التبويبات (تسجيل الدخول / إنشاء حساب)
   ============================================================ */
$$('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $$('.auth-tab').forEach(t => t.classList.remove('active'));
    $$('.auth-form').forEach(f => f.classList.remove('active'));
    tab.classList.add('active');
    const form = $(`#${tab.dataset.tab}-form`);
    if (form) form.classList.add('active');
  });
});

/* ============================================================
   7. تسجيل الدخول
   ============================================================ */
const loginForm = $('#login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = $('#login-username').value.trim().toLowerCase();
    const password = $('#login-password').value;
    const users = DB.getUsers();

    if (!users[username]) {
      return showError(loginForm, 'اسم المستخدم غير موجود');
    }
    if (users[username].password !== password) {
      return showError(loginForm, 'كلمة المرور غير صحيحة');
    }

    // حفظ الجلسة بشكل دائم
    DB.setCurrent({
      username,
      display: users[username].display
    });

    toast(`مرحباً ${users[username].display}`);
    enterApp();
  });
}

/* ============================================================
   8. إنشاء حساب جديد
   ============================================================ */
const signupForm = $('#signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const display  = $('#signup-display').value.trim();
    const username = $('#signup-username').value.trim().toLowerCase();
    const password = $('#signup-password').value;
    const users = DB.getUsers();

    // التحقق من صحة البيانات
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      return showError(signupForm, 'اسم المستخدم: 3-20 حرف (a-z, 0-9, _)');
    }
    if (users[username]) {
      return showError(signupForm, 'اسم المستخدم محجوز');
    }
    if (password.length < 4) {
      return showError(signupForm, 'كلمة المرور قصيرة جداً (4 أحرف على الأقل)');
    }

    // حفظ المستخدم الجديد
    users[username] = {
      display,
      password,
      createdAt: Date.now()
    };
    DB.saveUsers(users);

    // حفظ الجلسة مباشرة
    DB.setCurrent({ username, display });

    toast('تم إنشاء الحساب بنجاح');
    enterApp();
  });
}

/* ============================================================
   9. تسجيل الخروج
   ============================================================ */
const logoutBtn = $('#logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    DB.clearCurrent();
    toast('تم تسجيل الخروج');
    setTimeout(() => location.reload(), 600);
  });
}

/* ============================================================
   10. Sidebar Menu
   ============================================================ */
const menuToggle  = $('#menuToggle');
const sideMenu    = $('#sideMenu');
const menuOverlay = $('#menuOverlay');

function openMenu() {
  if (menuToggle)  menuToggle.classList.add('open');
  if (sideMenu)    sideMenu.classList.add('open');
  if (menuOverlay) menuOverlay.classList.add('open');
}

function closeMenu() {
  if (menuToggle)  menuToggle.classList.remove('open');
  if (sideMenu)    sideMenu.classList.remove('open');
  if (menuOverlay) menuOverlay.classList.remove('open');
}

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    if (sideMenu && sideMenu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });
}

if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

/* ============================================================
   11. التنقل بين الصفحات
   ============================================================ */
$$('.side-nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const route = item.dataset.route;

    $$('.side-nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');

    $$('.page').forEach(p => p.classList.remove('active'));
    const target = $(`#page-${route}`);
    if (target) target.classList.add('active');

    closeMenu();
    addLog('INFO', `Navigated to: ${route}`);
  });
});

/* ============================================================
   12. الدردشة
   ============================================================ */
const contacts = [
  { id: 'ahmad', name: 'أحمد', initial: 'A', status: 'ONLINE',  online: true,  unread: 2, messages: [
    { from: 'in',  text: 'مرحباً، كيف حالك؟', time: '10:24' },
    { from: 'out', text: 'بخير الحمد لله!', time: '10:25' },
    { from: 'in',  text: 'هل أنت جاهز للاجتماع؟', time: '10:30' }
  ]},
  { id: 'sara',  name: 'سارة',  initial: 'S', status: 'ONLINE',  online: true,  unread: 1, messages: [
    { from: 'in',  text: 'أرسلت لك الملفات', time: '09:15' },
    { from: 'out', text: 'شكراً جزيلاً!', time: '09:16' }
  ]},
  { id: 'omar',  name: 'عمر',   initial: 'O', status: 'IDLE',    online: false, unread: 0, messages: [
    { from: 'out', text: 'إلى اللقاء', time: 'أمس' }
  ]},
  { id: 'layla', name: 'ليلى',  initial: 'L', status: 'OFFLINE', online: false, unread: 0, messages: [] }
];

let activeContactId = 'ahmad';

function renderContacts() {
  const container = $('#chatContacts');
  if (!container) return;
  container.innerHTML = '';
  contacts.forEach(c => {
    const el = document.createElement('div');
    el.className = 'chat-contact' + (c.id === activeContactId ? ' active' : '');
    el.innerHTML = `
      <div class="contact-avatar">${c.initial}</div>
      <div class="contact-info">
        <div class="contact-name">${c.name}</div>
        <div class="contact-preview">${c.messages.length ? c.messages[c.messages.length - 1].text : 'لا توجد رسائل'}</div>
      </div>
      ${c.unread > 0 ? `<div class="contact-unread">${c.unread}</div>` : ''}
    `;
    el.addEventListener('click', () => {
      activeContactId = c.id;
      c.unread = 0;
      renderContacts();
      renderChat();
    });
    container.appendChild(el);
  });
}

function renderChat() {
  const contact = contacts.find(c => c.id === activeContactId);
  if (!contact) return;

  const headerName   = $('#chatHeaderName');
  const headerStatus = $('#chatHeaderStatus');
  const chatAvatar   = $('#chatAvatar');
  const messages     = $('#chatMessages');

  if (headerName)   headerName.textContent = contact.name;
  if (headerStatus) headerStatus.textContent = contact.status;
  if (chatAvatar)   chatAvatar.textContent = contact.initial;
  if (!messages) return;

  messages.innerHTML = '';
  contact.messages.forEach(m => {
    const el = document.createElement('div');
    el.className = `message ${m.from === 'in' ? 'incoming' : 'outgoing'}`;
    el.innerHTML = `
      ${m.text}
      <div class="message-time">${m.time}</div>
    `;
    messages.appendChild(el);
  });
  messages.scrollTop = messages.scrollHeight;
}

function sendMessage() {
  const input = $('#chatInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const contact = contacts.find(c => c.id === activeContactId);
  if (!contact) return;

  const now  = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  contact.messages.push({ from: 'out', text, time });
  input.value = '';
  renderChat();
  renderContacts();
  addLog('INFO', `Message sent to ${contact.name}`);

  // رد تلقائي
  setTimeout(() => {
    contact.messages.push({
      from: 'in',
      text: ['تمام', 'شكراً لك', 'سأرد عليك قريباً', 'مفهوم'][Math.floor(Math.random() * 4)],
      time
    });
    if (contact.id !== activeContactId) contact.unread++;
    renderChat();
    renderContacts();
  }, 1200 + Math.random() * 1500);
}

const chatSendBtn = $('#chatSend');
if (chatSendBtn) chatSendBtn.addEventListener('click', sendMessage);

const chatInputEl = $('#chatInput');
if (chatInputEl) {
  chatInputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

/* ============================================================
   13. الأصدقاء
   ============================================================ */
const friends = [
  { name: 'أحمد',  initial: 'A', status: 'ONLINE',  online: true  },
  { name: 'سارة',  initial: 'S', status: 'ONLINE',  online: true  },
  { name: 'عمر',   initial: 'O', status: 'IDLE',    online: false },
  { name: 'ليلى',  initial: 'L', status: 'OFFLINE', online: false },
  { name: 'خالد',  initial: 'K', status: 'ONLINE',  online: true  },
  { name: 'نور',   initial: 'N', status: 'OFFLINE', online: false }
];

function renderFriends() {
  const grid = $('#friendsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  friends.forEach(f => {
    const el = document.createElement('div');
    el.className = 'friend-card';
    el.innerHTML = `
      <div class="friend-avatar ${f.online ? 'online' : ''}">${f.initial}</div>
      <div class="friend-name">${f.name}</div>
      <div class="friend-status">${f.status}</div>
    `;
    el.addEventListener('click', () => toast(`محادثة مع ${f.name}`));
    grid.appendChild(el);
  });
}

/* ============================================================
   14. السجلات
   ============================================================ */
const logsTable = $('#logsTable');

function addLog(level, message) {
  if (!logsTable) return;

  const now  = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

  const el = document.createElement('div');
  el.className = 'log-row';
  el.innerHTML = `
    <div class="log-time">${time}</div>
    <div class="log-level ${level.toLowerCase()}">${level}</div>
    <div class="log-msg">${message}</div>
  `;

  logsTable.appendChild(el);

  // احتفظ فقط بآخر 50 سجل
  const rows = logsTable.querySelectorAll('.log-row:not(.header)');
  if (rows.length > 50) rows[0].remove();
}

function seedLogs() {
  const samples = [
    ['INFO',    'System initialized'],
    ['SUCCESS', 'Database connection established'],
    ['INFO',    'Encryption layer activated'],
    ['WARNING', 'High memory usage detected'],
    ['SUCCESS', 'HUD rendering complete'],
    ['INFO',    'WebSocket channel opened'],
    ['INFO',    'User session synchronized']
  ];
  samples.forEach(([level, msg], i) => {
    setTimeout(() => addLog(level, msg), i * 300);
  });
}

/* ============================================================
   15. الإعدادات - Toggles
   ============================================================ */
$$('.toggle').forEach(t => {
  t.addEventListener('click', () => {
    t.classList.toggle('on');
    const setting = t.dataset.setting;
    const state = t.classList.contains('on') ? 'ON' : 'OFF';
    toast(`${setting}: ${state}`);
    addLog('INFO', `Setting ${setting} = ${state}`);

    // حفظ الإعدادات في localStorage
    const settings = JSON.parse(localStorage.getItem('zenith_settings') || '{}');
    settings[setting] = state;
    localStorage.setItem('zenith_settings', JSON.stringify(settings));
  });
});

/* استعادة الإعدادات المحفوظة */
function restoreSettings() {
  const settings = JSON.parse(localStorage.getItem('zenith_settings') || '{}');
  $$('.toggle').forEach(t => {
    const setting = t.dataset.setting;
    if (settings[setting] === 'ON') t.classList.add('on');
    if (settings[setting] === 'OFF') t.classList.remove('on');
  });
}

/* ============================================================
   16. تحديث الإحصائيات
   ============================================================ */
setInterval(() => {
  const members  = $('#dash-members');
  const messages = $('#dash-messages');
  if (members)  members.textContent = (12000 + Math.floor(Math.random() * 2000)).toLocaleString();
  if (messages) messages.textContent = (240 + Math.floor(Math.random() * 100)).toLocaleString();
}, 3000);

/* ============================================================
   17. التهيئة عند تحميل الصفحة
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // تهيئة مكونات التطبيق
  renderContacts();
  renderChat();
  renderFriends();
  restoreSettings();

  // التحقق من وجود جلسة نشطة
  if (DB.isLoggedIn()) {
    // مستخدم مسجل من قبل - تخطي المقدمة والدخول مباشرة
    if (intro && intro.parentNode) intro.remove();
    enterApp(true);
    seedLogs();
  } else {
    // مستخدم جديد - تشغيل المقدمة السينمائية
    runCinematicIntro();
  }
});

/* ============================================================
   18. حفظ الجلسة عند إغلاق الصفحة (اختياري)
   ============================================================ */
window.addEventListener('beforeunload', () => {
  // تأكد من أن الجلسة محفوظة قبل الإغلاق
  const user = DB.getCurrent();
  if (user) {
    localStorage.setItem('zenith_last_active', Date.now().toString());
  }
});

/* ============================================================
   19. رسالة ترحيب في الكونسول
   ============================================================ */
console.log(
  '%c ZENITH v1.0 ',
  'background:#8b0000;color:#fff;padding:6px 12px;border-radius:3px;font-weight:bold;font-size:14px;',
  '\nنظام تسجيل دخول دائم مفعّل ✓'
);
