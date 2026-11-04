'use strict';

(() => {
  const root = document.documentElement;
  const stage = document.querySelector('.home-intro-stage');
  const largeLogo = document.querySelector('#homeIntroLogo');
  const navLogo = document.querySelector('.preview-home-logo img');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  if (!stage || !largeLogo || !navLogo || !root.classList.contains('home-intro-pending')) return;

  const animations = [];
  let flight;
  let finished = false;

  function finishOnKey(event) {
    if (event.key === 'Tab' || event.key === 'Escape') finish();
  }

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(window.homeIntroFallback);
    root.classList.remove('home-intro-pending');
    largeLogo.style.removeProperty('opacity');
    animations.forEach(animation => animation.cancel());
    flight?.remove();
    window.removeEventListener('resize', finish);
    window.removeEventListener('wheel', finish);
    window.removeEventListener('touchmove', finish);
    window.removeEventListener('keydown', finishOnKey);
    stage.removeEventListener('pointerdown', finish);
    motionPreference.removeEventListener('change', finish);
  }

  async function start() {
    await Promise.all([largeLogo.decode(), navLogo.decode()]);
    await new Promise(requestAnimationFrame);
    if (motionPreference.matches || !root.classList.contains('home-intro-pending')) return finish();

    const from = largeLogo.getBoundingClientRect();
    const to = navLogo.getBoundingClientRect();
    if (!from.width || !to.width) return finish();
    clearTimeout(window.homeIntroFallback);

    flight = largeLogo.cloneNode(false);
    flight.removeAttribute('id');
    flight.className = 'home-intro-flight';
    flight.setAttribute('aria-hidden', 'true');
    flight.style.width = `${from.width}px`;
    flight.style.height = `${from.height}px`;
    flight.style.transform = `translate3d(${from.left}px, ${from.top}px, 0) scale(1)`;
    document.body.append(flight);
    largeLogo.style.opacity = '0';

    const timing = { delay: 650, duration: 1700, easing: 'cubic-bezier(.45, 0, .2, 1)', fill: 'both' };
    animations.push(
      flight.animate([
        { transform: `translate3d(${from.left}px, ${from.top}px, 0) scale(1)` },
        { transform: `translate3d(${to.left}px, ${to.top}px, 0) scale(${to.width / from.width})` }
      ], timing),
      stage.animate([
        { opacity: 1, offset: 0 },
        { opacity: 1, offset: .15 },
        { opacity: 0, offset: .8 },
        { opacity: 0, offset: 1 }
      ], timing)
    );

    await Promise.all(animations.map(animation => animation.finished));
    finish();
  }

  window.addEventListener('resize', finish, { once: true });
  window.addEventListener('wheel', finish, { once: true, passive: true });
  window.addEventListener('touchmove', finish, { once: true, passive: true });
  window.addEventListener('keydown', finishOnKey);
  stage.addEventListener('pointerdown', finish, { once: true });
  motionPreference.addEventListener('change', finish, { once: true });
  start().catch(finish);
})();
