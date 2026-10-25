(() => {
  const header = document.querySelector('.oh-header');
  const button = header?.querySelector('.oh-menu-toggle');
  if (!button) return;
  const menus = Array.from(header.querySelectorAll('.oh-nav-menu'));
  menus.forEach(menu => {
    menu.querySelector('summary').addEventListener('click', () => {
      menus.forEach(other => { if (other !== menu) other.open = false; });
    });
  });
  const closeMenus = () => { menus.forEach(menu => { menu.open = false; }); };
  const close = () => { closeMenus(); header.removeAttribute('data-open'); button.setAttribute('aria-expanded', 'false'); };
  button.addEventListener('click', () => {
    const open = !header.hasAttribute('data-open');
    if (!open) closeMenus();
    header.toggleAttribute('data-open', open);
    button.setAttribute('aria-expanded', String(open));
  });
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const menu = menus.find(item => item.open);
      if (menu) { menu.open = false; menu.querySelector('summary').focus(); }
      else if (header.hasAttribute('data-open')) { close(); button.focus(); }
    }
  });
  header.addEventListener('focusout', event => { if (event.relatedTarget && !header.contains(event.relatedTarget)) close(); });
  document.addEventListener('click', event => { if (!header.contains(event.target)) close(); });
  header.querySelectorAll('.oh-navigation a').forEach(link => link.addEventListener('click', close));
  const mobile = matchMedia('(max-width:1000px)');
  mobile.addEventListener('change', close);
})();
