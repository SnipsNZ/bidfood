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
    if (e.key === 'Escape') {
      const calc = document.getElementById('calc-overlay');
      if (calc && calc.classList.contains('open')) { toggleCalc(); return; }
      showTitleSlide();
    }
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
// DARK MODE
// ========================
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  document.getElementById('dark-btn').classList.toggle('active', isDark);
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

  // Prep labour cost: time in hours × hourly rate
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

  // Landed cost: purchase price + freight %
  const landed = cost * (1 + freight / 100);

  // Total cost including prep labour
  const totalCost = landed + prepLabour;

  // Sell price ex GST via target margin
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

// Update button icon when fullscreen state changes
document.addEventListener('fullscreenchange', () => {
  const btn = document.getElementById('fullscreen-btn');
  btn.textContent = document.fullscreenElement ? '✕' : '⛶';
  btn.title = document.fullscreenElement ? 'Exit fullscreen' : 'Toggle fullscreen';
});
