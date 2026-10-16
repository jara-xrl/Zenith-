
/* ============================================================
   ZENITH v1.0 - JavaScript
   ============================================================ */

/* ============================================================
   1. Utilities
   ============================================================ */
const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function toast(message, duration = 3000) {
  const container = $('#toastContainer');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

function showError(form, message) {
  const err = form.querySelector('.auth-error');
  err.textContent = message;
  err.classList.add('show');
  setTimeout(() => err.classList.remove('show'), 3000);
}

/* ============================================================
   2. تجربة الدخول السينمائية
   ============================================================ */
const breachWindows = [
  { title: "⚠️ تحذير أمني", msg: "تم اكتشاف اختراق غير مصرح به", x: 8,  y: 8  },
  { title: "🔓 خرق البيانات", msg: "Accessing database...",       x: 55, y: 15 },
  { title: "📡 اتصال مشبوه", msg: "IP: 192.168.XX.XX",            x: 20, y: 55 },
  { title: "💀 تم اختراق النظام", msg: "Server compromised",       x: 60, y: 60 },
  { title: "🔥 جاري التشفير", msg: "Encrypting files...",          x: 35, y: 35 }
];

const popupsContainer = $('#popups-container');
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

/* HUD */
const hudGrid       = $('#hud-grid');
const hudCorners    = [$('#corner-tl'), $('#corner-tr'), $('#corner-bl'), $('#corner-br')];
const hudInfos      = [$('#info-tl'), $('#info-tr'), $('#info-bl'), $('#info-br')];
const hudTopBar     = $('#status-top');
const hudBottomBar  = $('#status-bottom');

function activateHUD() {
  hudGrid.classList.add('active');
  hudCorners.forEach(c => c && c.classList.add('active'));
  hudInfos.forEach(i => i && i.classList.add('active'));
  hudTopBar.classList.add('active');
  hudBottomBar.classList.add('active');
}

function deactivateHUD() {
  hudGrid.classList.remove('active');
  hudCorners.forEach(c => c && c.classList.remove('active'));
  hudInfos.forEach(i => i && i.classList.remove('active'));
  hudTopBar.classList.remove('active');
  hudBottomBar.classList.remove('active');
}

/* قيم متحركة */
setInterval(() => {
  const cpu = $('#cpu-val');
  const users = $('#users-val');
  const ping = $('#ping-val');
  if (cpu)   cpu.textContent = (8 + Math.random() * 40).toFixed(1) + '%';
  if (users) users.textContent = (12000 + Math.floor(Math.random() * 2000)).toLocaleString();
  if (ping)  ping.textContent = Math.floor(5 + Math.random() * 25) + 'ms';
}, 2000);

/* التسلسل الزمني */
const intro       = $('#intro');
const glitchStage = $('#glitch-stage');
const sunStage    = $('#sun-stage');
const authScreen  = $('#auth-screen');

activateHUD();

// 2.5s: التشويش
setTimeout(() => {
  popupsContainer.style.transition = 'opacity 0.4s';
  popupsContainer.style.opacity = '0';
  glitchStage.classList.add('active');
}, 2500);

// 4.5s: الشمس
setTimeout(() => {
  glitchStage.style.transition = 'opacity 0.5s';
  glitchStage.style.opacity = '0';
  sunStage.classList.add('active');
  deactivateHUD();
}, 4500);

// 8s: إظهار الاسم
setTimeout(() => {
  sunStage.classList.add('show-name');
}, 8000);

// 10.5s: الانتقال لشاشة الدخول
setTimeout(() => {
  intro.style.transition = 'opacity 1s ease';
  intro.style.opacity = '0';
  authScreen.classList.add('active');
  setTimeout(() => intro.remove(), 1100);
}, 10500);

/* ============================================================
   3. نظام المصادقة (LocalStorage)
   ============================================================ */
const DB = {
  getUsers: () => JSON.parse(localStorage.getItem('zenith_users') || '{}'),
  saveUsers: (users) => localStorage.setItem('zenith_users', JSON.stringify(users)),
  getCurrent: () => JSON.parse(localStorage.getItem('zenith_current') || 'null'),
  setCurrent: (user) => localStorage.setItem('zenith_current', JSON.stringify(user)),
  clearCurrent: () => localStorage.removeItem('zenith_current')
};

/* تبويبات */
$$('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $$('.auth-tab').forEach(t => t.classList.remove('active'));
    $$('.auth-form').forEach(f => f.classList.remove('active'));
    tab.classList.add('active');
    $(`#${tab.dataset.tab}-form`).classList.add('active');
  });
});

