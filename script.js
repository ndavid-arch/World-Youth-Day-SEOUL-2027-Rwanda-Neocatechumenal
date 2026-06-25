/* ===== Reveal on scroll for major sections ===== */
const revealIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      revealIO.unobserve(e.target);
    }
  }
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.section__inner, .hero__inner').forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .7s ease, transform .7s ease';
  revealIO.observe(el);
});

/* ===== Carousel ===== */
function initCarousel(root) {
  const track = root.querySelector('.carousel__track');
  const slides = Array.from(track.children);
  const prev = root.querySelector('.carousel__arrow--prev');
  const next = root.querySelector('.carousel__arrow--next');
  const dotsWrap = root.querySelector('.carousel__dots');
  const autoplayMs = parseInt(root.dataset.autoplay || '0', 10);
  let index = 0;
  let timer = null;
  let userTookOver = false;

  // Build dots
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.className = 'carousel__dot';
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Go to slide ${i + 1}`);
    b.addEventListener('click', () => go(i, true));
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.children);

  function go(i, fromUser) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => d.setAttribute('aria-selected', di === index ? 'true' : 'false'));
    slides.forEach((s, si) => {
      const v = s.querySelector('video');
      if (v && si !== index) v.pause();
    });
    if (fromUser) {
      userTookOver = true;
      stop();
    }
  }

  function start() {
    if (!autoplayMs || userTookOver) return;
    timer = setInterval(() => go(index + 1), autoplayMs);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  prev.addEventListener('click', () => go(index - 1, true));
  next.addEventListener('click', () => go(index + 1, true));

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', start);

  root.querySelectorAll('video').forEach((v) => {
    v.addEventListener('play', stop);
    v.addEventListener('pause', start);
    v.addEventListener('ended', start);
  });

  let startX = 0;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stop(); }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1), true);
    else start();
  });

  go(0);
  start();
}
document.querySelectorAll('.carousel').forEach(initCarousel);
