'use strict';

// Form delivery is separate from the page UI so it can be verified without sending email.
(function (root) {
  const stages = {idea:'Idea → Prototype', architecture:'Architecture → Product', prototype:'Prototype → Production'};
  function message(brief) {
    const lines = [
      'OpenHMI Project Brief',
      'Entry: ' + (brief.source === 'engineering' ? 'Engineering Path' : 'Homepage'),
      'Email: ' + brief.contact.email,
      'Project stage: ' + (stages[brief.projectStage] || brief.projectStage),
      '', 'Project', brief.description || 'See the supplied materials.'
    ];
    const section = (title, text) => { if (text) lines.push('', title, text); };
    const rows = values => values.map(row => row.label + ': ' + row.value + ' [' + row.constraintLevel + ']').join('\n');
    section('Product Requirements', brief.productRequirements);
    section('Current Architecture Assumptions', rows(brief.currentArchitectureAssumptions));
    section('Other assumptions', brief.architectureNotes);
    section('Product specifications', rows(brief.productSpecifications));
    if (brief.productionOptimizationAllowed !== null) {
      section('Production Optimization Allowed', brief.productionOptimizationAllowed ? 'Allowed. Mandatory choices must remain fixed.' : 'Not allowed.');
    }
    section('Project links', brief.links.join('\n'));
    return lines.join('\n');
  }
  function fingerprint(brief) {
    const {createdAt, ...content} = brief;
    return JSON.stringify(content);
  }
  async function send({brief, config, signal}) {
    if (!brief.contact?.email) throw new Error('A reply email is required.');
    if (brief.attachments?.length) throw new Error('Please share files using a link.');
    const endpoint = brief.source === 'engineering' ? config.engineeringEndpoint : config.intakeEndpoint;
    const payload = new FormData();
    if (endpoint) {
      payload.append('brief', JSON.stringify(brief));
      const response = await fetch(endpoint, {method:'POST', body:payload, signal});
      if (!response.ok) throw new Error('Submission not accepted.');
      return;
    }
    if (!config.web3formsAccessKey) throw new Error('Form delivery is not configured.');
    const fields = {
      access_key:config.web3formsAccessKey,
      email:brief.contact.email,
      name:'OpenHMI project visitor',
      subject:brief.source === 'engineering' ? 'OpenHMI Engineering Review' : 'OpenHMI Project Inquiry',
      from_name:'OpenHMI Website',
      botcheck:false,
      'Project Stage':stages[brief.projectStage] || brief.projectStage,
      'Project Summary':brief.description || 'Project submitted with links or engineering details.',
      message:message(brief)
    };
    const response = await fetch('https://api.web3forms.com/submit', {
      method:'POST', headers:{'Content-Type':'application/json',Accept:'application/json'}, body:JSON.stringify(fields), signal
    });
    let result;
    try { result = await response.json(); } catch { throw new Error('Could not confirm acceptance.'); }
    if (!response.ok || result.success !== true) {
      throw new Error('Submission was not accepted. Please retry.');
    }
  }
  root.OpenHMITransport = {send, message, fingerprint};
})(window);