/* تسجيل الدخول */
async function hashPw(pw, salt) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 150000 }, k, 256);
  return [...new Uint8Array(bits)].map(x => x.toString(16).padStart(2, '0')).join('');
}
const newSalt = () => [...crypto.getRandomValues(new Uint8Array(16))].map(x => x.toString(16).padStart(2, '0')).join('');

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = $('#login-username').value.trim().toLowerCase();
  const password = $('#login-password').value;
  const users = DB.getUsers(), u = users[username];
  const lk = JSON.parse(localStorage.getItem('zenith_lock') || '{}'), l = lk[username] || { n: 0, t: 0 };
  if (l.t > Date.now()) return showError($('#login-form'), 'الحساب مقفل مؤقتاً، حاول لاحقاً');
  if (!u) return showError($('#login-form'), 'اسم المستخدم غير موجود');
  let ok;
  if (u.password !== undefined) { ok = u.password === password; if (ok) { u.salt = newSalt(); u.hash = await hashPw(password, u.salt); delete u.password; DB.saveUsers(users); } }
  else ok = (await hashPw(password, u.salt)) === u.hash;
  if (!ok) {
    l.n++; if (l.n >= 5) { l.t = Date.now() + 300000; l.n = 0; }
    lk[username] = l; localStorage.setItem('zenith_lock', JSON.stringify(lk));
    return showError($('#login-form'), 'كلمة المرور غير صحيحة');
  }
  delete lk[username]; localStorage.setItem('zenith_lock', JSON.stringify(lk));
  DB.setCurrent({ username, display: u.display });
  enterApp();
});

/* إنشاء حساب */
$('#signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const display  = $('#signup-display').value.trim();
  const username = $('#signup-username').value.trim().toLowerCase();
  const password = $('#signup-password').value;
  const users = DB.getUsers();
  if (!/^[a-z0-9_]{3,20}$/.test(username)) return showError($('#signup-form'), 'اسم المستخدم: 3-20 حرف (a-z, 0-9, _)');
  if (password.length < 8) return showError($('#signup-form'), 'كلمة المرور 8 أحرف على الأقل');
  if (users[username]) return showError($('#signup-form'), 'اسم المستخدم محجوز');
  const salt = newSalt();
  users[username] = { display, salt, hash: await hashPw(password, salt), createdAt: Date.now() };
  DB.saveUsers(users);
  DB.setCurrent({ username, display });
  toast('تم إنشاء الحساب بنجاح');
  enterApp();
});

/* الخروج */
$('#logoutBtn')?.addEventListener('click', () => {
  DB.clearCurrent();
  location.reload();
});

/* ============================================================
   4. دخول التطبيق
   ============================================================ */
const app = $('#app');

function enterApp() {
  const user = DB.getCurrent();
  if (!user) return;

  // تحديث بيانات المستخدم
  $('#headerUserName').textContent = user.display;
  $('#headerUserAvatar').textContent = user.display[0].toUpperCase();

  // إخفاء شاشة الدخول
  authScreen.classList.remove('active');

  // إظهار التطبيق
  setTimeout(() => {
    app.classList.add('active');
    addLog('SUCCESS', `User ${user.username} signed in`);
  }, 400);
}

/* إذا كان المستخدم مسجلاً من قبل */
window.addEventListener('load', () => {
  if (DB.getCurrent()) {
    // تخطي المقدمة والدخول مباشرة
    setTimeout(() => {
      if (intro.parentNode) intro.remove();
      authScreen.classList.add('active');
      setTimeout(() => enterApp(), 100);
    }, 100);
  }
});

