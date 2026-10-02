(() => {
  const header = document.querySelector('.oh-header');
  const button = header?.querySelector('.oh-menu-toggle');
  if (!button) return;
  const close = () => { header.removeAttribute('data-open'); button.setAttribute('aria-expanded', 'false'); };
  button.addEventListener('click', () => {
    const open = !header.hasAttribute('data-open');
    header.toggleAttribute('data-open', open);
    button.setAttribute('aria-expanded', String(open));
  });
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape') { close(); button.focus(); }
  });
  document.addEventListener('click', event => { if (!header.contains(event.target)) close(); });
  header.querySelectorAll('.oh-navigation a').forEach(link => link.addEventListener('click', close));
})();
