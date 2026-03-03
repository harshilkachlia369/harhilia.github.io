/* ============================================================
   FUTURISTIC 3D PORTFOLIO — script.js
   Pure Vanilla JavaScript | No Frameworks
   Author: Senior Creative Frontend Developer
   ============================================================

   TABLE OF CONTENTS
   ─────────────────
   1.  Page Loader
   2.  Custom Cursor
   3.  Particle Canvas Background
   4.  Navbar — Scroll + Mobile Toggle
   5.  Hero 3D Parallax (Mouse)
   6.  3D Card Tilt (Mouse)
   7.  Scroll Reveal (Intersection Observer)
   8.  Skill Bar Animations
   9.  Typewriter Effect
   10. Back-to-Top Button
   11. Active Nav Link on Scroll
   12. Smooth Anchor Scroll
   13. Form Handling (UX feedback)
   14. Init
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   HELPER UTILITIES
───────────────────────────────────────── */

/**
 * Clamp a number between min and max.
 * Like keeping a ball inside a box.
 */
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/**
 * Linear interpolation — smoothly move from A toward B.
 * Think of it like slowly sliding a dial.
 */
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Map a value from one range to another.
 * e.g. mouse position (0→window.width) to rotation (-15→+15 deg)
 */
const mapRange = (value, inMin, inMax, outMin, outMax) =>
  ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;

/** Check if device is likely mobile/touch */
const isMobile = () => window.innerWidth <= 480;
const isTablet = () => window.innerWidth <= 900;

/* ─────────────────────────────────────────
   1. PAGE LOADER
   Shows a loading bar, then fades out.
───────────────────────────────────────── */
function initPageLoader() {
  const loader = document.querySelector('.page-loader');
  if (!loader) return;

  // Hide loader after CSS animation (load bar) finishes
  // We give it 1.9s (0.3s delay + 1.4s animation + 0.2s buffer)
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      // Remove from DOM entirely after fade-out
      setTimeout(() => loader.remove(), 700);
    }, 1800);
  });
}

/* ─────────────────────────────────────────
   2. CUSTOM CURSOR
   A small dot + a larger ring that follow the mouse.
   The ring lags slightly for a smooth feel.
───────────────────────────────────────── */
function initCustomCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  // Skip custom cursor on touch devices
  if ('ontouchstart' in window) {
    dot.style.display = 'none';
    ring.style.display = 'none';
    document.body.style.cursor = '';
    return;
  }

  // Current and target positions for the ring (we lerp it)
  let dotX = 0,  dotY = 0;
  let ringX = 0, ringY = 0;
  let targetX = 0, targetY = 0;

  // Track raw mouse position
  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;

    // Dot snaps instantly
    dotX = targetX;
    dotY = targetY;
    dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
  });

  // Animate ring with lerp in a loop
  function animateCursor() {
    // Lerp ring toward mouse — 0.12 = 12% of the remaining distance per frame
    ringX = lerp(ringX, targetX, 0.12);
    ringY = lerp(ringY, targetY, 0.12);
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Enlarge ring on hoverable elements
  const hoverables = document.querySelectorAll(
    'a, button, .project-card, .social-link, .card-link, .btn, [data-cursor-hover]'
  );
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('cursor-hover'));
  });

  // Hide cursor when it leaves the window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
}

/* ─────────────────────────────────────────
   3. PARTICLE CANVAS BACKGROUND
   Draws floating dots connected by lines.
   Imagine fireflies floating in the dark!
───────────────────────────────────────── */
function initParticleCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Responsive particle count
  const PARTICLE_COUNT = isMobile() ? 40 : isTablet() ? 70 : 110;
  const CONNECTION_DIST = isMobile() ? 80 : 140; // max distance to draw lines
  const MOUSE_REPEL_DIST = 120;  // particles run away from cursor
  const MOUSE_REPEL_FORCE = 0.8;

  let W, H;
  let particles = [];
  let mouse = { x: -9999, y: -9999 };

  // ── Resize canvas to fill window ──
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); buildParticles(); });

  // ── Track mouse for repulsion ──
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // ── Particle class ──
  class Particle {
    constructor() { this.reset(true); }

    reset(randomY = false) {
      this.x  = Math.random() * W;
      this.y  = randomY ? Math.random() * H : H + 10;
      this.vx = (Math.random() - 0.5) * 0.4;   // horizontal drift
      this.vy = -(Math.random() * 0.4 + 0.1);   // drift upward
      this.size   = Math.random() * 1.8 + 0.5;
      this.alpha  = Math.random() * 0.5 + 0.2;
      this.alphaDir = (Math.random() > 0.5 ? 1 : -1) * 0.003;

      // Color — mix of cyan and purple
      this.color = Math.random() > 0.5 ? '0, 245, 255' : '180, 0, 255';
    }

    update() {
      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_REPEL_DIST && dist > 0) {
        const force = (MOUSE_REPEL_DIST - dist) / MOUSE_REPEL_DIST * MOUSE_REPEL_FORCE;
        this.vx += (dx / dist) * force * 0.05;
        this.vy += (dy / dist) * force * 0.05;
      }

      // Apply velocity
      this.x += this.vx;
      this.y += this.vy;

      // Dampen velocity (friction)
      this.vx *= 0.99;
      this.vy *= 0.99;

      // Twinkle (breathe alpha)
      this.alpha += this.alphaDir;
      if (this.alpha > 0.7 || this.alpha < 0.15) this.alphaDir *= -1;

      // Wrap horizontally
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;

      // Reset when goes off top
      if (this.y < -10) this.reset();
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
      ctx.fill();
    }
  }

  function buildParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }
  buildParticles();

  // ── Main draw loop ──
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Update + draw each particle
    particles.forEach(p => { p.update(); p.draw(); });

    // Draw connecting lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          // Fade line based on distance
          const alpha = (1 - dist / CONNECTION_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 245, 255, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
}

