// Native horizontal scrolling also works without JavaScript.
(() => {
  const track = document.getElementById('works-track');
  if (!track) return;
  const photos = Array.from(track.querySelectorAll('.work-photo'));
  const previous = document.getElementById('works-prev');
  const next = document.getElementById('works-next');
  const count = document.getElementById('works-count');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function update() {
    const left = track.scrollLeft;
    const right = left + track.clientWidth;
    const visible = photos.map((photo, index) => ({ photo, index }))
      .filter(({ photo }) => photo.offsetLeft + photo.offsetWidth > left + 8 && photo.offsetLeft < right - 8);
    if (visible.length) {
      const first = visible[0].index + 1;
      const last = visible[visible.length - 1].index + 1;
      count.textContent = `${first}${last > first ? '–' + last : ''} / ${photos.length}`;
    }
    previous.disabled = left <= 2;
    next.disabled = left + track.clientWidth >= track.scrollWidth - 2;
  }

  function move(direction) {
    const stride = photos.length > 1 ? photos[1].offsetLeft - photos[0].offsetLeft : track.clientWidth;
    track.scrollBy({ left: direction * stride, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  let scheduled = false;
  track.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; update(); });
  }, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);
  else window.addEventListener('resize', update);
  update();
})();
