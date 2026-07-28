/* ===========================
   NEXORA FOUNDATION - APP JS
   =========================== */

'use strict';

// ===========================
// STATE
// ===========================
const State = {
  currentPage: 'page-home',
  pageStack: [],          // navigation stack
  scrollPositions: {},    // scroll positions per page
  currentSiteUrl: '',
  currentSiteName: '',
  currentSiteCategory: '',
  isDark: true
};

// ===========================
// INIT
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeroVideo();
  initCounters();
  window.scrollTo(0, 0);
});

// ===========================
// THEME
// ===========================
function initTheme() {
  const saved = localStorage.getItem('nexora_theme');
  // Default is dark
  if (saved === 'light') {
    enableLight();
  } else {
    enableDark();
  }
}

function toggleTheme() {
  if (State.isDark) enableLight();
  else enableDark();
}

function enableDark() {
  State.isDark = true;
  document.getElementById('body').className = 'dark-mode';
  localStorage.setItem('nexora_theme', 'dark');
  updateThemeIcons('☀️');
}

function enableLight() {
  State.isDark = false;
  document.getElementById('body').className = 'light-mode';
  localStorage.setItem('nexora_theme', 'light');
  updateThemeIcons('🌙');
}

function updateThemeIcons(icon) {
  document.querySelectorAll('.theme-icon').forEach(el => el.textContent = icon);
}

// ===========================
// HERO VIDEO - OPTIMIZED FOR MOBILE
// ===========================
function initHeroVideo() {
  const video = document.getElementById('heroVideo');
  if (!video) return;

  // Detect low-end / mobile devices
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const isSlowConnection = navigator.connection &&
    (navigator.connection.saveData ||
      ['slow-2g', '2g'].includes(navigator.connection.effectiveType));

  if (isSlowConnection) {
    // Skip video on very slow connections
    video.style.display = 'none';
    return;
  }

  // On mobile use lower quality if available, defer load
  if (isMobile) {
    video.setAttribute('preload', 'none');
  } else {
    video.setAttribute('preload', 'metadata');
  }

  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

  // Use IntersectionObserver to only play video when visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tryPlayVideo(video);
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.1 });

  observer.observe(video);

  // Fallback: start on interaction
  const onInteract = () => {
    tryPlayVideo(video);
    document.removeEventListener('touchstart', onInteract);
    document.removeEventListener('click', onInteract);
  };
  document.addEventListener('touchstart', onInteract, { passive: true });
  document.addEventListener('click', onInteract, { once: true });
}

function tryPlayVideo(video) {
  if (!video || video.paused === false) return;
  const p = video.play();
  if (p instanceof Promise) {
    p.catch(() => {});
  }
}

// ===========================
// PAGE NAVIGATION (with scroll position preservation)
// ===========================
function openPage(pageId) {
  if (State.currentPage === pageId) return;

  // Save current page scroll
  State.scrollPositions[State.currentPage] = window.scrollY;

  const current = document.getElementById(State.currentPage);
  const next = document.getElementById(pageId);
  if (!next) return;

  // Push to stack
  State.pageStack.push(State.currentPage);
  State.currentPage = pageId;

  if (current) current.classList.remove('active');
  next.classList.add('active');
  next.classList.remove('slide-in');
  void next.offsetWidth;
  next.classList.add('slide-in');

  // Restore or reset scroll for new page
  const savedScroll = State.scrollPositions[pageId] || 0;
  requestAnimationFrame(() => {
    window.scrollTo(0, savedScroll);
  });
}

function goBack() {
  if (State.pageStack.length === 0) {
    _switchTo('page-home');
    return;
  }

  // Save current scroll
  State.scrollPositions[State.currentPage] = window.scrollY;

  const prevPageId = State.pageStack.pop();
  const current = document.getElementById(State.currentPage);
  const prev = document.getElementById(prevPageId);

  State.currentPage = prevPageId;

  if (current) current.classList.remove('active');
  if (prev) {
    prev.classList.add('active');
    prev.classList.remove('slide-in');
    void prev.offsetWidth;
    prev.classList.add('slide-in');
  }

  // Restore scroll
  const savedScroll = State.scrollPositions[prevPageId] || 0;
  requestAnimationFrame(() => {
    window.scrollTo(0, savedScroll);
  });
}

// Go back to services page specifically
function goBackToServices() {
  // Save current scroll
  State.scrollPositions[State.currentPage] = window.scrollY;

  const current = document.getElementById(State.currentPage);
  const services = document.getElementById('page-services');

  State.currentPage = 'page-services';
  // Remove sub-pages from stack until services or empty
  while (State.pageStack.length > 0 && State.pageStack[State.pageStack.length - 1] !== 'page-services') {
    State.pageStack.pop();
  }
  if (State.pageStack.length > 0) State.pageStack.pop(); // remove services itself if there

  if (current) current.classList.remove('active');
  if (services) {
    services.classList.add('active');
    services.classList.remove('slide-in');
    void services.offsetWidth;
    services.classList.add('slide-in');
  }

  const savedScroll = State.scrollPositions['page-services'] || 0;
  requestAnimationFrame(() => {
    window.scrollTo(0, savedScroll);
  });
}

function openSubPage(pageId) {
  // Save current services scroll
  State.scrollPositions[State.currentPage] = window.scrollY;

  const current = document.getElementById(State.currentPage);
  const next = document.getElementById(pageId);
  if (!next) return;

  State.pageStack.push(State.currentPage);
  State.currentPage = pageId;

  if (current) current.classList.remove('active');
  next.classList.add('active');
  next.classList.remove('slide-in');
  void next.offsetWidth;
  next.classList.add('slide-in');

  window.scrollTo(0, 0);
}

function _switchTo(pageId) {
  const current = document.getElementById(State.currentPage);
  const next = document.getElementById(pageId);
  if (!next) return;

  State.pageStack = [];
  State.currentPage = pageId;

  if (current) current.classList.remove('active');
  next.classList.add('active');

  const savedScroll = State.scrollPositions[pageId] || 0;
  requestAnimationFrame(() => {
    window.scrollTo(0, savedScroll);
  });
}

function scrollToTop() {
  if (State.currentPage !== 'page-home') {
    _switchTo('page-home');
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

  // Save scroll position of the sub-page (saytlar)
  State.scrollPositions[State.currentPage] = window.scrollY;

  const frame = document.getElementById('siteFrame');
  const title = document.getElementById('siteviewTitle');

  if (frame) {
    frame.src = '';
    setTimeout(() => { frame.src = url; }, 80);
  }
  if (title) title.textContent = name;

  State.pageStack.push(State.currentPage);
  const current = document.getElementById(State.currentPage);
  const siteView = document.getElementById('page-siteview');

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
  const duration = 1000;
  const fps = 30;
  const steps = Math.floor(duration / (1000 / fps));
  let current = 0;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    current = Math.round(target * (step / steps));
    if (step >= steps) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = current + (target >= 100 ? '+' : '');
  }, 1000 / fps);
}

// ===========================
// KEYBOARD SUPPORT
// ===========================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && State.currentPage !== 'page-home') {
    goBack();
  }
});
