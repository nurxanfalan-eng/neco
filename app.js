/* ===========================
   NEXORA FOUNDATION - APP JS
   =========================== */

'use strict';

// ===========================
// STATE
// ===========================
const State = {
  currentPage: 'page-home',
  prevPage: null,
  prevScrollY: 0,
  currentSiteUrl: '',
  currentSiteName: '',
  currentSiteCategory: '',
  isDark: false,
  isAdminLoggedIn: false,
  notes: {
    1: localStorage.getItem('nexora_note1') || 'salam',
    2: localStorage.getItem('nexora_note2') || 'pendir'
  }
};

// ===========================
// INIT
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeroVideo();
  initNotes();
  initCounters();
  window.scrollTo(0, 0);
});

// ===========================
// THEME
// ===========================
function initTheme() {
  const saved = localStorage.getItem('nexora_theme');
  if (saved === 'dark') {
    enableDark();
  } else {
    enableLight();
  }
}

function toggleTheme() {
  if (State.isDark) enableLight();
  else enableDark();
}

function enableDark() {
  State.isDark = true;
  document.getElementById('body').classList.remove('light-mode');
  document.getElementById('body').classList.add('dark-mode');
  localStorage.setItem('nexora_theme', 'dark');
  updateThemeIcons('☀️');
}

function enableLight() {
  State.isDark = false;
  document.getElementById('body').classList.remove('dark-mode');
  document.getElementById('body').classList.add('light-mode');
  localStorage.setItem('nexora_theme', 'light');
  updateThemeIcons('🌙');
}

function updateThemeIcons(icon) {
  document.querySelectorAll('.theme-icon').forEach(el => el.textContent = icon);
}

// ===========================
// HERO VIDEO
// ===========================
function initHeroVideo() {
  const video = document.getElementById('heroVideo');
  if (!video) return;

  video.muted = true;
  video.playsInline = true;

  const tryPlay = () => {
    const p = video.play();
    if (p instanceof Promise) {
      p.catch(() => {
        // Autoplay blocked, wait for user interaction
        document.addEventListener('touchstart', () => video.play(), { once: true });
        document.addEventListener('click', () => video.play(), { once: true });
      });
    }
  };

  if (video.readyState >= 2) {
    tryPlay();
  } else {
    video.addEventListener('canplay', tryPlay, { once: true });
  }

  // Restart on end (loop is already set but just in case)
  video.addEventListener('ended', () => {
    video.currentTime = 0;
    video.play().catch(() => {});
  });
}

// ===========================
// PAGE NAVIGATION
// ===========================
function openPage(pageId) {
  // Save scroll position
  State.prevScrollY = window.scrollY;

  const current = document.getElementById(State.currentPage);
  const next = document.getElementById(pageId);

  if (!next || State.currentPage === pageId) return;

  State.prevPage = State.currentPage;
  State.currentPage = pageId;

  if (current) current.classList.remove('active');
  next.classList.add('active');
  next.classList.remove('slide-in');
  // Force reflow
  void next.offsetWidth;
  next.classList.add('slide-in');

  // Scroll to top of new page
  window.scrollTo(0, 0);
}

function goBack() {
  if (!State.prevPage) {
    openPage('page-home');
    return;
  }

  const current = document.getElementById(State.currentPage);
  const prev = document.getElementById(State.prevPage);

  State.currentPage = State.prevPage;
  State.prevPage = null;

  if (current) current.classList.remove('active');
  if (prev) {
    prev.classList.add('active');
    prev.classList.remove('slide-in');
    void prev.offsetWidth;
    prev.classList.add('slide-in');
  }

  // Restore scroll position (only for home page)
  if (State.currentPage === 'page-home') {
    requestAnimationFrame(() => {
      window.scrollTo(0, State.prevScrollY);
    });
  } else {
    window.scrollTo(0, 0);
  }
}

