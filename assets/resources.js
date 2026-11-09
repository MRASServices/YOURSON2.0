'use strict';
(() => {
  const gallery = document.querySelector('#memoryGallery');
  if (!gallery) return;
  const image = gallery.querySelector('#memoryGalleryImage');
  const title = gallery.querySelector('#memoryGalleryTitle');
  const subtitle = gallery.querySelector('#memoryGallerySub');
  const count = gallery.querySelector('#memoryGalleryCount');
  const error = gallery.querySelector('#memoryGalleryError');
  let photos = [], current = 0, opener;
  function showPhoto(index) {
    current = (index + photos.length) % photos.length;
    error.hidden = true; image.hidden = false;
    image.alt = `${title.textContent}, photo ${current + 1} of ${photos.length}`;
    image.src = photos[current]; count.textContent = `${current + 1} / ${photos.length}`;
  }
  document.querySelectorAll('[data-gallery-images]').forEach(button => {
    const trigger = button.closest('.our-work-page .memory-card') ?? button;
    trigger.addEventListener('click', () => {
      photos = JSON.parse(button.dataset.galleryImages);
      if (!photos.length) return;
      opener = button;
      title.textContent = button.dataset.galleryTitle;
      subtitle.textContent = button.dataset.gallerySub;
      showPhoto(0);
      gallery.showModal();
      gallery.querySelector('.memory-gallery-close').focus();
    });
  });
  image.addEventListener('error', () => { image.hidden = true; error.hidden = false; });
  gallery.querySelector('.memory-gallery-close').addEventListener('click', () => gallery.close());
  gallery.querySelector('.memory-gallery-previous').addEventListener('click', () => showPhoto(current - 1));
  gallery.querySelector('.memory-gallery-next').addEventListener('click', () => showPhoto(current + 1));
  gallery.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); showPhoto(current + (event.key === 'ArrowRight' ? 1 : -1)); }
    if (event.key === 'Tab') {
      const buttons = [...gallery.querySelectorAll('button')];
      if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === buttons.at(-1)) { event.preventDefault(); buttons[0].focus(); }
    }
  });
  gallery.addEventListener('click', event => {
    if (event.target !== gallery) return;
    const rect = gallery.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) gallery.close();
  });
  gallery.addEventListener('close', () => opener?.focus({ preventScroll: true }));
})();
