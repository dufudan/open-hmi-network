(function () {
  async function loadJson(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Could not load ${path}`);
    return response.json();
  }

  async function load() {
    const index = await loadJson('data/registry/index.json');
    const [contributors, contributions] = await Promise.all([
      Promise.all((index.contributors || []).map(path => loadJson(`data/registry/${path}`))),
      Promise.all((index.contributions || []).map(path => loadJson(`data/registry/${path}`)))
    ]);
    return { version: index.version || '', contributors, contributions };
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function modelLabel(value) {
    return ({
      'open-source': 'Open Source',
      'open-reference': 'Open Reference',
      'partner-solution': 'Partner Solution'
    })[value] || value || 'Contribution';
  }

  function typeLabel(value) {
    return ({ demo: 'Demo', guide: 'Guide', integration: 'Integration', tool: 'Tool', workspace: 'Vendor Workspace' })[value] || value || 'Contribution';
  }

  window.OpenHMIRegistry = { load, esc, modelLabel, typeLabel };
})();
