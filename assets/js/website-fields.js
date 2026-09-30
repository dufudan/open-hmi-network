(function (root) {
  'use strict';
  function normalize(raw) {
    let host = String(raw || '').trim();
    // Strip pasted protocols, including accidentally duplicated prefixes.
    host = host.replace(/^(?:(?:https?:)?\/\/)+/i, '');
    if (!host) return { host: '', url: '', error: 'Please enter your company website.' };
    try {
      const url = new URL('https://' + host);
      if (!url.hostname.includes('.') || url.username || url.password ||
          !/^[^\s/?#]+(?:[/?#]|$)/.test(host) ||
          /^(?:javascript|data|ftp|file):/i.test(host)) throw new Error('Invalid website');
      return { host: url.href.slice('https://'.length), url: url.href, error: '' };
    } catch (_) {
      return { host, url: '', error: 'Please enter a valid website, such as company.com.' };
    }
  }
  function sync(form, cleanVisible) {
    const input = form.querySelector('[data-website-host]');
    const value = form.querySelector('[data-website-value]');
    if (!input || !value) return;
    const result = normalize(input.value);
    input.setCustomValidity(result.error);
    value.value = result.url;
    if (cleanVisible && !result.error) input.value = result.host;
    return result;
  }
  const api = { normalize, sync };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.OpenHMIWebsiteFields = api;
  if (typeof document === 'undefined') return;
  document.querySelectorAll('[data-memory-submit]').forEach(form => {
    const input = form.querySelector('[data-website-host]');
    if (!input) return;
    input.addEventListener('input', () => sync(form, false));
    input.addEventListener('blur', () => sync(form, true));
    // Update the hidden URL before any submit handler creates FormData.
    form.addEventListener('submit', () => sync(form, true), true);
    form.addEventListener('reset', () => setTimeout(() => sync(form, false), 0));
    sync(form, false);
  });
})(typeof window !== 'undefined' ? window : globalThis);

