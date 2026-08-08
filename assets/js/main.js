(function () {
  const menuBtn = document.querySelector('[data-menu]');
  const navLinks = document.querySelector('[data-nav-links]');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
  }

  const params = new URLSearchParams(window.location.search);

  function setField(form, name, value) {
    if (!value) return;
    const el = form.elements[name];
    if (!el) return;
    if (el instanceof RadioNodeList) return;
    if (el.tagName === 'SELECT') {
      const aliases = {
        'Application': {
          'Industrial equipment': 'Industrial HMI',
          'Medical / Instrumentation': 'Medical',
          'EV / Energy': 'EV Charger / Energy',
          'Smart appliance': 'Smart Home / Appliance',
          'IoT / Connected device': 'IoT / Connected Device',
          'Transportation': 'Automotive / Transportation',
          'AI / Vision': 'AI / Vision'
        }
      };
      const wanted = (aliases[name] && aliases[name][value]) || value;
      const exact = Array.from(el.options).find(o => o.value === wanted || o.text === wanted);
      if (exact) el.value = exact.value;
      return;
    }
    if (!el.value) el.value = value;
  }

  function selectorContext() {
    if (params.get('source') !== 'selector') return null;
    return {
      architecture: params.get('architecture') || '',
      application: params.get('application') || '',
      display: params.get('display') || '',
      gui: params.get('gui') || '',
      os: params.get('os') || '',
      ui: params.get('ui') || '',
      connectivity: params.get('connectivity') || '',
      stage: params.get('stage') || '',
      volume: params.get('volume') || '',
      timeline: params.get('timeline') || '',
      environment: params.get('environment') || '',
      support: params.get('support') || ''
    };
  }

  function renderSelectorContext(ctx) {
    document.querySelectorAll('[data-selector-context]').forEach(box => {
      box.hidden = false;
      box.innerHTML = `<strong>Architecture brief carried forward: ${escapeHtml(ctx.architecture || 'HMI architecture evaluation')}</strong><p>${escapeHtml([ctx.application, ctx.display, ctx.gui, ctx.os, ctx.connectivity].filter(Boolean).join(' · '))}</p>`;
    });
  }

  function addHidden(form, name, value) {
    if (!value) return;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  function escapeHtml(v) {
    return String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  const ctx = selectorContext();
  if (ctx) {
    renderSelectorContext(ctx);
    document.querySelectorAll('[data-mail-form]').forEach(form => {
      // Carry structured selector context into the email even when there is no visible matching field.
      addHidden(form, 'Selector Architecture', ctx.architecture);
      addHidden(form, 'Selector UI Requirement', ctx.ui);
      addHidden(form, 'Selector Connectivity', ctx.connectivity);
      addHidden(form, 'Selector Environment', ctx.environment);

      if (form.dataset.recipient === 'hardware@openhmi.network') {
        setField(form, 'Application', ctx.application);
        setField(form, 'Display Requirement', ctx.display);
        setField(form, 'GUI', ctx.gui);
        setField(form, 'OS', ctx.os);
        setField(form, 'Project Stage', ctx.stage);
        setField(form, 'Estimated Volume', ctx.volume);
        setField(form, 'Prototype Timeline', ctx.timeline);
      } else {
        setField(form, 'Display / Touch', ctx.display);
        setField(form, 'Compute / Platform', ctx.architecture);
        setField(form, 'GUI / Software', [ctx.gui, ctx.os].filter(Boolean).join(' / '));
        setField(form, 'Target Volume', ctx.volume);
        setField(form, 'Target Schedule', [ctx.stage, ctx.timeline].filter(Boolean).join(' · '));
        const summary = form.elements['Project Summary'];
        if (summary && !summary.value) {
          summary.value = [
            `HMI architecture brief: ${ctx.architecture}`,
            `Application: ${ctx.application}`,
            `Display: ${ctx.display}`,
            `UI: ${ctx.ui}`,
            `Connectivity: ${ctx.connectivity || 'Not specified'}`,
            `Environment: ${ctx.environment}`
          ].filter(Boolean).join('\n');
        }
      }

      const support = ctx.support.split(',').map(x => x.trim()).filter(Boolean);
      const supportAliases = {
        'Architecture recommendation': ['Platform Selection'],
        'Evaluation Board': ['Evaluation Board', 'Evaluation Hardware'],
        'TFT Display / Touch': ['TFT Display / Touch', 'Display / Touch'],
        'SDK / Software': ['SDK / Software', 'GUI / Software'],
        'GUI Development': ['GUI Development', 'GUI / Software'],
        'Embedded Linux / BSP': ['Embedded Linux / BSP', 'BSP / Firmware'],
        'Firmware Development': ['Firmware Development', 'BSP / Firmware'],
        'Hardware Design': ['Hardware Design', 'Local Engineering'],
        'Complete Product Development': ['Complete Product Development', 'Local Engineering'],
        'Production Supply': ['Production Supply']
      };
      const wantedCheckboxValues = new Set(support.flatMap(x => supportAliases[x] || [x]));
      form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        if (wantedCheckboxValues.has(cb.value)) cb.checked = true;
      });
    });
  }

  document.querySelectorAll('[data-mail-form]').forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const recipient = form.dataset.recipient || 'project@openhmi.network';
      const subject = form.dataset.subject || 'Open HMI Network Project Inquiry';
      const fd = new FormData(form);
      const grouped = new Map();
      for (const [key, value] of fd.entries()) {
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(value);
      }
      const lines = [];
      grouped.forEach((vals, key) => lines.push(`${key}: ${vals.join(', ')}`));
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
