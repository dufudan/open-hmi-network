(function () {
  const menuBtn = document.querySelector('[data-menu]');
  const navLinks = document.querySelector('[data-nav-links]');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
  }

  const params = new URLSearchParams(window.location.search);

  // Campaign attribution --------------------------------------------------
  // Cloudflare Web Analytics intentionally does not store query strings,
  // so Open HMI keeps lightweight UTM attribution locally and attaches it
  // to inquiry emails. No personal data is stored here.
  const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const ATTRIBUTION_KEY = 'openhmi_campaign_attribution_v1';
  const ATTRIBUTION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

  function safeStorageGet(key) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.savedAt || (Date.now() - parsed.savedAt) > ATTRIBUTION_TTL_MS) {
        window.localStorage.removeItem(key);
        return null;
      }
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {
      // Storage can be disabled by the browser; attribution remains optional.
    }
  }

  function cleanCampaignValue(value) {
    return String(value || '').trim().slice(0, 120);
  }

  function captureCampaignAttribution() {
    const incoming = {};
    UTM_KEYS.forEach(key => {
      const value = cleanCampaignValue(params.get(key));
      if (value) incoming[key] = value;
    });

    const existing = safeStorageGet(ATTRIBUTION_KEY);
    const hasIncoming = Object.keys(incoming).length > 0;

    if (hasIncoming) {
      const record = {
        ...incoming,
        landing_page: window.location.pathname,
        original_referrer: document.referrer || '',
        savedAt: Date.now()
      };
      safeStorageSet(ATTRIBUTION_KEY, record);
      return record;
    }

    return existing;
  }

  const campaignAttribution = captureCampaignAttribution();

  function attachCampaignAttribution(form) {
    if (!campaignAttribution) return;
    const fields = [
      ['UTM Source', campaignAttribution.utm_source],
      ['UTM Medium', campaignAttribution.utm_medium],
      ['UTM Campaign', campaignAttribution.utm_campaign],
      ['UTM Content', campaignAttribution.utm_content],
      ['UTM Term', campaignAttribution.utm_term],
      ['Landing Page', campaignAttribution.landing_page],
      ['Original Referrer', campaignAttribution.original_referrer]
    ];
    fields.forEach(([name, value]) => addHidden(form, name, value || ''));
  }

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


  // Hardware stack focus --------------------------------------------------
  const hardwareFocusMap = {
    'compute': 'Compute',
    'display-touch': 'Display & Touch',
    'memory-storage': 'Memory & Storage',
    'connectivity': 'Connectivity'
  };
  const hardwareFocus = hardwareFocusMap[params.get('focus') || ''];
  if (hardwareFocus) {
    document.querySelectorAll('[data-mail-form][data-recipient="hardware@openhmi.network"] input[name="Hardware Building Blocks"]').forEach(cb => {
      if (cb.value === hardwareFocus) cb.checked = true;
    });
  }

  function clearFieldError(el) {
    if (!el) return;
    el.classList.remove('is-invalid');
    el.removeAttribute('aria-invalid');
    const field = el.closest('.field');
    if (field) field.querySelectorAll('.input-error').forEach(node => node.remove());
  }

  function errorMessage(el) {
    const name = el.name || '';
    const emptyMessages = {
      'Name': 'Please enter your name.',
      'Email': 'Please enter your work email.',
      'Company': 'Please enter your company.',
      'Country / Region': 'Please enter your region.',
      'Project Description': 'Please describe what you are building.',
      'Project Summary': 'Please add a short project summary.',
      'Project Stage': 'Please select a project stage.'
    };
    if (el.type === 'email' && el.value.trim() && el.validity.typeMismatch) {
      return 'Please enter a valid work email.';
    }
    return emptyMessages[name] || 'Please complete this field.';
  }

  function showFieldError(el, message) {
    clearFieldError(el);
    el.classList.add('is-invalid');
    el.setAttribute('aria-invalid', 'true');
    const field = el.closest('.field');
    if (field) {
      const note = document.createElement('div');
      note.className = 'input-error';
      note.setAttribute('role', 'alert');
      note.textContent = message;
      field.appendChild(note);
    }
  }

  function validateMailForm(form) {
    let firstInvalid = null;
    const required = Array.from(form.querySelectorAll('[required]'));

    required.forEach(el => {
      clearFieldError(el);
      let invalid = false;

      if (el.type === 'radio' || el.type === 'checkbox') {
        const group = Array.from(form.querySelectorAll(`[name="${CSS.escape(el.name)}"]`));
        invalid = !group.some(item => item.checked);
      } else {
        invalid = !String(el.value || '').trim();
        if (!invalid && el.type === 'email') invalid = el.validity.typeMismatch;
      }

      if (invalid) {
        showFieldError(el, errorMessage(el));
        if (!firstInvalid) firstInvalid = el;
      }
    });

    const status = form.querySelector('.form-status');
    if (firstInvalid) {
      if (status) {
        status.style.display = 'block';
        status.classList.add('form-status-error');
        status.textContent = 'Please complete the highlighted fields.';
      }
      const field = firstInvalid.closest('.field');
      if (field) field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => firstInvalid.focus({ preventScroll: true }), 250);
      return false;
    }

    if (status) {
      status.classList.remove('form-status-error');
      status.textContent = '';
      status.style.display = 'none';
    }
    return true;
  }

  // Generic contribution/project context from contributor and demo links.
  const referenceTitle = params.get('reference');
  const referenceContributor = params.get('contributor');
  if (referenceTitle || referenceContributor) {
    document.querySelectorAll('[data-mail-form]').forEach(form => {
      const summary = form.elements['Project Summary'];
      if (summary && !summary.value) {
        const lines = [];
        if (referenceTitle) lines.push(`Reference: ${referenceTitle}`);
        if (referenceContributor) lines.push(`Contributor: ${referenceContributor}`);
        lines.push('Project: ');
        summary.value = lines.join('\n');
      }
      addHidden(form, 'Reference Contribution', referenceTitle || '');
      addHidden(form, 'Reference Contributor', referenceContributor || '');
    });
  }

  document.querySelectorAll('[data-mail-form]').forEach(form => {
    attachCampaignAttribution(form);

    // Native browser validation messages follow the browser UI language.
    // Use our own English inline validation instead for a consistent experience.
    form.noValidate = true;

    form.querySelectorAll('input, textarea, select').forEach(el => {
      el.addEventListener('input', () => clearFieldError(el));
      el.addEventListener('change', () => clearFieldError(el));
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateMailForm(form)) return;

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
        status.classList.remove('form-status-error');
        status.style.display = 'block';
        status.textContent = `Opening email. If nothing happens, send the brief to ${recipient}.`;
      }
      window.location.href = mailto;
    });
  });
})();

// Demo case videos: keep a clean fallback until the corresponding MP4 exists.
document.querySelectorAll('[data-demo-video]').forEach(video => {
  const wrap = video.closest('.demo-video-wrap');
  const showVideo = () => wrap && wrap.classList.add('has-video');
  video.addEventListener('loadedmetadata', showVideo, { once: true });
  video.addEventListener('canplay', showVideo, { once: true });
});