/* ============================================================
   5. Sidebar
   ============================================================ */
const menuToggle  = $('#menuToggle');
const sideMenu    = $('#sideMenu');
const menuOverlay = $('#menuOverlay');

function openMenu() {
  menuToggle.classList.add('open');
  sideMenu.classList.add('open');
  menuOverlay.classList.add('open');
}
function closeMenu() {
  menuToggle.classList.remove('open');
  sideMenu.classList.remove('open');
  menuOverlay.classList.remove('open');
}
menuToggle.addEventListener('click', () => sideMenu.classList.contains('open') ? closeMenu() : openMenu());
menuOverlay.addEventListener('click', closeMenu);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

/* ============================================================
   6. التنقل بين الصفحات
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
   7. الصفحة: الدردشة
   ============================================================ */
const MSG = {
  get: () => JSON.parse(localStorage.getItem('zenith_msgs') || '[]'),
  set: (a) => { try { localStorage.setItem('zenith_msgs', JSON.stringify(a)); return true; } catch { toast('مساحة التخزين ممتلئة'); return false; } }
};
const bc = new BroadcastChannel('zenith');
const me = () => DB.getCurrent()?.username;
const hhmm = (t) => new Date(t).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });
let peer = null;
const readKey = () => 'zenith_read_' + me();
const readMap = () => JSON.parse(localStorage.getItem(readKey()) || '{}');
const convo = (p) => MSG.get().filter(m => (m.f === me() && m.t === p) || (m.f === p && m.t === me()));

function renderContacts() {
  const box = $('#chatContacts'); if (!box || !me()) return;
  const q = ($('#chatSearch').value || '').trim().toLowerCase().replace(/^@/, '');
  box.innerHTML = '';
  const list = Object.entries(DB.getUsers()).filter(([u]) => u !== me())
    .filter(([u, x]) => !q || u.includes(q) || (x.display || '').toLowerCase().includes(q));
  if (!list.length) { box.innerHTML = '<div class="chat-empty">لا يوجد مستخدمون</div>'; return; }
  list.forEach(([u, x]) => {
    const all = convo(u), last = all[all.length - 1], rd = readMap()[u] || 0;
    const unread = all.filter(m => m.f === u && m.at > rd).length;
    const el = document.createElement('div');
    el.className = 'chat-contact' + (u === peer ? ' active' : '');
    const av = document.createElement('div'); av.className = 'contact-avatar'; av.textContent = (x.display || u)[0].toUpperCase();
    const info = document.createElement('div'); info.className = 'contact-info';
    const nm = document.createElement('div'); nm.className = 'contact-name'; nm.textContent = x.display + ' @' + u;
    const pv = document.createElement('div'); pv.className = 'contact-preview';
    pv.textContent = last ? (last.type === 'text' ? last.text : '📎 ' + last.name) : 'ابدأ المحادثة';
    info.append(nm, pv); el.append(av, info);
    if (unread) { const b = document.createElement('div'); b.className = 'contact-unread'; b.textContent = unread; el.append(b); }
    el.onclick = () => { peer = u; const r = readMap(); r[u] = Date.now(); localStorage.setItem(readKey(), JSON.stringify(r)); renderContacts(); renderChat(); };
    box.append(el);
  });
}

function renderChat() {
  const box = $('#chatMessages'); if (!box) return;
  box.innerHTML = '';
  const u = DB.getUsers()[peer];
  $('#chatHeaderName').textContent = u ? u.display : '—';
  $('#chatHeaderStatus').textContent = u ? '@' + peer : 'اختر محادثة';
  $('#chatAvatar').textContent = u ? u.display[0].toUpperCase() : '?';
  if (!u) return;
  convo(peer).forEach(m => {
    const el = document.createElement('div');
    el.className = 'message ' + (m.f === me() ? 'outgoing' : 'incoming');
    if (m.type === 'text') el.append(document.createTextNode(m.text));
    else if (m.type === 'img' && m.data.startsWith('data:image/')) { const i = document.createElement('img'); i.src = m.data; i.alt = m.name; i.onclick = () => window.open().document.write('<img src="' + m.data + '" style="max-width:100%">'); el.append(i); }
    else if (m.data.startsWith('data:')) { const a = document.createElement('a'); a.className = 'file-chip'; a.href = m.data; a.download = m.name; a.textContent = '📄 ' + m.name + ' (' + Math.ceil(m.size / 1024) + ' KB)'; el.append(a); }
    const t = document.createElement('div'); t.className = 'message-time'; t.textContent = hhmm(m.at) + (m.f === me() ? ' ✓✓' : '');
    el.append(t); box.append(el);
  });
  box.scrollTop = box.scrollHeight;
}

