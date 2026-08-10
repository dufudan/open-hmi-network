(function () {
  const form = document.querySelector('[data-github-contribution-form]');
  if (!form) return;

  const preview = document.querySelector('[data-registry-preview]');
  const previewShell = document.querySelector('[data-registry-preview-shell]');
  const submitButton = document.querySelector('[data-submit-github]');
  const copyButton = document.querySelector('[data-copy-registry]');
  const emailLink = document.querySelector('[data-email-contribution]');
  const status = document.querySelector('[data-contribution-status]');
  const repoNewIssue = 'https://github.com/dufudan/open-hmi-network/issues/new';

  form.noValidate = true;

  function slug(value) {
    return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64) || 'community-contribution';
  }

  function split(value) {
    return String(value || '').split(',').map(v => v.trim()).filter(Boolean);
  }

  function get(name) {
    return form.elements[name]?.value?.trim() || '';
  }

  function checked(name) {
    return Boolean(form.elements[name]?.checked);
  }

  function githubOwner(url) {
    try {
      const u = new URL(url);
      if (u.hostname !== 'github.com' && u.hostname !== 'www.github.com') return '';
      return u.pathname.split('/').filter(Boolean)[0] || '';
    } catch (_) { return ''; }
  }

  function clearError(el) {
    el.classList.remove('is-invalid');
    el.removeAttribute('aria-invalid');
    el.closest('.field')?.querySelectorAll('.input-error').forEach(n => n.remove());
  }

  function markError(el, message) {
    clearError(el);
    el.classList.add('is-invalid');
    el.setAttribute('aria-invalid', 'true');
    const note = document.createElement('div');
    note.className = 'input-error';
    note.textContent = message;
    el.closest('.field')?.appendChild(note);
  }

  function validate() {
    let first = null;
    const required = [...form.querySelectorAll('[required]')];
    required.forEach(el => {
      clearError(el);
      if (!String(el.value || '').trim()) {
        markError(el, 'Please complete this field.');
        first ||= el;
      }
    });
    const repo = form.elements['Repository URL'];
    if (repo?.value && !githubOwner(repo.value)) {
      markError(repo, 'Please enter a GitHub repository URL.');
      first ||= repo;
    }
    if (first) {
      first.closest('.field')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => first.focus({ preventScroll: true }), 250);
      if (status) status.textContent = 'Please complete the highlighted fields.';
      return false;
    }
    return true;
  }

  function build() {
    const repository = get('Repository URL');
    const contributorId = slug(githubOwner(repository) || get('Contributor Name'));
    const model = get('Publication Model') || 'open-reference';
    return {
      contributor: {
        id: contributorId,
        name: get('Contributor Name'),
        region: get('Country / Region'),
        github_url: get('GitHub Profile') || (githubOwner(repository) ? `https://github.com/${githubOwner(repository)}` : ''),
        available_for_projects: checked('Available for Projects')
      },
      contribution: {
        id: slug(get('Contribution Title')),
        title: get('Contribution Title'),
        type: get('Contribution Type'),
        contributor_id: contributorId,
        summary: get('Contribution Summary'),
        architecture: get('Architecture'),
        application: split(get('Application')),
        gui: split(get('GUI')),
        os: split(get('OS')),
        hardware: split(get('Hardware')),
        publication_model: model,
        access: model === 'partner-solution' ? 'request' : 'public',
        source: 'community',
        repository_url: repository,
        resource_url: '',
        license: get('License') || 'Not specified',
        maintained: true,
        available_for_projects: checked('Available for Projects'),
        tags: split(get('Tags'))
      }
    };
  }

  function jsonText() {
    return JSON.stringify(build(), null, 2);
  }

  function issueBody(data) {
    return [
      '## OpenHMI Network contribution submission',
      '',
      `**Contributor:** ${data.contributor.name}`,
      `**Region:** ${data.contributor.region || 'Not specified'}`,
      `**Repository:** ${data.contribution.repository_url}`,
      `**Publication model:** ${data.contribution.publication_model}`,
      `**Available for projects:** ${data.contributor.available_for_projects ? 'Yes' : 'No'}`,
      '',
      '### Registry proposal',
      '```json',
      JSON.stringify(data, null, 2),
      '```',
      '',
      '### Review notes',
      '- [ ] I own or am authorized to share the linked material.',
      '- [ ] The repository license / access model is accurately described.',
      '- [ ] I understand that OpenHMI Network indexes the contribution and does not take ownership of my repository or IP.'
    ].join('\n');
  }

  function refreshPreview() {
    if (!validate()) return null;
    const data = build();
    if (preview) preview.textContent = JSON.stringify(data, null, 2);
    if (previewShell) previewShell.hidden = false;
    const body = issueBody(data);
    const issueUrl = `${repoNewIssue}?title=${encodeURIComponent(`[Contribution] ${data.contribution.title}`)}&body=${encodeURIComponent(body)}`;
    if (submitButton) submitButton.href = issueUrl;
    if (emailLink) {
      const subject = `OpenHMI Network Contribution: ${data.contribution.title}`;
      emailLink.href = `mailto:project@openhmi.network?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    if (status) status.textContent = 'Registry entry prepared. Review it below, then submit through GitHub or email.';
    return data;
  }

  form.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('input', () => clearError(el));
    el.addEventListener('change', () => clearError(el));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    refreshPreview();
  });

  submitButton?.addEventListener('click', e => {
    if (!submitButton.getAttribute('href') || submitButton.getAttribute('href') === '#') {
      e.preventDefault();
      const data = refreshPreview();
      if (data && submitButton.href && submitButton.href !== '#') window.open(submitButton.href, '_blank', 'noopener');
    }
  });

  copyButton?.addEventListener('click', async () => {
    if (!preview?.textContent) {
      if (!refreshPreview()) return;
    }
    try {
      await navigator.clipboard.writeText(preview.textContent);
      if (status) status.textContent = 'Registry JSON copied.';
    } catch (_) {
      if (status) status.textContent = 'Copy is not available in this browser. Select the JSON manually.';
    }
  });
})();
