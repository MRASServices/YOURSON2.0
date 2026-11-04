'use strict';

const categories = {
  about: {
    title: 'About Us',
    description: 'Get to know Your Son and explore our memories.',
    links: [
      ['About Your Son', 'The story behind the name.', 'about.html'],
      ['Our Memories', 'A look at the work and moments along the way.', 'memories.html']
    ]
  },
  resources: {
    title: 'Resources',
    description: 'Our friends, useful contacts & finds.',
    links: [
      ['Family Phonebook', 'Useful contacts, all in one place.', 'phonebook.html'],
      ['Our Friends', 'Meet the people in our network.', 'our-friends.html'],
      ['Your Goods', 'Explore the goods on our website.', 'goods.html']
    ]
  },
  contact: {
    title: 'Contact',
    description: 'Tell us what you need a hand with.',
    links: [
      ['Contact Info', 'Open the contact page and enquiry form.', 'https://www.yourson.ca/contact'],
      ['905-505-4345', 'Give Your Son a call.', 'tel:+19055054345'],
      ['connectwith@yourson.ca', 'Send Your Son an email.', 'mailto:connectwith@yourson.ca']
    ]
  }
};

const dialog = document.querySelector('#categoryDialog');
const menuButton = document.querySelector('#menuBtn');
const menuPanel = document.querySelector('#siteMenu');
const header = document.querySelector('#siteHeader');
const menuMotionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let drawerAnimation;
let drawerClosing;

async function setMenu(open) {
  if (drawerClosing) await drawerClosing;
  if (open === menuPanel.open) return;
  header.dataset.open = String(open);
  menuButton.setAttribute('aria-expanded', String(open));
  if (open) {
    menuPanel.showModal();
    if (!menuMotionPreference.matches) {
      const animation = menuPanel.animate([
        { transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }
      ], { duration: 340, easing: 'cubic-bezier(.22, 1, .36, 1)' });
      drawerAnimation = animation;
      animation.finished.then(() => { if (drawerAnimation === animation) drawerAnimation = null; }).catch(() => {});
    }
    return;
  }
  const from = getComputedStyle(menuPanel).transform;
  drawerAnimation?.cancel();
  if (menuMotionPreference.matches) { menuPanel.close(); return; }
  const animation = menuPanel.animate([
    { transform: from }, { transform: 'translateX(-100%)' }
  ], { duration: 240, easing: 'ease-in', fill: 'forwards' });
  drawerAnimation = animation;
  drawerClosing = animation.finished.catch(() => {}).then(() => {
    menuPanel.close();
    animation.cancel();
    drawerAnimation = null;
    drawerClosing = null;
  });
  return drawerClosing;
}

async function openCategory(key) {
  if (key === 'contact') { location.href = 'contact.html'; return; }
  const category = categories[key];
  if (!category) return;
  await setMenu(false);
  document.querySelector('#categoryTitle').textContent = category.title;
  document.querySelector('#categoryDescription').textContent = category.description;
  const links = document.querySelector('#categoryLinks');
  links.replaceChildren();
  for (const [title, description, destination] of category.links) {
    const link = document.createElement('a');
    const isExternal = /^https?:\/\//.test(destination);
    link.href = destination;
    if (isExternal) { link.target = '_blank'; link.rel = 'noopener'; }
    const name = document.createElement('strong');
    name.textContent = title;
    const detail = document.createElement('small');
    detail.textContent = description;
    const arrow = document.createElement('span');
    arrow.className = 'destination-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = isExternal ? '↗' : '→';
    link.append(name, detail, arrow);
    links.append(link);
  }
  const note = dialog.querySelector('.preview-destination-note');
  note.hidden = !category.links.some(([, , destination]) => /^https?:\/\//.test(destination));
  note.textContent = 'Contact Info opens your current website in a new tab.';
  dialog.showModal();
  dialog.scrollTop = 0;
}

document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-category]');
  if (trigger) openCategory(trigger.dataset.category);
});
menuButton.addEventListener('click', () => setMenu(true));
document.querySelector('.preview-menu-close').addEventListener('click', () => setMenu(false));
function revealServiceCategory(hash = location.hash) {
  const category = document.getElementById(hash.slice(1));
  if (category?.matches('.services-category')) category.open = true;
}
window.addEventListener('hashchange', () => revealServiceCategory());
revealServiceCategory();
menuPanel.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link) return;
  const destination = new URL(link.href);
  if (destination.origin === location.origin && destination.pathname === location.pathname && destination.hash) revealServiceCategory(destination.hash);
  setMenu(false);
});
menuPanel.addEventListener('click', event => {
  if (event.target !== menuPanel) return;
  const bounds = menuPanel.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setMenu(false);
});
menuPanel.addEventListener('cancel', event => { event.preventDefault(); setMenu(false); });
menuPanel.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const controls = [...menuPanel.querySelectorAll('a[href], button:not([disabled]), summary')].filter(control => control.getClientRects().length);
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
document.querySelector('.preview-dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
document.querySelectorAll('[data-year]').forEach(item => { item.textContent = new Date().getFullYear(); });
