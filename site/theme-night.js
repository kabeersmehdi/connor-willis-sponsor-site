// Mockup 2 hero: Relume Header 109 layout (full-screen video that shrinks into a framed card as you
// scroll, copy below it), rebuilt without React. The existing hero content is moved in, not copied,
// so every id the page script fills stays unique.
export function buildHeader109() {
  const hero = document.querySelector('main > .hero');
  if (!hero || document.querySelector('.h109')) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const section = document.createElement('section');
  section.className = 'h109';
  section.setAttribute('aria-labelledby', 'h109-title');
  section.innerHTML = `
    <div class="h109-stage">
      <div class="h109-media">
        <video class="h109-video" muted loop playsinline preload="auto" poster="assets/video/hero-night.jpg" aria-hidden="true">
          <source src="assets/video/hero-night.mp4" type="video/mp4">
        </video>
        <span class="h109-shade"></span>
        <div class="h109-overlay"></div>
        <button type="button" class="h109-toggle"></button>
      </div>
      <div class="wrap h109-content"></div>
    </div>`;
  const overlay = section.querySelector('.h109-overlay');
  const content = section.querySelector('.h109-content');
  const h1 = hero.querySelector('h1');
  h1.id = 'h109-title';
  overlay.append(hero.querySelector('.eyebrow'), h1);
  content.append(...hero.children);
  hero.replaceWith(section);

  const video = section.querySelector('video');
  const toggle = section.querySelector('.h109-toggle');
  const setLabel = () => {
    const playing = !video.paused;
    toggle.textContent = playing ? 'Pause video' : 'Play video';
    toggle.setAttribute('aria-pressed', String(!playing));
  };
  toggle.addEventListener('click', () => { if (video.paused) video.play(); else video.pause(); });
  video.addEventListener('play', setLabel);
  video.addEventListener('pause', setLabel);
  setLabel();
  if (!reduce) video.play().catch(setLabel);
}