function scrollToTop() {
  if (State.currentPage !== 'page-home') {
    // Go to home first
    const current = document.getElementById(State.currentPage);
    const home = document.getElementById('page-home');
    if (current) current.classList.remove('active');
    if (home) home.classList.add('active');
    State.currentPage = 'page-home';
    State.prevPage = null;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===========================
// SITE VIEWER
// ===========================

const WhatsAppMessages = {
  restoran: 'Salam! Nexora Foundation-un Restoran xidmətini sifariş etmək istəyirəm. Ətraflı məlumat verə bilərsinizmi?',
  tehsil: 'Salam! Nexora Foundation-un Təhsil platformasını sifariş etmək istəyirəm. Ətraflı məlumat verə bilərsinizmi?',
  biznes: 'Salam! Nexora Foundation-un Biznes xidmətini sifariş etmək istəyirəm. Ətraflı məlumat verə bilərsinizmi?'
};

const WA_NUMBER = '994559406018';

function openSiteView(url, name, category) {
  State.currentSiteUrl = url;
  State.currentSiteName = name;
  State.currentSiteCategory = category;

  const frame = document.getElementById('siteFrame');
  const title = document.getElementById('siteviewTitle');

  if (frame) {
    frame.src = '';
    // Small delay to allow page switch first
    setTimeout(() => {
      frame.src = url;
    }, 80);
  }

  if (title) title.textContent = name;

  // Save previous page (services page)
  State.prevPage = State.currentPage;

  const current = document.getElementById(State.currentPage);
  const siteView = document.getElementById('page-siteview');

  State.prevScrollY = window.scrollY;
  State.currentPage = 'page-siteview';

  if (current) current.classList.remove('active');
  if (siteView) {
    siteView.classList.add('active');
    siteView.classList.remove('slide-in');
    void siteView.offsetWidth;
    siteView.classList.add('slide-in');
  }

  window.scrollTo(0, 0);
}

function closeSiteView() {
  const frame = document.getElementById('siteFrame');
  if (frame) frame.src = '';

  goBack();
}

function orderNow() {
  const msg = WhatsAppMessages[State.currentSiteCategory] ||
    `Salam! ${State.currentSiteName} saytı haqqında sifariş vermək istəyirəm.`;
  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/${WA_NUMBER}?text=${encoded}`, '_blank', 'noopener');
}

// ===========================
// ADMIN LOGIN
// ===========================
function openAdminLogin() {
  if (State.isAdminLoggedIn) {
    openPage('page-admin');
    return;
  }
  document.getElementById('adminModal').classList.add('open');
  setTimeout(() => {
    const u = document.getElementById('adminUser');
    if (u) u.focus();
  }, 150);
}

function closeAdminModal(event) {
  if (!event || event.target === document.getElementById('adminModal') || !event) {
    document.getElementById('adminModal').classList.remove('open');
    document.getElementById('adminError').textContent = '';
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
  }
}

function adminLogin() {
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value;
  const err = document.getElementById('adminError');

  if (user === 'admin' && pass === '0618') {
    State.isAdminLoggedIn = true;
    err.textContent = '';
    document.getElementById('adminModal').classList.remove('open');
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
    openPage('page-admin');
  } else {
    err.textContent = 'İstifadəçi adı və ya şifrə yanlışdır.';
    document.getElementById('adminPass').value = '';
    document.getElementById('adminPass').focus();
    // Shake animation
    const box = document.querySelector('.modal-box');
    box.style.animation = 'none';
    void box.offsetWidth;
    box.style.animation = 'shake 0.4s ease';
  }
}

// ===========================
// ADMIN NOTES
// ===========================
function initNotes() {
  document.getElementById('note1-view').textContent = State.notes[1];
  document.getElementById('note2-view').textContent = State.notes[2];
}

function editNote(n) {
  const view = document.getElementById(`note${n}-view`);
  const editArea = document.getElementById(`note${n}-edit`);
  const actions = document.getElementById(`note${n}-actions`);
  const btn = editArea.closest('.admin-note-card').querySelector('.note-edit-btn');

  editArea.value = State.notes[n];
  view.classList.add('hidden');
  editArea.classList.remove('hidden');
  actions.classList.remove('hidden');
  btn.classList.add('hidden');
  editArea.focus();
}

function saveNote(n) {
  const editArea = document.getElementById(`note${n}-edit`);
  const view = document.getElementById(`note${n}-view`);
  const actions = document.getElementById(`note${n}-actions`);
  const btn = editArea.closest('.admin-note-card').querySelector('.note-edit-btn');

  const val = editArea.value.trim();
  State.notes[n] = val;
  localStorage.setItem(`nexora_note${n}`, val);

  view.textContent = val;
  view.classList.remove('hidden');
  editArea.classList.add('hidden');
  actions.classList.add('hidden');
  btn.classList.remove('hidden');
}

function cancelEdit(n) {
  const editArea = document.getElementById(`note${n}-edit`);
  const view = document.getElementById(`note${n}-view`);
  const actions = document.getElementById(`note${n}-actions`);
  const btn = editArea.closest('.admin-note-card').querySelector('.note-edit-btn');

  view.classList.remove('hidden');
  editArea.classList.add('hidden');
  actions.classList.add('hidden');
  btn.classList.remove('hidden');
}

// ===========================
// COUNTERS
// ===========================
function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 1200;
  const step = Math.ceil(duration / target);
  let current = 0;

  const timer = setInterval(() => {
    current += Math.max(1, Math.floor(target / 60));
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = current + (target >= 100 ? '+' : '');
  }, step);
}

// ===========================
// SHAKE ANIMATION (CSS inject)
// ===========================
(function injectShake() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-6px)}
      40%{transform:translateX(6px)}
      60%{transform:translateX(-4px)}
      80%{transform:translateX(4px)}
    }
  `;
  document.head.appendChild(style);
})();

// ===========================
// KEYBOARD SUPPORT
// ===========================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('adminModal');
    if (modal.classList.contains('open')) {
      closeAdminModal();
    }
  }
});
