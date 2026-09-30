(function () {
  const form = document.querySelector('[data-web3-form]');
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
    if (!payload.Email || !payload['Project Summary'] || !payload['Project Stage']) {
      say('Please enter your email, project stage and a short project summary.', true);
      return;
    }
    const lines = Object.entries(payload).map(([key, value]) => key + ': ' + value).join('\n');
    if (lines === accepted) {
      say('This brief has already been accepted. Edit the details to send a different inquiry.', false);
      return;
    }
    brief.value = lines;
    preview.hidden = true;
    emailLink.href = 'mailto:project@openhmi.network?subject=' + encodeURIComponent('openhmi.network HMI Project Brief') + '&body=' + encodeURIComponent(lines);
    payload.email = payload.Email;
    payload.name = payload.Name || 'OpenHMI project visitor';
    payload.subject = 'OpenHMI Project Inquiry';
    payload.access_key = form.dataset.accessKey;
    payload.botcheck = false;
    pending = true;
    const controls = Array.from(form.querySelectorAll('input, textarea, select, button'));
    const disabled = controls.map(control => control.disabled);
    controls.forEach(control => { control.disabled = true; });
    const label = button.textContent;
    button.textContent = 'Submitting…';
    form.setAttribute('aria-busy', 'true');
    say('Submitting your project brief…', false);
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
      say('Thank you! Your project brief has been submitted.', false);
    } catch (_) {
      preview.hidden = false;
      say('We could not confirm submission. Your details are preserved. You can retry, or copy the brief below and email project@openhmi.network. A delayed request may still arrive; mention this if you also send an email.', true);
    } finally {
      clearTimeout(timer);
      pending = false;
      controls.forEach((control, index) => { control.disabled = disabled[index]; });
      button.textContent = label;
      form.removeAttribute('aria-busy');
    }
  });
})();
