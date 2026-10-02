'use strict';

// Integration contract: configure window.OPENHMI_CONFIG before loading app.js.
// Default delivery uses the existing Web3Forms key. Optional custom endpoints
// accept multipart "brief" (JSON). Project materials are shared as links.
(() => {
  const config = window.OPENHMI_CONFIG || {};
  const stages = {idea:'Idea → Prototype',architecture:'Architecture → Product',prototype:'Prototype → Production'};
  const architecture = [
    ['compute','MCU / MPU / SoM','Current device or module'],
    ['os','OS','Linux, RTOS, Android…'],
    ['gui','GUI Framework','LVGL, Qt / QML…'],
    ['interfaces','Interfaces','CAN, UART, USB…'],
    ['memory','Memory','RAM and storage'],
    ['connectivity','Connectivity','Wi-Fi, Ethernet, BLE…']
  ];
  const advanced = [
    ['display','Display / Touch','Size, resolution, touch type'],
    ['performance','Boot Time / Performance','Boot target, frame rate…'],
    ['temperature','Temperature','Operating range'],
    ['lifecycle','Lifecycle','Support period'],
    ['volume','Annual Volume','Units per year'],
    ['bom','Target BOM','Amount and currency'],
    ['certification','Certification','CE, FCC, UL…']
  ];
  const form = document.querySelector('[data-intake]');
  const dialog = document.getElementById('review-dialog');
  const state = {links:[],brief:null,email:'',acceptedFingerprint:''};
  let submitting = false;
  let activeDemo;
  const $ = (selector, parent=document) => parent.querySelector(selector);
  function element(tag, text, cls) {
    const node = document.createElement(tag);
    if(text !== undefined) node.textContent = text;
    if(cls) node.className = cls;
    return node;
  }
  function fieldRows(fields, target, cls) {
    if(!target) return;
    for(const [key,label,placeholder] of fields) {
      const row=element('div',undefined,cls);
      const fieldLabel=element('label',label);fieldLabel.htmlFor=key;
      const input=element('input');input.id=key;input.name=key;input.placeholder=placeholder;
      const select=element('select');select.name=key+'Level';select.setAttribute('aria-label',label+' constraint level');
      ['Open','Preferred','Mandatory'].forEach(value=>{const option=element('option',value);option.value=value;select.append(option);});
      select.addEventListener('change',()=>{select.dataset.level=select.value;});
      row.append(fieldLabel,input,select);target.append(row);
    }
  }
  fieldRows(architecture,$('#architecture-fields'),'architecture-row');
  fieldRows(advanced,$('#advanced-fields'),'advanced-row');
  function showError(message) { const error=$('.form-error',form);error.textContent=message;error.hidden=!message; }
  function attachmentChip(text, label, remove) {
    const chip=element('div',undefined,'attachment');const name=element('span',text);name.title=text;
    const button=element('button','×');button.type='button';button.setAttribute('aria-label',label);button.addEventListener('click',remove);chip.append(name,button);return chip;
  }
  function renderAttachments() {
    const container=$('.attachments',form);container.replaceChildren();
    state.links.forEach((url,index)=>container.append(attachmentChip(url,'Remove link '+url,()=>{state.links.splice(index,1);renderAttachments();})));
  }
  function addLink() {
    const input=$('#project-link',form);const raw=input.value.trim();if(!raw){input.focus();return false;}
    try {
      const url=new URL(raw);if(!['https:','http:'].includes(url.protocol)) throw new Error('Unsupported protocol');
      if(!state.links.includes(url.href)) state.links.push(url.href);
      input.value='';$('.link-field',form).hidden=true;showError('');renderAttachments();return true;
    } catch {showError('Enter a valid link beginning with https:// or http://.');input.focus();return false;}
  }
  form.addEventListener('click',event=>{
    const action=event.target.closest('[data-action]')?.dataset.action;
    if(action==='link') {const field=$('.link-field',form);field.hidden=!field.hidden;if(!field.hidden) $('#project-link',form).focus();}
    if(action==='save-link') addLink();
  });
  $('#project-link',form).addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();addLink();}});
  // Avoid leaving the project page if someone accidentally drops a local file.
  document.addEventListener('dragover',event=>{if(event.dataTransfer.types.includes('Files')) event.preventDefault();});
  document.addEventListener('drop',event=>{if(event.dataTransfer.types.includes('Files')){event.preventDefault();showError('Please add a sharing link instead of a file.');}});
  document.querySelectorAll('[data-example]').forEach(button=>button.addEventListener('click',()=>{$('#description',form).value=button.dataset.example;showError('');$('#description',form).focus();}));
  const params=new URLSearchParams(location.search);
  if(form.dataset.intake==='engineering') {
    if(stages[params.get('stage')]) $('#project-stage').value=params.get('stage');
    if(params.get('som')==='1') {$('#description').value='We have a working SoM prototype and want to evaluate the path to production.';$('#compute').value='Existing SoM — model to be confirmed';$('#architecture-notes').value='Compare keeping the current SoM, an optimized module, and a custom SoC board.';}
    const optimization=$('[name="optimizationAllowed"]',form);
    optimization.addEventListener('change',()=>$('.switch-label').textContent=optimization.checked?'Allowed':'Not allowed');
  }
  function inferStage(description) {
    if(/prototype|production|mass produc|som/i.test(description)) return 'prototype';
    if(/architecture|specification|schematic|bom/i.test(description)) return 'architecture';
    return 'idea';
  }
  function collectBrief() {
    const description=$('#description',form).value.trim();const data=new FormData(form);
    const entries=fields=>fields.map(([key,label])=>({key,label,value:String(data.get(key)||'').trim(),constraintLevel:data.get(key+'Level')||'Open'})).filter(entry=>entry.value);
    return {schemaVersion:'1.0',source:form.dataset.intake,createdAt:new Date().toISOString(),description,
      projectStage:data.get('stage')||inferStage(description),productRequirements:data.get('requirements')||'',
      currentArchitectureAssumptions:entries(architecture),architectureNotes:data.get('architectureNotes')||'',
      productSpecifications:entries(advanced),productionOptimizationAllowed:form.dataset.intake==='engineering'?data.get('optimizationAllowed')==='on':null,
      links:[...state.links],attachments:[]};
  }
  function openDialog(title) {
    dialog.replaceChildren();const header=element('div',undefined,'dialog-header');const heading=element('h2',title);heading.id='review-title';
    const close=element('button','×','close-dialog');close.type='button';close.setAttribute('aria-label','Close review');close.addEventListener('click',()=>{if(!submitting)dialog.close();});header.append(heading,close);
    const body=element('div',undefined,'dialog-body');const footer=element('div',undefined,'dialog-footer');dialog.append(header,body,footer);
    if(!dialog.open) dialog.showModal();return {body,footer};
  }
  function block(body,label,text) {if(!text)return;const section=element('section',undefined,'review-block');section.append(element('h3',label),element('p',text));body.append(section);}
  function linksBlock(body,brief) {
    if(!brief.links.length)return;
    const section=element('section',undefined,'review-block');section.append(element('h3','Project links'));const list=element('ul',undefined,'review-files');brief.links.forEach(value=>list.append(element('li',value)));section.append(list);body.append(section);
  }
  function tableBlock(body,label,rows) {
    if(!rows.length)return;const section=element('section',undefined,'review-block');section.append(element('h3',label));
    const table=element('table',undefined,'review-table');const head=element('thead');const titles=element('tr');['Field','Your choice','Constraint'].forEach(text=>{const th=element('th',text);th.scope='col';titles.append(th);});head.append(titles);table.append(head);
    const tbody=element('tbody');rows.forEach(row=>{const tr=element('tr');tr.append(element('td',row.label),element('td',row.value),element('td',row.constraintLevel,row.constraintLevel==='Mandatory'?'mandatory':''));tbody.append(tr);});table.append(tbody);section.append(table);body.append(section);
  }
  function action(footer,label,cls,handler) {const button=element('button',label,'button '+cls);button.type='button';button.addEventListener('click',handler);footer.append(button);return button;}
  async function submitBrief(brief) {
    if(submitting)return;
    const contact=$('#review-contact',dialog);
    if(!contact.reportValidity())return;
    if(contact.elements.botcheck.checked)return;
    brief.contact={email:contact.elements.email.value.trim()};state.email=brief.contact.email;
    const fingerprint=window.OpenHMITransport.fingerprint(brief);
    if(state.acceptedFingerprint===fingerprint){showReceived();return;}
    submitting=true;
    const controls=[...dialog.querySelectorAll('button,input,select')];
    const disabled=controls.map(control=>control.disabled);controls.forEach(control=>control.disabled=true);
    dialog.setAttribute('aria-busy','true');
    const button=$('[data-submit-brief]',dialog);const label=button.textContent;button.textContent='Sending…';
    const existing=$('.submission-error',dialog);if(existing)existing.remove();
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
    try {
      await window.OpenHMITransport.send({brief,config,signal:controller.signal});
      state.acceptedFingerprint=fingerprint;showReceived();
    } catch(error) {
      const detail=error.name==='AbortError'?'Could not confirm submission in time. A delayed request may still arrive.':error instanceof TypeError?'Could not connect. Please retry.':error.message;
      const notice=element('p',detail+' Your details are preserved.','form-error submission-error');notice.setAttribute('role','alert');$('.dialog-body',dialog).append(notice);
    } finally {
      clearTimeout(timer);submitting=false;dialog.removeAttribute('aria-busy');
      controls.forEach((control,index)=>control.disabled=disabled[index]);button.textContent=label;
    }
  }
  function showReceived() {
    const {body,footer}=openDialog('Thank you. Your request was submitted.');
    body.append(element('p','We’ll follow up by email. You can share files then.','demo-preview-copy'));
    action(footer,'Close','primary',()=>dialog.close());
  }
  function contactBlock(body,brief) {
    const contact=element('form',undefined,'review-contact');contact.id='review-contact';
    const label=element('label','Your email','review-label');label.htmlFor='review-email';
    const email=element('input');email.id='review-email';email.name='email';email.type='email';email.required=true;email.autocomplete='email';email.maxLength=254;email.placeholder='you@company.com';email.value=state.email;
    email.addEventListener('input',()=>{state.email=email.value;});
    const bot=element('input');bot.name='botcheck';bot.type='checkbox';bot.hidden=true;bot.tabIndex=-1;bot.setAttribute('aria-hidden','true');
    contact.append(label,email,bot);
    contact.addEventListener('submit',event=>{event.preventDefault();submitBrief(brief);});body.append(contact);
  }
  function showReview(brief) {
    state.brief=brief;const engineering=brief.source==='engineering';const {body,footer}=openDialog(engineering?'Review your architecture':'Review your project');
    contactBlock(body,brief);
    block(body,'Your project',brief.description);linksBlock(body,brief);
    const stageBlock=element('section',undefined,'review-block');const label=element('label','Starting point','review-label');label.htmlFor='review-stage';const select=element('select');select.id='review-stage';
    Object.entries(stages).forEach(([key,text])=>{const option=element('option',text);option.value=key;option.selected=key===brief.projectStage;select.append(option);});
    select.addEventListener('change',()=>{brief.projectStage=select.value;const original=$('#project-stage');if(original)original.value=select.value;});stageBlock.append(label,select);body.append(stageBlock);
    if(engineering) {
      block(body,'Product Requirements',brief.productRequirements);tableBlock(body,'Current Architecture Assumptions',brief.currentArchitectureAssumptions);block(body,'Other assumptions',brief.architectureNotes);tableBlock(body,'Product specification',brief.productSpecifications);
      block(body,'Production Optimization Allowed',brief.productionOptimizationAllowed?'Allowed — Mandatory choices stay fixed.':'Not allowed — retain the current architecture.');
    }
    action(footer,'Edit details','secondary',()=>dialog.close());
    const send=element('button',engineering?'Submit for Engineering Review':'Send project brief','button primary');
    send.type='submit';send.setAttribute('form','review-contact');send.dataset.submitBrief='';footer.append(send);
  }
  form.addEventListener('submit',event=>{
    event.preventDefault();const pendingLink=$('#project-link',form).value.trim();if(pendingLink&&!addLink())return;
    const brief=collectBrief();const hasEngineeringDetail=brief.productRequirements.trim()||brief.architectureNotes.trim()||brief.currentArchitectureAssumptions.length||brief.productSpecifications.length;
    if(!brief.description&&!brief.links.length&&!hasEngineeringDetail){showError('Add a few words or a link to get started.');$('#description',form).focus();return;}
    showError('');showReview(brief);
  });
  dialog.addEventListener('cancel',event=>{if(submitting)event.preventDefault();});
  dialog.addEventListener('click',event=>{if(!submitting&&event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
  const demoInfo={figma:['Figma → Embedded Hardware','Explore the journey from a screen design to an embedded interface.'],navigation:['Navigation Display','A compact interface for route guidance and essential navigation information.'],robot:['Robot Controller','A touchscreen for robot status, operating modes and manual control.'],charger:['Industrial / EV Charger HMI','A clear charging interface for public and industrial environments.']};
  document.querySelectorAll('[data-demo]').forEach(button=>button.addEventListener('click',()=>{
    activeDemo=button.dataset.demo;const [title,copy]=demoInfo[activeDemo];const {body,footer}=openDialog(title);const preview=$('.demo-art',button).cloneNode(true);preview.classList.add('demo-modal-art');body.append(preview,element('p',copy,'demo-preview-copy'),element('p','Concept preview','dialog-note'));
    action(footer,'Close','secondary',()=>dialog.close());action(footer,'Start a similar project','primary',()=>{dialog.close();$('#description',form).value='I would like to build a '+title.toLowerCase()+'.';$('#intake').scrollIntoView({behavior:'smooth',block:'center'});$('#description',form).focus({preventScroll:true});});
  }));
  window.OpenHMI={getBrief:collectBrief,review:()=>form.requestSubmit(),schemaVersion:'1.0'};
})();
