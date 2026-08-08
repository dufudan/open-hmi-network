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
    if (!el || el instanceof RadioNodeList) return;
    if (el.tagName === 'SELECT') {
      const aliases = {
        'Application': {
          'Industrial equipment': 'Industrial HMI',
          'Medical / Instrumentation': 'Medical / Instrumentation',
          'EV / Energy': 'EV / Energy',
          'Smart appliance': 'Smart Home / Appliance',
          'IoT / Connected device': 'IoT / Connected Device',
          'Transportation': 'Transportation',
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

  function escapeHtml(v) {
    return String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function renderSelectorContext(ctx) {
    document.querySelectorAll('[data-selector-context]').forEach(box => {
      box.hidden = false;
      box.innerHTML = `<strong>${escapeHtml(ctx.architecture || 'Architecture brief')}</strong><p>${escapeHtml([ctx.application, ctx.display, ctx.gui, ctx.os, ctx.connectivity].filter(Boolean).join(' · '))}</p>`;
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

  const ctx = selectorContext();
  if (ctx) {
    renderSelectorContext(ctx);
    document.querySelectorAll('[data-mail-form]').forEach(form => {
      addHidden(form, 'Selector Architecture', ctx.architecture);
      addHidden(form, 'Selector UI', ctx.ui);
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
        setField(form, 'Architecture', ctx.architecture);
        setField(form, 'GUI / Software', [ctx.gui, ctx.os].filter(Boolean).join(' / '));
        setField(form, 'Target Volume', [ctx.stage, ctx.volume].filter(Boolean).join(' · '));
        setField(form, 'Target Schedule', ctx.timeline);
        const summary = form.elements['Project Summary'];
        if (summary && !summary.value) {
          summary.value = [
            `Application: ${ctx.application}`,
            `UI: ${ctx.ui}`,
            `Connectivity: ${ctx.connectivity || 'Not specified'}`
          ].filter(Boolean).join('\n');
        }
      }

      const support = ctx.support.split(',').map(x => x.trim()).filter(Boolean);
      const supportAliases = {
        'Architecture Review': ['Architecture Review'],
        'Evaluation Hardware': ['Evaluation Hardware'],
        'Display / Touch': ['Display / Touch'],
        'Software / BSP': ['Software / BSP'],
        'Engineering': ['Engineering'],
        'Production Supply': ['Production Supply']
      };
      const wanted = new Set(support.flatMap(x => supportAliases[x] || [x]));
      form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        if (wanted.has(cb.value)) cb.checked = true;
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
      const mailto = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
      const status = form.querySelector('.form-status');
      if (status) {
        status.style.display = 'block';
        status.textContent = `Opening email. If nothing happens, send the brief to ${recipient}.`;
      }
      window.location.href = mailto;
    });
  });
})();
