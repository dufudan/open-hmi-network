(function () {
  const listRoot = document.querySelector('[data-contributor-list]');
  const profileRoot = document.querySelector('[data-contributor-profile]');
  const featuredRoot = document.querySelector('[data-community-contributions]');
  if (!listRoot && !profileRoot && !featuredRoot) return;

  const R = window.OpenHMIRegistry;
  if (!R) return;

  function skillTags(skills) {
    return (skills || []).slice(0, 6).map(skill => `<span class="tag">${R.esc(skill)}</span>`).join('');
  }

  function contributionCard(item, contributor) {
    const repo = item.repository_url || '';
    const resource = item.resource_url || '';
    const primaryHref = repo || resource || `contributor.html?id=${encodeURIComponent(item.contributor_id)}`;
    const external = /^https?:\/\//i.test(primaryHref);
    const action = repo ? 'View Repository ↗' : resource ? 'View Contribution →' : 'View Contributor →';
    return `<article class="community-contribution-card">
      <div class="community-card-top"><span>${R.esc(R.typeLabel(item.type))}</span><span class="resource-badge resource-badge-${R.esc(item.access || 'public')}">${R.esc(R.modelLabel(item.publication_model))}</span></div>
      <h3>${R.esc(item.title)}</h3>
      <p>${R.esc(item.summary)}</p>
      <div class="community-meta"><span>${R.esc(item.architecture)}</span>${(item.gui || []).slice(0,2).map(v => `<span>${R.esc(v)}</span>`).join('')}</div>
      <div class="community-byline">By <a href="contributor.html?id=${encodeURIComponent(item.contributor_id)}">${R.esc(contributor?.name || item.contributor_id)}</a>${contributor?.region ? ` · ${R.esc(contributor.region)}` : ''}</div>
      <div class="community-actions"><a class="card-link" href="${R.esc(primaryHref)}" ${external ? 'target="_blank" rel="noopener"' : ''}>${action}</a>${item.available_for_projects ? `<a class="card-link muted-link" href="submit-project.html?reference=${encodeURIComponent(item.title)}&contributor=${encodeURIComponent(contributor?.name || item.contributor_id)}">Build something similar →</a>` : ''}</div>
    </article>`;
  }

  function contributorCard(c, contributions) {
    const mine = contributions.filter(item => item.contributor_id === c.id);
    return `<a class="contributor-card click-card" href="contributor.html?id=${encodeURIComponent(c.id)}">
      <div class="contributor-card-head"><div class="contributor-avatar">${R.esc((c.name || '?').slice(0,1).toUpperCase())}</div><div><h3>${R.esc(c.name)}</h3><p>${R.esc(c.region || '')}</p></div></div>
      <p class="contributor-headline">${R.esc(c.headline || c.bio || '')}</p>
      <div class="tag-row contributor-skills">${skillTags(c.skills)}</div>
      <div class="contributor-stats"><span><strong>${mine.length}</strong> contribution${mine.length === 1 ? '' : 's'}</span><span>${c.available_for_projects ? 'Available for projects' : 'Contribution only'}</span></div>
      <span class="card-link">View Profile →</span>
    </a>`;
  }

  function renderProfile(c, contributions) {
    const mine = contributions.filter(item => item.contributor_id === c.id);
    const github = c.github_url ? `<a class="btn btn-secondary" href="${R.esc(c.github_url)}" target="_blank" rel="noopener">GitHub ↗</a>` : '';
    const project = c.available_for_projects ? `<a class="btn btn-primary" href="submit-project.html?contributor=${encodeURIComponent(c.name)}">Discuss Your Project →</a>` : '';
    profileRoot.innerHTML = `<section class="page-hero contributor-profile-hero"><div class="container contributor-profile-grid"><div><div class="eyebrow">Contributor Profile</div><div class="contributor-profile-title"><div class="contributor-avatar contributor-avatar-large">${R.esc((c.name || '?').slice(0,1).toUpperCase())}</div><div><h1>${R.esc(c.name)}</h1><p>${R.esc(c.region || '')}</p></div></div><p class="section-copy">${R.esc(c.bio || c.headline || '')}</p><div class="tag-row profile-skills">${skillTags(c.skills)}</div><div class="page-actions">${project}${github}</div></div><aside class="contributor-principle"><div class="mini-label">Capability proof</div><strong>${mine.length} published contribution${mine.length === 1 ? '' : 's'}</strong><p>${c.available_for_projects ? 'This contributor is available for relevant engineering opportunities.' : 'This profile currently represents contribution activity only.'}</p></aside></div></section>
      <section class="section--tight"><div class="container"><div class="eyebrow">Published work</div><h2 class="section-title">Contributions</h2><div class="community-contribution-grid">${mine.length ? mine.map(item => contributionCard(item, c)).join('') : '<div class="resource-empty"><strong>No published contributions yet.</strong></div>'}</div></div></section>`;
  }

  R.load().then(({ contributors, contributions }) => {
    const contributorMap = new Map(contributors.map(c => [c.id, c]));
    if (listRoot) {
      listRoot.innerHTML = contributors.map(c => contributorCard(c, contributions)).join('');
      const count = document.querySelector('[data-contributor-count]');
      if (count) count.textContent = `${contributors.length} contributor${contributors.length === 1 ? '' : 's'}`;
    }
    if (profileRoot) {
      const id = new URLSearchParams(location.search).get('id') || contributors[0]?.id;
      const c = contributorMap.get(id);
      if (!c) {
        profileRoot.innerHTML = '<section class="page-hero"><div class="container"><h1>Contributor not found.</h1><p class="section-copy">Return to the contributor directory to browse published profiles.</p><a class="btn btn-primary" href="contributors.html">Browse Contributors →</a></div></section>';
      } else {
        renderProfile(c, contributions);
      }
    }
    if (featuredRoot) {
      const published = contributions.filter(item => item.source === 'community' || item.source === 'open-hmi');
      featuredRoot.innerHTML = published.slice(0, 6).map(item => contributionCard(item, contributorMap.get(item.contributor_id))).join('');
    }
  }).catch(() => {
    const fallback = '<div class="resource-empty"><strong>Contributor registry could not load.</strong><span>Please refresh the page.</span></div>';
    if (listRoot) listRoot.innerHTML = fallback;
    if (profileRoot) profileRoot.innerHTML = fallback;
    if (featuredRoot) featuredRoot.innerHTML = fallback;
  });
})();
