// ============================================
//   HARSHIL KACHALIA PORTFOLIO - SCRIPT.JS
// ============================================

// ============================================
//   CUSTOM CURSOR
// ============================================
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');

let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top  = mouseY + 'px';
});

// Ring trails behind with smooth lag
function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top  = ringY + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

// Cursor grows on hover
const clickables = document.querySelectorAll(
  'a, button, .tab, .project-card, .skill-card, .achievement-card, .stat-item, .contact-card'
);

clickables.forEach(el => {
  el.addEventListener('mouseenter', () => {
    dot.style.width      = '18px';
    dot.style.height     = '18px';
    dot.style.background = 'var(--violet)';
    dot.style.boxShadow  = '0 0 18px var(--violet), 0 0 36px rgba(139,92,246,0.4)';
    ring.style.width       = '56px';
    ring.style.height      = '56px';
    ring.style.borderColor = 'rgba(139,92,246,0.5)';
  });
  el.addEventListener('mouseleave', () => {
    dot.style.width      = '10px';
    dot.style.height     = '10px';
    dot.style.background = 'var(--cyan)';
    dot.style.boxShadow  = '0 0 14px var(--cyan), 0 0 28px rgba(6,182,212,0.4)';
    ring.style.width       = '38px';
    ring.style.height      = '38px';
    ring.style.borderColor = 'rgba(6,182,212,0.5)';
  });
});

// Click burst
document.addEventListener('mousedown', () => {
  dot.style.transform  = 'translate(-50%,-50%) scale(0.5)';
  ring.style.transform = 'translate(-50%,-50%) scale(1.5)';
  ring.style.opacity   = '0.4';
});
document.addEventListener('mouseup', () => {
  dot.style.transform  = 'translate(-50%,-50%) scale(1)';
  ring.style.transform = 'translate(-50%,-50%) scale(1)';
  ring.style.opacity   = '1';
});


// ============================================
//   SCROLL PROGRESS LINE
// ============================================
const scrollLine = document.getElementById('scroll-line');

window.addEventListener('scroll', () => {
  const scrollTop     = window.scrollY;
  const docHeight     = document.documentElement.scrollHeight - window.innerHeight;
  const pct           = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollLine.style.width = pct + '%';
});


// ============================================
//   PAGE NAVIGATION
// ============================================
function navigate(page) {
  const pages = document.querySelectorAll('.page');
  const tabs  = document.querySelectorAll('.tab');

  pages.forEach(p => p.classList.remove('active'));
  tabs.forEach(t  => t.classList.remove('active'));

  const pageMap = { home: 0, achievements: 1, contact: 2 };
  document.querySelectorAll('.page')[pageMap[page]].classList.add('active');
  tabs[pageMap[page]].classList.add('active');

  // Scroll back to top on page switch
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ============================================
//   NAVBAR GLASSMORPHISM ON SCROLL
//   — increases blur + darkness as you scroll
// ============================================
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > 20) {
    navbar.style.background   = 'rgba(2,4,8,0.92)';
    navbar.style.backdropFilter = 'blur(32px) saturate(200%)';
    navbar.style.borderBottom = '1px solid rgba(6,182,212,0.15)';
    navbar.style.boxShadow    = '0 4px 40px rgba(0,0,0,0.5)';
  } else {
    navbar.style.background   = 'rgba(2,4,8,0.4)';
    navbar.style.backdropFilter = 'blur(20px) saturate(160%)';
    navbar.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
    navbar.style.boxShadow    = 'none';
  }
});


// ============================================
//   CARD TILT ON MOUSE MOVE (3D effect)
// ============================================
document.querySelectorAll('.project-card, .achievement-card, .skill-card, .stat-item').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect   = card.getBoundingClientRect();
    const x      = e.clientX - rect.left;
    const y      = e.clientY - rect.top;
    const cx     = rect.width  / 2;
    const cy     = rect.height / 2;
    const rotateX =  ((y - cy) / cy) * -8;
    const rotateY =  ((x - cx) / cx) *  8;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});


// ============================================
//   STAGGER FADE-IN ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll(
    '.stat-item, .project-card, .achievement-card, .skill-card, .contact-card'
  );
  items.forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(30px)';
    setTimeout(() => {
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      el.style.opacity    = '1';
      el.style.transform  = 'translateY(0)';
    }, 100 + i * 80);
  });
});
