(function () {
  const form = document.querySelector('[data-memory-submit]');
  if (!form) return;
  const button = form.querySelector('[type="submit"]');
  const status = form.querySelector('.form-status');
  const preview = form.querySelector('[data-email-preview]');
  const brief = form.querySelector('[data-prepared-brief]');
  const emailLink = form.querySelector('[data-email-fallback]');
  let pending = false;
  let accepted = '';
  function say(message, error) {
    status.style.display = 'block';
    status.classList.toggle('form-status-error', Boolean(error));
    status.textContent = message;
  }
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (pending) return;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (data.get('botcheck')) return;
    const payload = {};
    for (const [key, value] of data.entries()) {
      if (key === 'botcheck') continue;
      const clean = String(value).trim();
      if (!clean) continue;
      payload[key] = payload[key] ? payload[key] + ', ' + clean : clean;
    }
    if (!payload.Email || !payload['Memory Design-in Summary']) {
      say('Please enter your email and complete the checklist.', true);
      return;
    }
    const lines = Object.entries(payload).map(([key, value]) => key + ': ' + value).join('\n');
    if (lines === accepted) {
      say('This request has already been submitted.', false);
      return;
    }
    brief.value = lines;
    preview.hidden = true;
    emailLink.href = 'mailto:project@openhmi.network?subject=' + encodeURIComponent('OpenHMI Memory Part Match / Quote Request') + '&body=' + encodeURIComponent(lines);
    payload.email = payload.Email;
    payload.name = payload.Name || 'OpenHMI sourcing visitor';
    payload.subject = 'OpenHMI Memory Part Match / Quote Request';
    payload.access_key = form.dataset.accessKey;
    payload.botcheck = false;
    pending = true;
    const controls = Array.from(form.querySelectorAll('input, textarea, select, button'));
    const disabled = controls.map(control => control.disabled);
    controls.forEach(control => { control.disabled = true; });
    const label = button.textContent;
    button.textContent = 'Submitting…';
    form.setAttribute('aria-busy', 'true');
    say('Submitting your request…', false);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error('Submission not accepted');
      accepted = lines;
      say('Thank you! Your request has been submitted.', false);
    } catch (_) {
      preview.hidden = false;
      say('Submission could not be confirmed. Your details are kept. Retry or email the request below. A delayed submission may still arrive.', true);
    } finally {
      clearTimeout(timer);
      pending = false;
      controls.forEach((control, index) => { control.disabled = disabled[index]; });
      button.textContent = label;
      form.removeAttribute('aria-busy');
    }
  });
})();
