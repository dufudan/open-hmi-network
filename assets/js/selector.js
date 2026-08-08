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
      description: 'A display-centric architecture that minimizes application-side software effort for straightforward control and status interfaces.',
      stack: ['Display module with controller', 'Serial / simple host interface', 'Fast integration', 'Lowest software burden'],
      validate: ['Whether the UI can stay within a fixed display-module feature set', 'Host communication protocol and update rate', 'Long-term display/module availability', 'When future UI growth would justify moving to a programmable HMI platform']
    },
    compact: {
      name: 'Compact RTOS HMI',
      description: 'A responsive MCU-class HMI architecture for embedded control products that need a polished GUI, fast boot and deterministic behavior without Linux overhead.',
      stack: ['RTOS or lightweight runtime', 'LVGL-class GUI', 'Integrated display controller', 'Control-oriented connectivity'],
      validate: ['Framebuffer and graphics memory requirement', 'Display interface and pixel clock', 'Boot-time and real-time constraints', 'Flash / RAM sizing for assets and fonts']
    },
    performance: {
      name: 'Performance RTOS HMI',
      description: 'A higher-headroom real-time HMI architecture for richer graphics, larger displays and multiple interfaces while keeping an RTOS-style product model.',
      stack: ['Higher-performance MCU / HMI SoC class', 'LVGL-class GUI', 'RTOS', 'Expanded memory and connectivity'],
      validate: ['Animation and rendering load', 'External memory bandwidth', 'High-resolution display timing', 'Whether application complexity is approaching Linux-class requirements']
    },
    linux: {
      name: 'Embedded Linux HMI',
      description: 'A Linux-class application architecture for larger displays, richer workflows, complex networking and GUI frameworks such as Qt/QML.',
      stack: ['Embedded Linux', 'Qt/QML or Linux GUI stack', 'MPU / application SoC class', 'Rich networking and storage'],
      validate: ['Boot-time expectation', 'BSP / kernel / driver ownership', 'Storage and update strategy', 'Long-term software maintenance and security']
    },
    edge: {
      name: 'Edge / Vision HMI',
      description: 'A high-performance HMI architecture for camera, video, AI inference or intensive graphics where the display is part of a broader edge-compute system.',
      stack: ['Linux / Android-class OS', 'Camera / multimedia pipeline', 'GPU / NPU-capable SoC class', 'High-bandwidth memory and interfaces'],
      validate: ['Camera sensor and video pipeline', 'AI model and NPU requirements', 'Thermal / power envelope', 'Display, camera and inference concurrency']
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
    if (d.uiComplexity === 'multimedia') r.push('Camera / multimedia-class UI demand strongly increases compute and memory requirements.');
    else if (d.uiComplexity === 'advanced') r.push('The UI is application-like rather than a simple control panel, so software architecture matters as much as display drive.');
    else if (d.uiComplexity === 'rich') r.push('The project needs a polished graphical UI but can still benefit from an embedded-first architecture.');
    else r.push('The UI requirement is control-oriented, so minimizing software and system overhead remains valuable.');

    if (d.os !== 'Not decided') r.push(`${d.os} is already a stated software direction and is reflected in the architecture recommendation.`);
    else r.push('The OS is still open, so the recommendation keeps the software path flexible until performance is measured.');

    if (d.gui !== 'Not decided') r.push(`${d.gui} provides a useful signal for the expected graphics and application model.`);
    const highBandwidth = d.connectivity.filter(x => ['Camera','Audio / Video','Edge AI','Cellular'].includes(x));
    if (highBandwidth.length) r.push(`System features such as ${highBandwidth.join(', ')} push the design beyond a display-only decision.`);
    else if (d.connectivity.length) r.push(`Required interfaces (${d.connectivity.join(', ')}) favor an architecture that can integrate control and networking cleanly.`);

    if (architecture === 'serial') r.push('The current requirement appears simple enough that a smart-display path may reduce engineering effort, provided future UI growth is limited.');
    if (architecture === 'compact') r.push('The current balance of display size, UI complexity and real-time behavior fits a compact programmable HMI well.');
    if (architecture === 'performance') r.push('The project needs more graphics or interface headroom than a compact HMI, while still benefiting from an RTOS-style product model.');
    if (architecture === 'linux') r.push('The combination of display/UI complexity and system features favors an application-class OS and richer software stack.');
    if (architecture === 'edge') r.push('Vision / multimedia requirements make compute pipeline, memory bandwidth and thermal design first-class architecture constraints.');
    return r.slice(0, 5);
  }

  function fitLabel(scores) {
    const sorted = Object.values(scores).sort((a,b) => b-a);
    const gap = sorted[0] - sorted[1];
    if (gap >= 25) return 'Strong fit';
    if (gap >= 12) return 'Good fit';
    return 'Two paths worth evaluating';
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
    const uiLabels = { basic: 'Basic control UI', rich: 'Rich graphical UI', advanced: 'Advanced application UI', multimedia: 'Multimedia / Vision' };
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
    document.getElementById('alternativeText').textContent = `Also worth keeping in view if your priorities change. The final decision should be confirmed with real UI, display and interface performance testing.`;
    document.getElementById('fitBadge').textContent = fitLabel(scores);
    document.getElementById('resultIntro').textContent = `Based on the current brief, ${best.name} is the best architecture direction to evaluate first — before narrowing to a specific processor or display.`;

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

  showStep(1);
})();
