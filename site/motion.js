// Page motion, run with GSAP after the content has rendered. If GSAP does not load, or the visitor prefers
// reduced motion, nothing here runs and the page is complete as it stands.
const GSAP_URL = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js';
const ST_URL = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.async = true; s.crossOrigin = 'anonymous';
    s.onload = resolve; s.onerror = () => reject(new Error('could not load ' + src));
    document.head.appendChild(s);
  });
}

export async function initMotion() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (document.body.classList.contains('embed')) return;
  await loadScript(GSAP_URL);
  await loadScript(ST_URL);
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });

  const h109 = document.querySelector('.h109');
  if (h109) {
    // Header 109: the video starts full-screen and shrinks into its card while the copy rises in.
    const media = h109.querySelector('.h109-media');
    const navH = () => (document.querySelector('.nav') || { offsetHeight: 64 }).offsetHeight;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: h109.querySelector('.h109-stage'), start: () => 'top ' + navH() + 'px', end: '+=90%', scrub: 0.6, pin: true, invalidateOnRefresh: true },
    });
    const phone = () => window.innerWidth <= 720;
    tl.fromTo(media,
      { width: () => h109.clientWidth, height: () => window.innerHeight - navH(), borderRadius: 0 },
      { width: () => Math.min(1120, h109.clientWidth - (phone() ? 24 : 40)), height: () => Math.max(300, window.innerHeight * (phone() ? 0.58 : 0.5)), borderRadius: () => (phone() ? 16 : 22), ease: 'none' }, 0)
      .fromTo('.h109-content > *', { opacity: 0, y: 50 }, { opacity: 1, y: 0, stagger: 0.06, ease: 'power2.out' }, 0.35);
    gsap.from('.h109-overlay > *', { opacity: 0, y: 30, duration: 0.9, stagger: 0.12, delay: 0.2 });
  } else {
  // Hero: one orchestrated entrance.
  const hero = gsap.timeline({ defaults: { duration: 0.8 } });
  hero
    .from('.hero .eyebrow', { opacity: 0, y: 14, duration: 0.5 })
    .from('.hero h1', { opacity: 0, y: 36 }, '-=0.25')
    .from('.hero .lede', { opacity: 0, y: 22 }, '-=0.5')
    .from('.hero .funding', { opacity: 0, y: 22 }, '-=0.5')
    .from('.hero .cta-row .btn', { opacity: 0, y: 16, stagger: 0.08, duration: 0.5 }, '-=0.45')
    .from('.hero .hero-note', { opacity: 0, duration: 0.6 }, '-=0.3');
  }

  // Funding bar fills from empty once it is on screen.
  const fill = document.querySelector('#bar > i');
  if (fill && parseFloat(fill.style.width) > 0) {
    gsap.from(fill, { width: 0, duration: 1.2, delay: 0.9, ease: 'power2.inOut' });
  }

  // Sections: headings and content blocks rise in as they are reached. Hidden state is set here, so the
  // page is fully visible whenever this script does not run.
  const groups = [
    '.section-head',
    '.step',
    '.two-col > *',
    '.about > *',
    '.timeline li',
    '.stat',
    '.partners > *',
    '.faq details',
    '.kit-card',
    '#spots .table-wrap',
  ];
  groups.forEach((sel) => {
    const els = gsap.utils.toArray(sel);
    if (!els.length) return;
    gsap.set(els, { opacity: 0, y: 28 });
    ScrollTrigger.batch(els, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, overwrite: true, clearProps: 'transform' }),
    });
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
}