/* ─────────────────────────────────────────
   4. NAVBAR — SCROLL BEHAVIOR + MOBILE TOGGLE
───────────────────────────────────────── */
function initNavbar() {
  const navbar    = document.querySelector('.navbar');
  const toggle    = document.querySelector('.nav-toggle');
  const navLinks  = document.querySelector('.nav-links');
  if (!navbar) return;

  // Add .scrolled class when page scrolls down
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile hamburger toggle
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('open');
      navLinks.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        toggle.classList.remove('open');
        navLinks.classList.remove('open');
      }
    });
  }
}

/* ─────────────────────────────────────────
   5. HERO 3D PARALLAX (Mouse Move)
   The hero 3D object tilts toward your mouse.
   Think of it like a ball that watches your cursor!
───────────────────────────────────────── */
function initHeroParallax() {
  const scene   = document.querySelector('.hero-3d-scene');
  const wrapper = document.querySelector('.scene-wrapper');
  if (!scene || !wrapper) return;

  // Disable on mobile (performance)
  if (isMobile()) return;

  let targetRX = 0, targetRY = 0;
  let currentRX = 0, currentRY = 0;

  document.addEventListener('mousemove', (e) => {
    // Map mouse to -1 → +1 range
    const nx = (e.clientX / window.innerWidth)  * 2 - 1; // -1 left, +1 right
    const ny = (e.clientY / window.innerHeight) * 2 - 1; // -1 top,  +1 bottom

    // Convert to rotation degrees (max ±12 degrees)
    targetRY =  nx * 12;
    targetRX = -ny * 8;
  });

  // Smoothly interpolate to target rotation
  function animate() {
    currentRX = lerp(currentRX, targetRX, 0.05);
    currentRY = lerp(currentRY, targetRY, 0.05);

    // Apply rotation to the wrapper (the cube CSS animation still plays on top)
    // We use translate3d to force GPU compositing (smooth 60fps)
    wrapper.style.transform = `rotateX(${currentRX}deg) rotateY(${currentRY}deg)`;

    requestAnimationFrame(animate);
  }
  animate();

  // Reset on mouse leave
  scene.addEventListener('mouseleave', () => {
    targetRX = 0;
    targetRY = 0;
  });
}

