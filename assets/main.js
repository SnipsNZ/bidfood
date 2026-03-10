// ========================
// TITLE SLIDESHOW
// ========================
const titleSlides = [
  { color: 'var(--tonkotsu)', bowlId: 'bowl0', nameId: 'name0' },
  { color: 'var(--wonton)',   bowlId: 'bowl1', nameId: 'name1' },
  { color: 'var(--dandan)',   bowlId: 'bowl2', nameId: 'name2' },
  { color: 'var(--gyoza)',    bowlId: 'bowl3', nameId: 'name3' },
  { color: 'var(--dumpling)', bowlId: 'bowl4', nameId: 'name4' },
  { color: 'var(--shumai)',   bowlId: 'bowl5', nameId: 'name5' },
  { color: 'var(--hargow)',   bowlId: 'bowl6', nameId: 'name6' },
];

let currentTitleSlide = 0;
let autoTimer = null;

function goToTitleSlide(idx) {
  const prev = titleSlides[currentTitleSlide];
  const next = titleSlides[idx];

  const prevBowl = document.getElementById(prev.bowlId);
  prevBowl.classList.remove('visible');
  document.getElementById(prev.nameId).classList.remove('active');

  currentTitleSlide = idx;

  const nextBowl = document.getElementById(next.bowlId);
  nextBowl.classList.remove('visible');
  void nextBowl.offsetWidth;
  nextBowl.classList.add('visible');
  document.getElementById(next.nameId).classList.add('active');

  document.querySelectorAll('.title-dot').forEach((d, i) => d.classList.toggle('active', i === idx));

  if (autoTimer) clearInterval(autoTimer);
  autoTimer = setInterval(nextTitleSlide, 5000);
}

function nextTitleSlide() {
  goToTitleSlide((currentTitleSlide + 1) % titleSlides.length);
}

// ========================
// WATERMARK COLOUR
// ========================
const accentColors = ['', '#D4890A', '#2E9E72', '#C0394A', '#C4A020', '#8DC030', '#4AB8D8', '#E07028'];

function updateWatermark(n) {
  const logo = document.querySelector('.nav-logo');
  if (!logo) return;
  if (document.body.classList.contains('dark-mode') && n >= 1 && n <= 7) {
    logo.style.backgroundColor = accentColors[n];
  } else {
    logo.style.backgroundColor = '';
  }
}

// ========================
// PAGE NAVIGATION
// ========================
const SWIPE_MS = 380;
let isAnimating = false;

function showTitleSlide() {
  document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('title-slide');
  el.classList.add('active', 'entering');
  setTimeout(() => el.classList.remove('entering'), 500);
  document.body.classList.remove('on-product');
  pauseProductPlay();
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = setInterval(nextTitleSlide, 5000);
}

const productIds = [null, 'slide-tonkotsu', 'slide-wonton', 'slide-dandan', 'slide-gyoza', 'slide-dumpling', 'slide-shumai', 'slide-hargow'];

function showProductSlide(n, direction) {
  if (isAnimating) return;
  const nextEl = document.getElementById(productIds[n]);
  if (!nextEl) return;

  const prevEl = document.querySelector('.slide.active');

  // Determine swipe direction if not given
  if (direction === undefined) {
    if (!prevEl || prevEl.id === 'title-slide') {
      direction = 'forward';
    } else {
      const prevIdx = productIds.indexOf(prevEl.id);
      direction = n > prevIdx ? 'forward' : 'backward';
    }
  }

  const fromTitle = !prevEl || prevEl.id === 'title-slide';

  if (fromTitle) {
    // Fade in from title (no swipe)
    if (prevEl) prevEl.classList.remove('active');
    nextEl.classList.add('active', 'entering');
    setTimeout(() => nextEl.classList.remove('entering'), 500);
  } else {
    // Swipe transition
    isAnimating = true;
    const outClass = direction === 'forward' ? 'swipe-out-left'  : 'swipe-out-right';
    const inClass  = direction === 'forward' ? 'swipe-in-right'  : 'swipe-in-left';

    prevEl.classList.remove('active');
    prevEl.classList.add(outClass);
    nextEl.classList.add('active', inClass);

    setTimeout(() => {
      prevEl.classList.remove(outClass);
      nextEl.classList.remove(inClass);
      isAnimating = false;
    }, SWIPE_MS);
  }

  document.body.classList.add('on-product');
  currentProductIdx = n;
  updateWatermark(n);

  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  if (productTimer) {
    clearInterval(productTimer);
    productTimer = setInterval(() => {
      currentProductIdx = (currentProductIdx % 7) + 1;
      showProductSlide(currentProductIdx, 'forward');
    }, 10000);
  }
}

// ========================
// KEYBOARD NAVIGATION
// ========================
document.addEventListener('keydown', e => {
  if (isAnimating) return;
  const active = document.querySelector('.slide.active');
  if (!active) return;
  if (active.id === 'title-slide') {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextTitleSlide();
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goToTitleSlide((currentTitleSlide + 6) % 7);
    if (e.key === 'Enter' || e.key === ' ') showProductSlide(currentTitleSlide + 1, 'forward');
  } else {
    const order = ['slide-tonkotsu', 'slide-wonton', 'slide-dandan', 'slide-gyoza', 'slide-dumpling', 'slide-shumai', 'slide-hargow'];
    const idx = order.indexOf(active.id);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      if (idx < 6) showProductSlide(idx + 2, 'forward'); else showTitleSlide();
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (idx > 0) showProductSlide(idx, 'backward'); else showTitleSlide();
    }
    if (e.key === 'Escape') {
      const calc = document.getElementById('calc-overlay');
      if (calc && calc.classList.contains('open')) { toggleCalc(); return; }
      showTitleSlide();
    }
  }
});