function pushMsg(extra) {
  if (!peer) return toast('اختر محادثة أولاً');
  const a = MSG.get(); a.push({ id: crypto.randomUUID(), f: me(), t: peer, at: Date.now(), ...extra });
  if (!MSG.set(a)) return;
  bc.postMessage({ k: 'msg' }); renderChat(); renderContacts();
}
function sendMessage() {
  const input = $('#chatInput'), text = input.value.trim();
  if (!text) return; input.value = ''; pushMsg({ type: 'text', text });
}
$('#chatSend')?.addEventListener('click', sendMessage);
$('#chatInput')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
$('#chatSearch')?.addEventListener('input', renderContacts);
$('#chatAttach')?.addEventListener('click', () => $('#chatFile').click());
$('#chatFile')?.addEventListener('change', (e) => {
  [...e.target.files].forEach(f => {
    if (f.size > 1.5 * 1024 * 1024) return toast('الملف أكبر من 1.5MB: ' + f.name);
    const r = new FileReader();
    r.onload = () => pushMsg({ type: f.type.startsWith('image/') ? 'img' : 'file', name: f.name.slice(0, 80), size: f.size, data: r.result });
    r.readAsDataURL(f);
  });
  e.target.value = '';
});

/* ---- المكالمات (WebRTC) ---- */
let pc = null, stream = null, callPeer = null, pending = null, iceBuf = [];
const sig = (m) => bc.postMessage({ k: 'sig', from: me(), ...m });
const showCall = (name, st, incoming) => {
  $('#callOv').classList.add('on'); $('#callName').textContent = name; $('#callSt').textContent = st;
  $('#callAcc').style.display = incoming ? '' : 'none';
};
async function getMedia(video) {
  stream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
  $('#localVid').srcObject = stream; $('#localVid').style.display = video ? '' : 'none';
}
function mkPc() {
  const p = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
  p.onicecandidate = (e) => e.candidate && sig({ t: 'ice', to: callPeer, c: e.candidate });
  p.ontrack = (e) => { $('#remoteVid').srcObject = e.streams[0]; $('#callSt').textContent = 'متصل'; };
  p.onconnectionstatechange = () => { if (['failed', 'closed'].includes(p.connectionState)) endCall(false); };
  stream.getTracks().forEach(t => p.addTrack(t, stream));
  return p;
}
async function startCall(video) {
  if (!peer) return toast('اختر محادثة أولاً');
  if (pc) return;
  try { callPeer = peer; await getMedia(video); pc = mkPc();
    const o = await pc.createOffer(); await pc.setLocalDescription(o);
    sig({ t: 'offer', to: peer, sdp: o, video }); showCall(DB.getUsers()[peer].display, 'جاري الاتصال...', false);
  } catch (err) { toast('تعذر الوصول للميكروفون/الكاميرا'); endCall(false); }
}
async function acceptCall() {
  const m = pending; pending = null; if (!m) return;
  try { callPeer = m.from; await getMedia(m.video); pc = mkPc();
    await pc.setRemoteDescription(m.sdp);
    for (const c of iceBuf) await pc.addIceCandidate(c).catch(() => {}); iceBuf = [];
    const a = await pc.createAnswer(); await pc.setLocalDescription(a);
    sig({ t: 'answer', to: m.from, sdp: a }); showCall(DB.getUsers()[m.from]?.display || m.from, 'جاري الربط...', false);
  } catch { toast('تعذر بدء المكالمة'); endCall(true); }
}
function endCall(notify) {
  if (notify && callPeer) sig({ t: 'end', to: callPeer });
  if (pc) pc.close(); pc = null; callPeer = null; pending = null; iceBuf = [];
  if (stream) stream.getTracks().forEach(t => t.stop()); stream = null;
  $('#remoteVid').srcObject = null; $('#callOv').classList.remove('on');
}
$('#callVoice')?.addEventListener('click', () => startCall(false));
$('#callVideo')?.addEventListener('click', () => startCall(true));
$('#callAcc')?.addEventListener('click', acceptCall);
$('#callEnd')?.addEventListener('click', () => endCall(true));

