(function () {
  const menuBtn = document.querySelector('[data-menu]');
  const navLinks = document.querySelector('[data-nav-links]');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
  }

  document.querySelectorAll('[data-mail-form]').forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const recipient = form.dataset.recipient || 'project@openhmi.network';
      const subject = form.dataset.subject || 'Open HMI Network Project Inquiry';
      const fd = new FormData(form);
      const lines = [];
      for (const [key, value] of fd.entries()) lines.push(`${key}: ${value}`);
      const body = lines.join('\n');
      const mailto = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const status = form.querySelector('.form-status');
      if (status) {
        status.style.display = 'block';
        status.textContent = `Opening your email client. If nothing happens, send the details to ${recipient}.`;
      }
      window.location.href = mailto;
    });
  });
})();