// ========================
// TOUCH / SWIPE
// ========================
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
  if (isAnimating) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return; // too short or more vertical

  const active = document.querySelector('.slide.active');
  if (!active || active.id === 'title-slide') return;

  const order = ['slide-tonkotsu', 'slide-wonton', 'slide-dandan', 'slide-gyoza', 'slide-dumpling', 'slide-shumai', 'slide-hargow'];
  const idx = order.indexOf(active.id);
  if (dx < 0) {
    if (idx < 6) showProductSlide(idx + 2, 'forward'); else showTitleSlide();
  } else {
    if (idx > 0) showProductSlide(idx, 'backward'); else showTitleSlide();
  }
}, { passive: true });

// ========================
// INIT
// ========================
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  autoTimer = setInterval(nextTitleSlide, 5000);
});

// ========================
// PRODUCT AUTO-PLAY
// ========================
let productTimer = null;
let currentProductIdx = 1;

function toggleProductPlay() {
  productTimer ? pauseProductPlay() : startProductPlay();
}

function startProductPlay() {
  const btn = document.getElementById('play-btn');
  btn.textContent = '⏸';
  btn.title = 'Pause';
  btn.classList.add('active');
  productTimer = setInterval(() => {
    currentProductIdx = (currentProductIdx % 7) + 1;
    showProductSlide(currentProductIdx, 'forward');
  }, 10000);
}

function pauseProductPlay() {
  clearInterval(productTimer);
  productTimer = null;
  const btn = document.getElementById('play-btn');
  btn.textContent = '▶';
  btn.title = 'Auto-play products';
  btn.classList.remove('active');
}

// ========================
// DARK MODE  (3-state cycle: tinted → light → dark → tinted)
// ========================
let themeState = 2; // default: tinted
const themeBtn = () => document.getElementById('dark-btn');

function applyTheme() {
  document.body.classList.remove('dark-mode', 'tinted-mode', 'dark-ui', 'light-mode');
  const btn = themeBtn();
  if (themeState === 1) {
    document.body.classList.add('light-mode');
    btn.classList.remove('active');
    btn.title = 'Dark mode';
    btn.textContent = '◑';
  } else if (themeState === 2) {
    document.body.classList.add('tinted-mode', 'dark-ui');
    btn.classList.add('active');
    btn.title = 'Light mode';
    btn.textContent = '◑';
  } else {
    document.body.classList.add('dark-mode', 'dark-ui');
    btn.classList.add('active');
    btn.title = 'Themed dark mode';
    btn.textContent = '●';
  }
  updateWatermark(currentProductIdx);
}

function toggleDarkMode() {
  themeState = (themeState + 1) % 3;
  applyTheme();
}

// ========================
// PRICE CALCULATOR
// ========================
function toggleCalc() {
  const overlay = document.getElementById('calc-overlay');
  const btn = document.getElementById('calc-btn');
  const isOpen = overlay.classList.toggle('open');
  btn.classList.toggle('active', isOpen);
  if (isOpen) calcPrice();
}

function handleCalcOverlayClick(e) {
  if (e.target === e.currentTarget) toggleCalc();
}

function calcPrice() {
  const cost       = parseFloat(document.getElementById('c-cost').value)       || 0;
  const freight    = parseFloat(document.getElementById('c-freight').value)     || 0;
  const prepTime   = parseFloat(document.getElementById('c-preptime').value)    || 0;
  const labourRate = parseFloat(document.getElementById('c-labourrate').value)  || 0;
  const margin     = parseFloat(document.getElementById('c-margin').value)      || 0;
  const gst        = parseFloat(document.getElementById('c-gst').value)         || 0;

  const fmt  = v => '$' + v.toFixed(2);
  const dash = '—';

  const prepLabour = (prepTime / 60) * labourRate;
  document.getElementById('r-prep').textContent = prepLabour > 0 ? fmt(prepLabour) : dash;

  if (cost <= 0) {
    document.getElementById('r-landed').textContent = dash;
    document.getElementById('r-cost').textContent   = dash;
    document.getElementById('r-exgst').textContent  = dash;
    document.getElementById('r-gst').textContent    = dash;
    document.getElementById('r-final').textContent  = dash;
    return;
  }

  const landed = cost + freight;
  const totalCost = landed + prepLabour;
  const marginFactor = margin < 100 ? (1 - margin / 100) : null;
  const exGST  = marginFactor ? totalCost / marginFactor : 0;
  const gstAmt = exGST * (gst / 100);
  const final  = exGST + gstAmt;

  document.getElementById('r-landed').textContent = fmt(landed);
  document.getElementById('r-cost').textContent   = fmt(totalCost);
  document.getElementById('r-exgst').textContent  = marginFactor ? fmt(exGST)  : dash;
  document.getElementById('r-gst').textContent    = marginFactor ? fmt(gstAmt) : dash;
  document.getElementById('r-final').textContent  = marginFactor ? fmt(final)  : dash;
}

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

document.addEventListener('fullscreenchange', () => {
  const btn = document.getElementById('fullscreen-btn');
  btn.textContent = document.fullscreenElement ? '✕' : '⛶';
  btn.title = document.fullscreenElement ? 'Exit fullscreen' : 'Toggle fullscreen';
});