bc.onmessage = async (e) => {
  const m = e.data;
  if (m.k === 'msg') { renderChat(); renderContacts(); return; }
  if (m.k === 'users') { renderContacts(); return; }
  if (m.k !== 'sig' || m.to !== me()) return;
  if (m.t === 'offer') {
    if (pc || pending) return sig({ t: 'end', to: m.from });
    pending = m; iceBuf = []; showCall(DB.getUsers()[m.from]?.display || m.from, m.video ? 'مكالمة فيديو واردة' : 'مكالمة صوتية واردة', true);
  } else if (m.t === 'answer' && pc) await pc.setRemoteDescription(m.sdp);
  else if (m.t === 'ice') { if (pc && pc.remoteDescription) await pc.addIceCandidate(m.c).catch(() => {}); else iceBuf.push(m.c); }
  else if (m.t === 'end') { toast('انتهت المكالمة'); endCall(false); }
};
window.addEventListener('storage', (e) => { if (e.key === 'zenith_users' || e.key === 'zenith_msgs') { renderContacts(); renderChat(); } });

/* ---- بحث Google ---- */
$('#gForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = $('#gInput').value.trim(); if (!q) return;
  window.open('https://www.google.com/search?q=' + encodeURIComponent(q), '_blank', 'noopener,noreferrer');
});

/* ============================================================
   8. الصفحة: الأصدقاء
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
   9. الصفحة: السجلات
   ============================================================ */
const logsTable = $('#logsTable');

function addLog(level, message) {
  if (!logsTable) return;

  const now = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

  const el = document.createElement('div');
  el.className = 'log-row';
  el.innerHTML = `
    <div class="log-time">${time}</div>
    <div class="log-level ${level.toLowerCase()}">${level}</div>
    <div class="log-msg">${message}</div>
  `;

  // إدراج قبل الصف الأخير لو كان header
  logsTable.appendChild(el);

  // احتفظ فقط بآخر 50 سجل
  const rows = logsTable.querySelectorAll('.log-row:not(.header)');
  if (rows.length > 50) rows[0].remove();
}

/* سجلات تجريبية */
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
   10. الإعدادات - Toggles
   ============================================================ */
$$('.toggle').forEach(t => {
  t.addEventListener('click', () => {
    t.classList.toggle('on');
    const setting = t.dataset.setting;
    const state = t.classList.contains('on') ? 'ON' : 'OFF';
    toast(`${setting}: ${state}`);
    addLog('INFO', `Setting ${setting} = ${state}`);
  });
});

/* ============================================================
   11. تحديث الإحصائيات
   ============================================================ */
setInterval(() => {
  const members = $('#dash-members');
  const messages = $('#dash-messages');
  if (members)  members.textContent = (12000 + Math.floor(Math.random() * 2000)).toLocaleString();
  if (messages) messages.textContent = (240 + Math.floor(Math.random() * 100)).toLocaleString();
}, 3000);

/* ============================================================
   12. التهيئة
   ============================================================ */
renderContacts();
renderChat();
renderFriends();
seedLogs();
setInterval(() => { if (me() && !$('#chatSearch').value) renderContacts(); }, 4000);

console.log('%c ZENITH v1.0 ', 'background:#8b0000;color:#fff;padding:4px 8px;border-radius:3px;font-weight:bold;', 'System ready');
