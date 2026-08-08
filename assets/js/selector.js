(function () {
  const form = document.getElementById('architectureSelector');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('.selector-step'));
  const progressItems = Array.from(document.querySelectorAll('[data-progress-step]'));
  const backBtn = document.getElementById('selectorBack');
  const nextBtn = document.getElementById('selectorNext');
  const finishBtn = document.getElementById('selectorFinish');
  const validation = document.getElementById('selectorValidation');
  const progressText = document.getElementById('progressText');
  const progressBar = document.getElementById('progressBar');
  let currentStep = 1;

  const ARCHITECTURES = {
    serial: {
      name: 'Smart Display / Serial HMI',
      description: 'For simple controls where fast integration matters most.',
      stack: ['Smart display', 'Serial host', 'Fast integration'],
      validate: ['UI limits', 'Host protocol', 'Lifecycle']
    },
    compact: {
      name: 'Compact RTOS HMI',
      description: 'For responsive control HMIs with fast boot and LVGL-class UI.',
      stack: ['RTOS', 'LVGL-class GUI', 'Control I/O'],
      validate: ['Memory', 'Display timing', 'Boot / real-time']
    },
    performance: {
      name: 'Performance RTOS HMI',
      description: 'For richer graphics and more I/O while keeping an RTOS product model.',
      stack: ['High-performance HMI MCU/SoC', 'LVGL-class GUI', 'RTOS'],
      validate: ['Render load', 'Memory bandwidth', 'Display timing']
    },
    linux: {
      name: 'Embedded Linux HMI',
      description: 'For rich workflows, larger displays and complex networking.',
      stack: ['Embedded Linux', 'Qt/QML or Linux GUI', 'Application-class SoC'],
      validate: ['Boot time', 'BSP ownership', 'Updates / security']
    },
    edge: {
      name: 'Edge / Vision HMI',
      description: 'For camera, video, AI or other high-bandwidth HMI workloads.',
      stack: ['Linux / Android', 'Camera / media pipeline', 'GPU / NPU SoC'],
      validate: ['Camera pipeline', 'AI workload', 'Power / thermal']
    }
  };

  function showStep(step) {
    currentStep = step;
    steps.forEach(s => s.classList.toggle('active', Number(s.dataset.step) === step));
    progressItems.forEach(item => {
      const n = Number(item.dataset.progressStep);
      item.classList.toggle('active', n === step);
      item.classList.toggle('done', n < step);
    });
    backBtn.disabled = step === 1;
    nextBtn.hidden = step === steps.length;
    finishBtn.hidden = step !== steps.length;
    progressText.textContent = `Step ${step} of ${steps.length}`;
    progressBar.style.width = `${(step / steps.length) * 100}%`;
    validation.textContent = '';
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function stepValid(step) {
    const panel = steps[step - 1];
    const required = Array.from(panel.querySelectorAll('[required]'));
    for (const el of required) {
      if (el.type === 'radio') {
        const group = panel.querySelectorAll(`input[name="${CSS.escape(el.name)}"]`);
        if (![...group].some(r => r.checked)) return false;
      } else if (!el.value) {
        return false;
      }
    }
    return true;
  }

  nextBtn.addEventListener('click', () => {
    if (!stepValid(currentStep)) {
      validation.textContent = 'Please complete the required fields before continuing.';
      return;
    }
    showStep(Math.min(currentStep + 1, steps.length));
  });
  backBtn.addEventListener('click', () => showStep(Math.max(1, currentStep - 1)));

  function values(name) {
    return Array.from(form.querySelectorAll(`[name="${name}"]:checked`)).map(x => x.value);
  }
  function value(name) {
    const el = form.elements[name];
    if (!el) return '';
    if (el instanceof RadioNodeList) return el.value || '';
    return el.value || '';
  }

  function deriveDisplayBrief(size, resolution, touch) {
    const sizeMap = { small: '≤ 4.3 inch', medium: '5–7 inch', large: '8–10.1 inch', xlarge: '> 10.1 inch', unknown: 'Size not decided' };
    const resMap = { low: '≤ 480×272', wvga: '800×480', wsvga: '1024×600', wxga: '1280×800', fhd: '1920×1080+', unknown: 'Resolution not decided' };
    return `${sizeMap[size] || size} · ${resMap[resolution] || resolution} · ${touch}`;
  }

  function scoreArchitectures(d) {
    const s = { serial: 0, compact: 0, performance: 0, linux: 0, edge: 0 };
    const conn = new Set(d.connectivity);

    if (d.uiComplexity === 'basic') { s.serial += 25; s.compact += 24; s.performance += 8; }
    if (d.uiComplexity === 'rich') { s.compact += 22; s.performance += 26; s.linux += 12; }
    if (d.uiComplexity === 'advanced') { s.performance += 24; s.linux += 28; s.edge += 10; }
    if (d.uiComplexity === 'multimedia') { s.edge += 42; s.linux += 18; }

    if (d.gui === 'LVGL') { s.compact += 24; s.performance += 22; }
    if (d.gui === 'Qt / QML') { s.linux += 32; s.edge += 12; }
    if (d.os === 'RTOS') { s.compact += 28; s.performance += 24; }
    if (d.os === 'Embedded Linux') { s.linux += 35; s.edge += 18; }
    if (d.os === 'Android') { s.edge += 28; s.linux += 12; }
    if (d.os === 'Bare Metal') { s.serial += 10; s.compact += 14; }

    if (d.screenSize === 'small') { s.serial += 16; s.compact += 16; }
    if (d.screenSize === 'medium') { s.compact += 18; s.performance += 12; }
    if (d.screenSize === 'large') { s.performance += 18; s.linux += 16; }
    if (d.screenSize === 'xlarge') { s.linux += 22; s.edge += 14; }

    if (d.resolution === 'low') { s.serial += 14; s.compact += 12; }
    if (d.resolution === 'wvga') { s.compact += 14; s.serial += 5; }
    if (d.resolution === 'wsvga') { s.compact += 12; s.performance += 16; }
    if (d.resolution === 'wxga') { s.performance += 20; s.linux += 18; }
    if (d.resolution === 'fhd') { s.linux += 24; s.edge += 24; }

    if (d.bootPriority.startsWith('Fast boot')) { s.compact += 14; s.performance += 10; s.serial += 8; }
    if (d.bootPriority.startsWith('Feature richness')) { s.linux += 14; s.edge += 10; }

    if (conn.has('Camera')) s.edge += 28;
    if (conn.has('Edge AI')) s.edge += 38;
    if (conn.has('Audio / Video')) { s.edge += 20; s.linux += 8; }
    if (conn.has('Cellular')) { s.linux += 8; s.edge += 8; }
    if (conn.has('Ethernet')) { s.compact += 5; s.performance += 8; s.linux += 8; }
    if (conn.has('Wi-Fi / BLE')) { s.compact += 5; s.performance += 7; s.linux += 8; }
    if (conn.has('CAN') || conn.has('UART / RS485')) { s.compact += 8; s.performance += 6; }

    if (d.application === 'AI / Vision') s.edge += 32;
    if (d.application === 'Smart appliance') { s.serial += 7; s.compact += 10; }
    if (d.application === 'Industrial equipment' || d.application === 'EV / Energy' || d.application === 'Medical / Instrumentation') { s.compact += 8; s.performance += 8; s.linux += 5; }

    if (d.lifecycle.startsWith('Lowest BOM')) { s.serial += 10; s.compact += 10; }
    if (d.lifecycle.startsWith('Performance headroom')) { s.performance += 12; s.linux += 12; s.edge += 10; }
    if (d.lifecycle.startsWith('Long lifecycle')) { s.compact += 5; s.performance += 5; s.linux += 3; }

    return s;
  }

  function makeReasons(d, architecture) {
    const r = [];
    const uiReason = {
      basic: 'Control-oriented UI keeps system overhead important.',
      rich: 'Richer graphics need more rendering and memory headroom.',
      advanced: 'Application-like workflows push software architecture higher.',
      multimedia: 'Camera / media / AI makes compute bandwidth a core requirement.'
    };
    if (uiReason[d.uiComplexity]) r.push(uiReason[d.uiComplexity]);
    if (d.os !== 'Not decided') r.push(`${d.os} is already part of the intended software path.`);
    else if (d.gui !== 'Not decided') r.push(`${d.gui} is a useful signal for the graphics and application model.`);

    const highBandwidth = d.connectivity.filter(x => ['Camera','Audio / Video','Edge AI','Cellular'].includes(x));
    if (highBandwidth.length) r.push(`${highBandwidth.join(', ')} adds system-level compute or bandwidth needs.`);
    else if (d.connectivity.length) r.push(`${d.connectivity.join(', ')} must fit cleanly into the control and network architecture.`);

    const architectureReason = {
      serial: 'A smart-display path can minimize engineering effort for this brief.',
      compact: 'The current balance fits a compact programmable RTOS HMI.',
      performance: 'The brief needs more headroom while still fitting an RTOS model.',
      linux: 'The brief favors an application-class OS and richer software stack.',
      edge: 'Vision / media needs make compute, memory and thermal design first-class constraints.'
    };
    if (architectureReason[architecture]) r.push(architectureReason[architecture]);
    return r.slice(0, 3);
  }

  function fitLabel(scores) {
    const sorted = Object.values(scores).sort((a,b) => b-a);
    const gap = sorted[0] - sorted[1];
    return gap < 12 ? 'Compare two paths' : 'Primary direction';
  }

  function summarize(d) {
    return [
      ['Application', d.application], ['Display', d.display], ['UI', d.uiComplexityLabel], ['GUI', d.gui], ['OS', d.os],
      ['Connectivity', d.connectivity.length ? d.connectivity.join(', ') : 'None specified'], ['Stage', d.stage], ['Volume', d.volume], ['Timeline', d.timeline]
    ];
  }

  function buildParams(d, architectureName) {
    const p = new URLSearchParams();
    p.set('source', 'selector');
    p.set('architecture', architectureName);
    p.set('application', d.application);
    p.set('display', d.display);
    p.set('gui', d.gui);
    p.set('os', d.os);
    p.set('ui', d.uiComplexityLabel);
    p.set('connectivity', d.connectivity.join(', '));
    p.set('stage', d.stage);
    p.set('volume', d.volume);
    p.set('timeline', d.timeline);
    p.set('environment', d.environment);
    p.set('support', d.support.join(', '));
    return p.toString();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!stepValid(currentStep)) {
      validation.textContent = 'Please complete the required fields before continuing.';
      return;
    }

    const uiValue = value('uiComplexity');
    const uiLabels = { basic: 'Basic UI', rich: 'Rich UI', advanced: 'Advanced UI', multimedia: 'Vision / Media' };
    const d = {
      application: value('application'), screenSize: value('screenSize'), resolution: value('resolution'), touch: value('touch'), environment: value('environment'),
      uiComplexity: uiValue, uiComplexityLabel: uiLabels[uiValue] || uiValue, gui: value('gui'), os: value('os'), bootPriority: value('bootPriority'),
      connectivity: values('connectivity'), stage: value('stage'), timeline: value('timeline'), volume: value('volume'), lifecycle: value('lifecycle'), support: values('support')
    };
    d.display = deriveDisplayBrief(d.screenSize, d.resolution, d.touch);

    const scores = scoreArchitectures(d);
    const ranked = Object.entries(scores).sort((a,b) => b[1] - a[1]);
    const bestKey = ranked[0][0];
    const altKey = ranked[1][0];
    const best = ARCHITECTURES[bestKey];
    const alt = ARCHITECTURES[altKey];

    document.getElementById('architectureName').textContent = best.name;
    document.getElementById('architectureDescription').textContent = best.description;
    document.getElementById('architectureStack').innerHTML = best.stack.map(x => `<span class="tag blue">${x}</span>`).join('');
    document.getElementById('reasonList').innerHTML = makeReasons(d, bestKey).map(x => `<li>${x}</li>`).join('');
    document.getElementById('validateList').innerHTML = best.validate.map(x => `<li>${x}</li>`).join('');
    document.getElementById('alternativeName').textContent = alt.name;
    document.getElementById('alternativeText').textContent = 'Keep this path in view if UI, OS or performance needs change.';
    document.getElementById('fitBadge').textContent = fitLabel(scores);
    document.getElementById('resultIntro').textContent = `${best.name} is the best starting point for this brief.`;

    const summary = document.getElementById('selectorSummary');
    summary.innerHTML = `<div class="mini-label">Your requirement brief</div><div class="summary-grid">${summarize(d).map(([k,v]) => `<div><span>${k}</span><strong>${v}</strong></div>`).join('')}</div>`;

    const qs = buildParams(d, best.name);
    document.getElementById('evaluateHardwareLink').href = `hardware-application.html?${qs}`;
    document.getElementById('discussArchitectureLink').href = `submit-project.html?${qs}`;

    try {
      localStorage.setItem('openhmiSelectorBrief', JSON.stringify({ ...d, architecture: best.name, createdAt: new Date().toISOString() }));
    } catch (_) {}

    const result = document.getElementById('selectorResult');
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('selectorRestart').addEventListener('click', () => {
    form.reset();
    document.getElementById('selectorResult').hidden = true;
    showStep(1);
  });

  const incoming = new URLSearchParams(window.location.search);
  const applicationPrefill = incoming.get('application');
  if (applicationPrefill) {
    const application = form.elements.application;
    const match = Array.from(application.options).find(o => o.text === applicationPrefill || o.value === applicationPrefill);
    if (match) application.value = match.value;
  }

  showStep(1);
})();
