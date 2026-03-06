// ========================
// TITLE SLIDESHOW
// ========================
const titleSlides = [
  { color: 'var(--tonkotsu)', bowlId: 'bowl0', nameId: 'name0', dotId: 'dot0' },
  { color: 'var(--wonton)',   bowlId: 'bowl1', nameId: 'name1', dotId: 'dot1' },
  { color: 'var(--dandan)',   bowlId: 'bowl2', nameId: 'name2', dotId: 'dot2' },
];

let currentTitleSlide = 0;
let autoTimer;

function goToTitleSlide(idx) {
  const prev = titleSlides[currentTitleSlide];
  const next = titleSlides[idx];

  document.getElementById(prev.bowlId).classList.remove('visible');
  document.getElementById(prev.nameId).classList.remove('active');
  document.getElementById(prev.dotId).classList.remove('active');

  currentTitleSlide = idx;

  document.getElementById(next.bowlId).classList.add('visible');
  document.getElementById(next.nameId).classList.add('active');
  document.getElementById(next.dotId).classList.add('active');
  document.getElementById('accentBar').style.background = next.color;
  document.getElementById('titleBottomBar').style.background = next.color;

  clearInterval(autoTimer);
  autoTimer = setInterval(nextTitleSlide, 5000);
}

function nextTitleSlide() {
  goToTitleSlide((currentTitleSlide + 1) % titleSlides.length);
}

// ========================
// PAGE NAVIGATION
// ========================
const allSlides = document.querySelectorAll('.slide');

function showTitleSlide() {
  allSlides.forEach(s => s.classList.remove('active'));
  const el = document.getElementById('title-slide');
  el.classList.add('active', 'entering');
  setTimeout(() => el.classList.remove('entering'), 500);
}

function showProductSlide(n) {
  allSlides.forEach(s => s.classList.remove('active'));
  const ids = [null, 'slide-tonkotsu', 'slide-wonton', 'slide-dandan'];
  const el = document.getElementById(ids[n]);
  el.classList.add('active', 'entering');
  setTimeout(() => el.classList.remove('entering'), 500);
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
    if (e.key === 'Enter' || e.key === ' ')               showProductSlide(currentTitleSlide + 1);
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
autoTimer = setInterval(nextTitleSlide, 5000);
