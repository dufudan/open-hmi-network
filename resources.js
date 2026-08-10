(function () {
  const grid = document.querySelector('[data-resource-grid]');
  if (!grid) return;

  const search = document.querySelector('[data-resource-search]');
  const vendor = document.querySelector('[data-resource-vendor]');
  const category = document.querySelector('[data-resource-category]');
  const access = document.querySelector('[data-resource-access]');
  const source = document.querySelector('[data-resource-source]');
  const count = document.querySelector('[data-resource-count]');
  const more = document.querySelector('[data-resource-more]');
  const vendorGrid = document.querySelector('[data-vendor-grid]');

  const PAGE_SIZE = 18;
  let visible = PAGE_SIZE;
  let resources = [];
  let vendors = [];

  const labels = {
    source: { official: 'Official', 'open-hmi': 'Network', community: 'Community' },
    access: { 'open-source': 'Open Source', public: 'Public', registration: 'Registration', request: 'Request Access', restricted: 'Restricted / NDA' }
  };

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function uniq(values) {
    return [...new Set(values.filter(Boolean))].sort((a,b) => a.localeCompare(b));
  }

  function addOptions(el, values, allLabel) {
    if (!el) return;
    const current = el.value;
    el.innerHTML = `<option value="">${allLabel}</option>` + values.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
    if (values.includes(current)) el.value = current;
  }

  function applyQueryDefaults() {
    const p = new URLSearchParams(location.search);
    const map = [
      [vendor, p.get('vendor')],
      [category, p.get('category')],
      [access, p.get('access')],
      [source, p.get('source')]
    ];
    map.forEach(([el,val]) => {
      if (!el || !val) return;
      const opt = [...el.options].find(o => o.value.toLowerCase() === val.toLowerCase() || o.text.toLowerCase() === val.toLowerCase());
      if (opt) el.value = opt.value;
    });
  }

  function filtered() {
    const q = (search?.value || '').trim().toLowerCase();
    return resources.filter(r => {
      const hay = [r.title,r.description,r.vendor,r.category,r.type,r.architecture].join(' ').toLowerCase();
      return (!q || hay.includes(q)) &&
        (!vendor?.value || r.vendor === vendor.value) &&
        (!category?.value || r.category === category.value) &&
        (!access?.value || r.access === access.value) &&
        (!source?.value || r.source === source.value);
    });
  }

  function badge(kind, value) {
    const text = labels[kind]?.[value] || value;
    return `<span class="resource-badge resource-badge-${esc(value)}">${esc(text)}</span>`;
  }

  function card(r) {
    const external = /^https?:\/\//i.test(r.url || '');
    const action = r.access === 'request' ? 'Request Access →' : r.access === 'restricted' ? 'Discuss Access →' : external ? (r.source === 'official' ? 'Open Official Resource ↗' : 'Open Resource ↗') : 'Open Resource →';
    return `<a class="resource-card click-card" href="${esc(r.url)}" ${external ? 'target="_blank" rel="noopener"' : ''}>
      <div class="resource-card-meta"><span>${esc(r.vendor)}</span><span>${esc(r.type)}</span></div>
      <h3>${esc(r.title)}</h3>
      <p>${esc(r.description)}</p>
      <div class="resource-card-context">${r.architecture ? `<span>${esc(r.architecture)}</span>` : ''}<span>${esc(r.category)}</span></div>
      <div class="resource-badges">${badge('source', r.source)}${badge('access', r.access)}</div>
      <span class="resource-link">${action}</span>
    </a>`;
  }

  function render() {
    const list = filtered();
    if (count) count.textContent = `${list.length} resource${list.length === 1 ? '' : 's'}`;
    if (!list.length) {
      grid.innerHTML = '<div class="resource-empty"><strong>No matching resources.</strong><span>Try a broader filter or search term.</span></div>';
      if (more) more.hidden = true;
      return;
    }
    grid.innerHTML = list.slice(0, visible).map(card).join('');
    if (more) {
      more.hidden = list.length <= visible;
      more.textContent = `Show more (${list.length - visible})`;
    }
  }

  function renderVendors() {
    if (!vendorGrid) return;
    const cards = vendors.map(v => {
      const n = resources.filter(r => r.vendor === v.name).length;
      return `<a class="vendor-card click-card" href="resources.html?vendor=${encodeURIComponent(v.name)}">
        <div class="vendor-card-top"><span class="resource-badge resource-badge-public">Workspace live</span><span>${n} resources</span></div>
        <h3>${esc(v.name)}</h3>
        <p>${esc(v.summary)}</p>
        <div class="vendor-access-note">${esc(v.access_note)}</div>
        <span class="card-link">Open Workspace →</span>
      </a>`;
    });
    cards.push(`<a class="vendor-card vendor-card-future click-card" href="contribute.html#vendor"><div class="vendor-card-top"><span class="resource-badge">Multi-vendor ready</span></div><h3>Additional ecosystems</h3><p>New vendor workspaces can use public, open-source, registration, request-access or restricted/NDA delivery models.</p><span class="card-link">Add a vendor workspace →</span></a>`);
    vendorGrid.innerHTML = cards.join('');
  }

  function onChange() { visible = PAGE_SIZE; render(); }
  [search,vendor,category,access,source].filter(Boolean).forEach(el => el.addEventListener(el === search ? 'input' : 'change', onChange));
  more?.addEventListener('click', () => { visible += PAGE_SIZE; render(); });

  Promise.all([
    fetch('data/vendors/index.json').then(r => r.json()),
    fetch('data/resources/index.json').then(r => r.json())
  ]).then(async ([vendorData, resourceIndex]) => {
    vendors = vendorData.vendors || [];
    const chunks = await Promise.all((resourceIndex.files || []).map(f => fetch(f).then(r => r.json())));
    resources = chunks.flat();
    addOptions(vendor, uniq(resources.map(r => r.vendor)), 'All vendors');
    addOptions(category, uniq(resources.map(r => r.category)), 'All categories');
    applyQueryDefaults();
    renderVendors();
    render();
  }).catch(() => {
    grid.innerHTML = '<div class="resource-empty"><strong>Resources could not load.</strong><span>Please refresh the page or open the official source links later.</span></div>';
  });
})();