/* ─────────────────────────────────────────
   6. 3D CARD TILT (Mouse Hover)
   When you hover over a project card, it tilts
   toward your mouse — like a magic mirror!
───────────────────────────────────────── */
function initCardTilt() {
  // Skip on mobile
  if (isMobile()) return;

  const cards = document.querySelectorAll('.project-card');

  cards.forEach(card => {
    const wrapper = card.closest('.card-3d-wrapper') || card;
    const shine   = card.querySelector('.card-shine');

    wrapper.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();

      // Mouse position relative to card center (range: -1 to +1)
      const cx = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 to +0.5
      const cy = (e.clientY - rect.top)  / rect.height - 0.5;

      // Tilt — max ±15 degrees
      const rotX = -cy * 15; // tilt up/down
      const rotY =  cx * 15; // tilt left/right

      // Perspective scale on hover
      card.style.transform = `
        perspective(900px)
        rotateX(${rotX}deg)
        rotateY(${rotY}deg)
        scale3d(1.04, 1.04, 1.04)
        translateZ(10px)
      `;

      // Move shine highlight to match mouse
      if (shine) {
        // Convert to percentage for the CSS radial-gradient
        const px = ((e.clientX - rect.left) / rect.width)  * 100;
        const py = ((e.clientY - rect.top)  / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${px}%`);
        card.style.setProperty('--mouse-y', `${py}%`);
      }
    });

    wrapper.addEventListener('mouseleave', () => {
      // Smoothly spring back
      card.style.transform = `
        perspective(900px)
        rotateX(0deg)
        rotateY(0deg)
        scale3d(1, 1, 1)
        translateZ(0px)
      `;
      card.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
      setTimeout(() => { card.style.transition = ''; }, 600);
    });

    wrapper.addEventListener('mouseenter', () => {
      // Disable slow transition while actively moving
      card.style.transition = 'transform 0.08s linear, box-shadow 0.3s, border-color 0.3s';
    });
  });
}

/* ─────────────────────────────────────────
   7. SCROLL REVEAL (Intersection Observer)
   Sections fade in as you scroll down.
   Like curtains opening on a stage!
───────────────────────────────────────── */
function initScrollReveal() {
  // Select all elements that should animate in
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Once visible, no need to watch anymore
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,       // trigger when 12% of element is visible
      rootMargin: '0px 0px -60px 0px' // slight negative margin = triggers a bit later
    }
  );

  revealEls.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────
   8. SKILL BAR ANIMATIONS
   Progress bars fill up when they scroll into view.
   Like a loading bar filling up — satisfying!
───────────────────────────────────────── */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar     = entry.target;
          const percent = bar.getAttribute('data-percent') || '0';

          // Delay slightly so scroll animation and bar fill don't overlap
          setTimeout(() => {
            bar.style.width = `${percent}%`;
          }, 200);

          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.3 }
  );

  bars.forEach(bar => {
    // Start at 0 (CSS starts at 0 too)
    bar.style.width = '0%';
    observer.observe(bar);
  });
}

/* ─────────────────────────────────────────
   9. TYPEWRITER EFFECT
   Types out text character by character.
   Looks like someone is typing in real time!
───────────────────────────────────────── */
function initTypewriter() {
  const el = document.querySelector('[data-typewriter]');
  if (!el) return;

  // Get the list of phrases to cycle through
  const phrases = JSON.parse(el.getAttribute('data-typewriter') || '[]');
  if (!phrases.length) return;

  let phraseIndex = 0;
  let charIndex   = 0;
  let isDeleting  = false;
  let isPaused    = false;

  const TYPING_SPEED  = 80;   // ms per character typed
  const DELETE_SPEED  = 40;   // ms per character deleted
  const PAUSE_AFTER   = 1800; // ms to wait before deleting
  const PAUSE_BEFORE  = 400;  // ms to wait before typing next phrase

  function tick() {
    const phrase     = phrases[phraseIndex];
    const currentTxt = phrase.substring(0, charIndex);

    // Update element text — cursor span is preserved separately
    // So we only update the text node before the cursor
    const cursor = el.querySelector('.typed-cursor');
    el.textContent = currentTxt;
    if (cursor) el.appendChild(cursor);

    if (!isDeleting) {
      // Typing forward
      if (charIndex < phrase.length) {
        charIndex++;
        setTimeout(tick, TYPING_SPEED);
      } else if (!isPaused) {
        // Finished typing — pause, then start deleting
        isPaused = true;
        setTimeout(() => { isDeleting = true; isPaused = false; tick(); }, PAUSE_AFTER);
      }
    } else {
      // Deleting
      if (charIndex > 0) {
        charIndex--;
        setTimeout(tick, DELETE_SPEED);
      } else {
        // Finished deleting — move to next phrase
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, PAUSE_BEFORE);
      }
    }
  }

  tick();
}

/* ─────────────────────────────────────────
   10. BACK-TO-TOP BUTTON
───────────────────────────────────────── */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  // Show after scrolling down 400px
  const onScroll = () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─────────────────────────────────────────
   11. ACTIVE NAV LINK ON SCROLL
   Highlights the correct nav link based on
   which section is currently on screen.
───────────────────────────────────────── */
function initActiveNavLinks() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', isActive);
          });
        }
      });
    },
    {
      rootMargin: '-40% 0px -55% 0px', // trigger when section is roughly in middle
      threshold: 0
    }
  );

  sections.forEach(sec => observer.observe(sec));
}

/* ─────────────────────────────────────────
   12. SMOOTH ANCHOR SCROLL
   Clicking nav links scrolls smoothly to section,
   accounting for the fixed navbar height.
───────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navbarH = document.querySelector('.navbar')?.offsetHeight || 80;
      const top     = target.getBoundingClientRect().top + window.scrollY - navbarH - 20;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ─────────────────────────────────────────
   13. FORM HANDLING
   Gives visual feedback when user submits form.
───────────────────────────────────────── */
function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!submitBtn) return;

    // Show loading state
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Simulate async send (replace with real fetch/API call)
    await new Promise(resolve => setTimeout(resolve, 1600));

    // Success state
    submitBtn.textContent = '✓ Message Sent!';
    submitBtn.style.background = 'linear-gradient(135deg, #00ff88, #00c8ff)';

    // Reset after 3 seconds
    setTimeout(() => {
      submitBtn.textContent   = originalText;
      submitBtn.disabled      = false;
      submitBtn.style.background = '';
      form.reset();
    }, 3000);
  });
}

/* ─────────────────────────────────────────
   14. STAT NUMBER COUNTER
   Counts up numbers for the About stats section.
   Makes numbers animate from 0 to their value!
───────────────────────────────────────── */
function initStatCounters() {
  const stats = document.querySelectorAll('.stat-number[data-count]');
  if (!stats.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el       = entry.target;
        const target   = parseInt(el.getAttribute('data-count'), 10);
        const suffix   = el.getAttribute('data-suffix') || '';
        const duration = 1800; // ms
        const start    = performance.now();

        function update(now) {
          const elapsed  = now - start;
          const progress = Math.min(elapsed / duration, 1);

          // Ease out cubic — starts fast, slows down
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.round(eased * target);

          el.textContent = value + suffix;

          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  stats.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────
   15. CUBE FACE LABELS (Easter Egg)
   Adds dynamic text labels to the cube faces.
───────────────────────────────────────── */
function initCubeLabels() {
  const faces  = document.querySelectorAll('.cube-face');
  const labels = ['HTML', 'CSS', 'JS', 'UI/UX', '3D', 'API'];

  faces.forEach((face, i) => {
    if (labels[i]) face.textContent = labels[i];
  });
}

/* ─────────────────────────────────────────
   16. GLITCH EFFECT on Hero Name (Hover)
   Adds a Matrix-like glitch animation on hover.
───────────────────────────────────────── */
function initGlitchEffect() {
  const heroName = document.querySelector('.hero-name');
  if (!heroName) return;

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
  const original = heroName.querySelector('.gradient-text')?.textContent || '';
  const gradientEl = heroName.querySelector('.gradient-text');
  if (!gradientEl) return;

  let interval = null;
  let iteration = 0;

  heroName.addEventListener('mouseenter', () => {
    clearInterval(interval);
    iteration = 0;

    interval = setInterval(() => {
      // Randomly scramble, then reveal character by character
      gradientEl.textContent = original
        .split('')
        .map((char, idx) => {
          if (idx < iteration) return char; // revealed
          if (char === ' ') return ' ';
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      if (iteration >= original.length) clearInterval(interval);
      iteration += 0.4; // speed of reveal
    }, 50);
  });

  heroName.addEventListener('mouseleave', () => {
    clearInterval(interval);
    gradientEl.textContent = original;
  });
}

/* ─────────────────────────────────────────
   17. HANDLE WINDOW RESIZE
   Re-initialize things that depend on screen size.
───────────────────────────────────────── */
function initResizeHandler() {
  let resizeTimer;
  window.addEventListener('resize', () => {
    // Debounce — only run 200ms after last resize event
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Re-init card tilt (adds/removes based on screen size)
      initCardTilt();
    }, 200);
  });
}

/* ─────────────────────────────────────────
   18. NAVBAR SCROLL PROGRESS BAR
   A thin line under the navbar that shows
   how far you've scrolled — like a book mark!
───────────────────────────────────────── */
function initScrollProgress() {
  // Create the bar element
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    height: 2px;
    width: 0%;
    background: linear-gradient(90deg, #00f5ff, #b400ff);
    z-index: 1001;
    transition: width 0.1s linear;
    box-shadow: 0 0 8px rgba(0,245,255,0.6);
    pointer-events: none;
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width    = `${scrollPercent}%`;
  }, { passive: true });
}

/* ─────────────────────────────────────────
   INIT — Run everything when DOM is ready
   Like pressing "Play" after everything is set up!
───────────────────────────────────────── */
function init() {
  initPageLoader();
  initCustomCursor();
  initParticleCanvas();
  initNavbar();
  initHeroParallax();
  initCardTilt();
  initScrollReveal();
  initSkillBars();
  initTypewriter();
  initBackToTop();
  initActiveNavLinks();
  initSmoothScroll();
  initContactForm();
  initStatCounters();
  initCubeLabels();
  initGlitchEffect();
  initResizeHandler();
  initScrollProgress();

  console.log('%c Portfolio Initialized', 'color: #00f5ff; font-size: 14px; font-weight: bold;');
}

// Run when HTML is fully parsed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init(); // Already loaded
}
