(() => {
  const form = document.getElementById('boundary-form');
  const result = document.getElementById('assessment-result');
  if (!form || !result) return;

  const dimensions = ['display', 'memory', 'rendering', 'connectivity', 'bootLifecycle'];
  const labels = {
    display: 'Display', memory: 'Memory', rendering: 'Rendering',
    connectivity: 'Connectivity', bootLifecycle: 'Boot & Lifecycle'
  };
  const architectures = {
    serial: {
      name: 'Serial HMI', next: 'MCU HMI',
      capacity: { display: 30, memory: 25, rendering: 25, connectivity: 30, bootLifecycle: 60 }
    },
    mcu: {
      name: 'MCU HMI', next: 'HMI SoC / High-end MCU + RTOS',
      capacity: { display: 65, memory: 75, rendering: 72, connectivity: 65, bootLifecycle: 92 }
    },
    soc: {
      name: 'HMI SoC / High-end MCU + RTOS', next: 'Linux / Android MPU',
      capacity: { display: 86, memory: 88, rendering: 88, connectivity: 80, bootLifecycle: 82 }
    },
    linux: {
      name: 'Linux / Android MPU', next: null,
      capacity: { display: 100, memory: 100, rendering: 100, connectivity: 100, bootLifecycle: 72 }
    }
  };

  const rules = {
    resolution: {
      small: { display: 10, memory: 8, rendering: 4 },
      wvga: { display: 25, memory: 20, rendering: 15 },
      wsvga: { display: 45, memory: 38, rendering: 30 },
      hd: { display: 70, memory: 60, rendering: 50 }
    },
    displayCount: {
      one: {}, two: { display: 15, memory: 18, rendering: 10 },
      three: { display: 25, memory: 30, rendering: 20 }
    },
    colorDepth: {
      low: {}, mid: { memory: 8, rendering: 5 }, high: { memory: 18, rendering: 12 }
    },
    uiComplexity: {
      basic: { rendering: 5, memory: 2 },
      standard: { rendering: 20, memory: 10 },
      rich: { rendering: 45, memory: 25 },
      media: { rendering: 70, memory: 35, connectivity: 10 }
    },
    pageCount: {
      small: { memory: 4, rendering: 2 }, medium: { memory: 10, rendering: 8 },
      large: { memory: 20, rendering: 15 }, veryLarge: { memory: 30, rendering: 25 }
    },
    assetLoad: {
      light: { memory: 2 }, medium: { memory: 10, rendering: 2 }, heavy: { memory: 22, rendering: 8 }
    },
    fps: {
      low: {}, medium: { rendering: 10 }, high: { rendering: 25 }, veryHigh: { rendering: 40 }
    },
    realtime: {
      low: {}, medium: { rendering: 8, connectivity: 5 },
      high: { rendering: 22, connectivity: 10 }, veryHigh: { rendering: 40, connectivity: 15 }
    },
    buffers: {
      partial: {}, single: { memory: 10 }, double: { memory: 25, rendering: 5 },
      composed: { memory: 40, rendering: 15 }
    },
    protocols: {
      basic: { connectivity: 8 }, field: { connectivity: 25 },
      multi: { connectivity: 45 }, gateway: { connectivity: 65 }
    },
    network: {
      none: {}, basic: { connectivity: 18, bootLifecycle: 3 },
      connected: { connectivity: 40, bootLifecycle: 10 },
      platform: { connectivity: 65, bootLifecycle: 20 }
    },
    multimedia: {
      none: {}, one: { rendering: 20, memory: 15, connectivity: 10 },
      multi: { rendering: 40, memory: 25, connectivity: 20 }
    },
    boot: {
      instant: { bootLifecycle: 65 }, fast: { bootLifecycle: 45 },
      normal: { bootLifecycle: 20 }, relaxed: { bootLifecycle: 8 }
    },
    lifecycle: {
      short: { bootLifecycle: 10 }, medium: { bootLifecycle: 20 },
      long: { bootLifecycle: 35 }, veryLong: { bootLifecycle: 55 }
    },
    maintenance: {
      fixed: { bootLifecycle: 5 }, maintained: { bootLifecycle: 15 },
      secure: { bootLifecycle: 35, connectivity: 10 }, legacy: { bootLifecycle: 55 }
    }
  };

  const reasonRules = [
    ['resolution', 'wsvga', '1024×600 increases framebuffer size and sustained display bandwidth.'],
    ['resolution', 'hd', '1280×800+ turns display movement and composition into a high-bandwidth workload.'],
    ['displayCount', 'two', 'Multiple display outputs reduce memory and rendering headroom.'],
    ['displayCount', 'three', 'Independent multi-display content is outside the comfortable range of many embedded tiers.'],
    ['uiComplexity', 'rich', 'Rich animation and layered widgets raise worst-screen rendering load.'],
    ['uiComplexity', 'media', 'Camera or multimedia UI requires a graphics and media pipeline, not only a GUI library.'],
    ['realtime', 'high', 'High-rate waveforms require validation with the real data path and worst screen.'],
    ['realtime', 'veryHigh', 'Multiple high-rate streams create both rendering and data-integration pressure.'],
    ['buffers', 'double', 'Double buffering consumes substantial contiguous memory and bandwidth.'],
    ['buffers', 'composed', 'Multiple composed surfaces add memory, bandwidth and rendering complexity.'],
    ['protocols', 'gateway', 'A gateway role makes connectivity and system concurrency an architecture concern.'],
    ['network', 'platform', 'App, browser or container services generally require an OS-level platform.'],
    ['multimedia', 'multi', 'Multiple cameras or codecs require dedicated media and memory-path validation.'],
    ['boot', 'instant', 'A sub-second boot target strongly favors deterministic and tightly controlled software stacks.'],
    ['lifecycle', 'veryLong', 'A 10+ year lifetime makes source ownership, BSP maintenance and supply continuity critical.'],
    ['maintenance', 'secure', 'OTA, security maintenance and rollback add long-term platform ownership.'],
    ['maintenance', 'legacy', 'Missing maintainable source or BSP is already a migration and lifecycle boundary.']
  ];

  function emptyLoad() {
    return { display: 0, memory: 0, rendering: 0, connectivity: 0, bootLifecycle: 0 };
  }

  function calculate() {
    const data = Object.fromEntries(new FormData(form).entries());
    const architecture = architectures[data.architecture];
    const load = emptyLoad();
    Object.entries(data).forEach(([field, value]) => {
      const impact = rules[field]?.[value];
      if (!impact) return;
      Object.entries(impact).forEach(([dimension, amount]) => { load[dimension] += amount; });
    });
    const ratios = Object.fromEntries(dimensions.map(dimension => [dimension, load[dimension] / architecture.capacity[dimension]]));
    const exceeded = dimensions.filter(dimension => ratios[dimension] > 1);
    const severe = dimensions.filter(dimension => ratios[dimension] > 1.25);
    const watch = dimensions.filter(dimension => ratios[dimension] >= .72 && ratios[dimension] <= 1);
    let status = 'comfortable';
    if (exceeded.length >= 2 || severe.length >= 1) status = 'crossed';
    else if (exceeded.length || watch.length) status = 'watch';
    return { data, architecture, load, ratios, status };
  }

  function riskState(ratio) {
    if (ratio > 1) return { label: 'Over', className: 'risk-over' };
    if (ratio >= .72) return { label: 'Watch', className: 'risk-watch' };
    return { label: 'Low', className: 'risk-low' };
  }

  function renderRiskGrid(assessment) {
    const grid = document.getElementById('risk-grid');
    grid.innerHTML = '';
    dimensions.forEach(dimension => {
      const ratio = assessment.ratios[dimension];
      const state = riskState(ratio);
      const card = document.createElement('article');
      card.className = `result-risk-card ${state.className}`;
      const percent = Math.min(100, Math.round(ratio * 100));
      card.innerHTML = `<div><span>${labels[dimension]}</span><strong>${state.label}</strong></div><i><b style="width:${percent}%"></b></i><p>${Math.round(assessment.load[dimension])} requirement points / ${assessment.architecture.capacity[dimension]} practical capacity</p>`;
      grid.appendChild(card);
    });
  }

  function renderReasons(assessment) {
    const list = document.getElementById('boundary-points');
    const reasons = reasonRules
      .filter(([field, value]) => assessment.data[field] === value)
      .map(([, , copy]) => copy);
    const ranked = dimensions.slice().sort((a, b) => assessment.ratios[b] - assessment.ratios[a]);
    ranked.slice(0, 2).forEach(dimension => {
      const state = riskState(assessment.ratios[dimension]);
      if (state.label !== 'Low') reasons.unshift(`${labels[dimension]} is ${state.label.toLowerCase()} relative to the selected architecture profile.`);
    });
    const unique = [...new Set(reasons)].slice(0, 5);
    if (!unique.length) unique.push('No major boundary trigger is present in the selected inputs. Keep normal engineering margin and validate the final product configuration.');
    list.innerHTML = unique.map(reason => `<li>${reason}</li>`).join('');
  }

  function renderRecommendation(assessment) {
    const title = document.getElementById('recommendation-title');
    const copy = document.getElementById('recommendation-copy');
    const next = document.getElementById('recommendation-next');
    if (assessment.status === 'comfortable') {
      title.textContent = 'Stay with current architecture';
      copy.textContent = `${assessment.architecture.name} remains within its preliminary comfort zone for these inputs. Preserve headroom and validate the final display timing, memory use and worst-case screen.`;
      next.textContent = 'No architecture upgrade is indicated by this assessment.';
    } else if (assessment.status === 'watch') {
      title.textContent = 'Stay for now—validate the pressure point';
      copy.textContent = `${assessment.architecture.name} is close to a practical boundary in at least one dimension. Measure the highest-risk area before adding cost and platform complexity.`;
      next.textContent = assessment.architecture.next ? `Keep ${assessment.architecture.next} as a comparison path, not an automatic decision.` : 'Focus on BSP, boot and lifecycle optimization within the current Linux / Android platform.';
    } else if (assessment.architecture.next) {
      title.textContent = `Compare ${assessment.architecture.next}`;
      copy.textContent = `Several requirements are outside the preliminary profile for ${assessment.architecture.name}. Compare the next tier while also checking whether targeted optimization can remove the actual bottleneck.`;
      next.textContent = `Next comparison tier: ${assessment.architecture.next}.`;
    } else {
      title.textContent = 'Stay on Linux / Android—review the platform architecture';
      copy.textContent = 'The boundary is now inside the OS, BSP, boot or lifecycle strategy rather than a higher HMI tier. Review partitioning, ownership, update policy and hardware continuity.';
      next.textContent = 'There is no automatic “higher tier” recommendation.';
    }
  }

  function render(assessment) {
    const statusText = { comfortable: 'Comfortable', watch: 'Near boundary', crossed: 'Boundary crossed' };
    const summaryText = {
      comfortable: 'The current tier has preliminary headroom across all five risk dimensions.',
      watch: 'One or more dimensions are close enough to require focused validation.',
      crossed: 'The input profile exceeds the practical range of the current tier in a material way.'
    };
    document.getElementById('result-architecture').textContent = assessment.architecture.name;
    document.getElementById('result-status').textContent = statusText[assessment.status];
    document.getElementById('result-summary').textContent = summaryText[assessment.status];
    const badge = document.getElementById('result-badge');
    badge.textContent = assessment.status === 'comfortable' ? 'Stay' : assessment.status === 'watch' ? 'Validate' : 'Compare';
    badge.className = `result-badge status-${assessment.status}`;
    renderRiskGrid(assessment);
    renderReasons(assessment);
    renderRecommendation(assessment);
    const review = document.getElementById('review-cta');
    const params = new URLSearchParams({
      utm_source: 'assessment_result', utm_medium: 'validate', utm_campaign: 'architecture_review',
      architecture: assessment.architecture.name, boundary_status: statusText[assessment.status]
    });
    review.href = `submit-project.html?${params.toString()}`;
    result.hidden = false;
    result.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    render(calculate());
  });

  form.addEventListener('reset', () => {
    window.setTimeout(() => { result.hidden = true; }, 0);
  });

  const scenario = new URLSearchParams(window.location.search).get('scenario');
  if (scenario === 'migration') {
    form.elements.lifecycle.value = 'long';
    form.elements.maintenance.value = 'legacy';
  }
})();
