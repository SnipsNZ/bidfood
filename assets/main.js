// ========================
// TITLE SLIDESHOW
// ========================
const titleSlides = [
  { color: 'var(--tonkotsu)', bowlId: 'bowl0', nameId: 'name0' },
  { color: 'var(--wonton)',   bowlId: 'bowl1', nameId: 'name1' },
  { color: 'var(--dandan)',   bowlId: 'bowl2', nameId: 'name2' },
];

let currentTitleSlide = 0;
let autoTimer = null;

function goToTitleSlide(idx) {
  const prev = titleSlides[currentTitleSlide];
  const next = titleSlides[idx];

  // hide previous bowl — reset animation by cloning
  const prevBowl = document.getElementById(prev.bowlId);
  prevBowl.classList.remove('visible');

  document.getElementById(prev.nameId).classList.remove('active');

  currentTitleSlide = idx;

  // show next bowl — re-trigger zoom animation
  const nextBowl = document.getElementById(next.bowlId);
  nextBowl.classList.remove('visible');
  // force reflow so animation restarts
  void nextBowl.offsetWidth;
  nextBowl.classList.add('visible');

  document.getElementById(next.nameId).classList.add('active');

  if (autoTimer) clearInterval(autoTimer);
  autoTimer = setInterval(nextTitleSlide, 5000);
}

function nextTitleSlide() {
  goToTitleSlide((currentTitleSlide + 1) % titleSlides.length);
}

// ========================
// PAGE NAVIGATION
// ========================
function showTitleSlide() {
  document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('title-slide');
  el.classList.add('active', 'entering');
  setTimeout(() => el.classList.remove('entering'), 500);
  // restart slideshow
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = setInterval(nextTitleSlide, 5000);
}

function showProductSlide(n) {
  document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
  const ids = [null, 'slide-tonkotsu', 'slide-wonton', 'slide-dandan'];
  const el = document.getElementById(ids[n]);
  if (!el) return;
  el.classList.add('active', 'entering');
  setTimeout(() => el.classList.remove('entering'), 500);
  // pause slideshow while on product pages
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = null;
}

// ========================
// KEYBOARD NAVIGATION
// ========================
document.addEventListener('keydown', e => {
  const active = document.querySelector('.slide.active');
  if (!active) return;
  if (active.id === 'title-slide') {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextTitleSlide();
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goToTitleSlide((currentTitleSlide + 2) % 3);
    if (e.key === 'Enter' || e.key === ' ') showProductSlide(currentTitleSlide + 1);
  } else {
    const order = ['slide-tonkotsu', 'slide-wonton', 'slide-dandan'];
    const idx = order.indexOf(active.id);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      if (idx < 2) showProductSlide(idx + 2); else showTitleSlide();
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (idx > 0) showProductSlide(idx); else showTitleSlide();
    }
    if (e.key === 'Escape') showTitleSlide();
  }
});

// ========================
// INIT
// ========================
document.addEventListener('DOMContentLoaded', () => {
  // wire up the view products button properly
  document.getElementById('view-products-btn').addEventListener('click', () => {
    showProductSlide(currentTitleSlide + 1);
  });
  autoTimer = setInterval(nextTitleSlide, 5000);
});

// ========================
// FULLSCREEN
// ========================
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// Update button icon when fullscreen state changes
document.addEventListener('fullscreenchange', () => {
  const btn = document.getElementById('fullscreen-btn');
  btn.textContent = document.fullscreenElement ? '✕' : '⛶';
  btn.title = document.fullscreenElement ? 'Exit fullscreen' : 'Toggle fullscreen';
});
