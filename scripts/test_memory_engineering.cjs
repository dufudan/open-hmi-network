// Run with Playwright installed and CHROME_PATH set when using system Chrome.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const output = process.env.MEMORY_QA_OUTPUT;
const server = http.createServer((req,res) => {
  const url = new URL(req.url, 'http://localhost');
  const target = path.join(root, decodeURIComponent(url.pathname), url.pathname.endsWith('/') ? 'index.html' : '');
  if (!target.startsWith(root + path.sep)) {res.writeHead(403).end(); return;}
  const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml'};
  fs.readFile(target,(err,data)=>{ if(err) res.writeHead(404).end(); else res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream'}).end(data); });
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try {
    const page=await browser.newPage();
    const missing=[], errors=[];
    page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400) missing.push(r.url());});
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
    const hub='/hardware/memory/';
    const paths=[hub,...fs.readdirSync(path.join(root,hub)).filter(p=>fs.statSync(path.join(root,hub,p)).isDirectory()).map(p=>hub+p+'/')];
    for(const url of paths){
      for(const width of [1440,1280,1100,1024,900,861,390,320]){
        await page.setViewportSize({width,height:1000});
        await page.goto(base+url,{waitUntil:'networkidle'});
        const result=await page.evaluate(()=>({
          h1:document.querySelectorAll('h1').length,
          overflow:document.documentElement.scrollWidth>innerWidth,
          anchors:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.hash.slice(1))).map(a=>a.hash),
          canonical:document.querySelector('link[rel=canonical]').href,
          schemas:[...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(s=>JSON.parse(s.textContent)['@graph']||[]),
        }));
        assert.equal(result.h1,1,url+' H1');
        assert.equal(result.overflow,false,url+' overflow at '+width);
        assert.deepEqual(result.anchors,[],url+' local anchors');
        assert.equal(result.canonical,'https://openhmi.network'+url);
        assert.equal(await page.locator('.oh-navigation a[href="/hardware/memory/"]').count(),0,'Memory belongs under Hardware, not in main navigation');
        const article=result.schemas.find(n=>n['@type']==='Article');
        if(!['/hardware/memory/','/hardware/memory/review/'].includes(url)) assert.ok(article,url+' Article schema');
        for(const faq of result.schemas.filter(n=>n['@type']==='FAQPage')) for(const q of faq.mainEntity){
          assert.ok(await page.getByRole('heading',{name:q.name,exact:true}).count());
          assert.ok((await page.locator('.memory-faq').innerText()).includes(q.acceptedAnswer.text));
        }
        if(width===390){
          await page.locator('.oh-menu-toggle').click();
          assert.equal(await page.locator('.oh-menu-toggle').getAttribute('aria-expanded'),'true');
          assert.ok(await page.locator('.oh-engineering-menu>summary').isVisible());
        }
        if(output&&[1440,390].includes(width)&&[hub,hub+'review/',hub+'nxp-imx-memory-compatibility-guide/'].includes(url)){
          fs.mkdirSync(output,{recursive:true});
          await page.screenshot({path:path.join(output,(url===hub?'hub':url.split('/').at(-2))+'-'+width+'.png'),fullPage:true});
        }
      }
    }
    // Keep global navigation unchanged; the Hardware card is the hub entry point.
    for(const url of ['/','/hardware.html','/engineering.html','/demos/idea-to-prototype/']){
      await page.setViewportSize({width:900,height:1000});
      await page.goto(base+url,{waitUntil:'networkidle'});
      assert.equal(await page.locator('.oh-navigation a[href="/hardware/memory/"]').count(),0,url+' main navigation hierarchy');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,url+' overflow');
      if(url==='/hardware.html') assert.equal(await page.locator('.hardware-layer-card[href="/hardware/memory/"]').count(),1,'Hardware links to Memory');
    }
    await page.goto(base+hub+'review/');
    let requests=0,payload;
    await page.route('https://api.web3forms.com/submit',async route=>{
      requests++; payload=route.request().postDataJSON();
      await route.fulfill({status:200,contentType:'application/json',body:'{"success":true}'});
    });
    await page.locator('[type=submit]').click();
    assert.equal(requests,0,'Required fields prevent submission');
    for(const [id,value] of Object.entries({processor:'NXP i.MX8M Plus',part:'Current-PN-123',requirements:'2 GB LPDDR4',temperature:'-40 to 85 C',volume:'20000/year',name:'QA Test',company:'Test only',email:'qa@example.com',notes:'Mocked request; never delivered'})) await page.locator('#'+id).fill(value);
    await page.locator('[name=Consent]').check();
    await page.locator('[type=submit]').click();
    await page.getByRole('status').filter({hasText:'has been submitted'}).waitFor();
    assert.equal(requests,1);
    for(const key of ['Processor','Current Memory PN','Capacity / Requirements','Temperature','Estimated Annual Volume']) assert.ok(payload[key]&&payload['Memory Design-in Summary'].includes(payload[key]),key+' in payload');
    assert.equal(payload.subject,'OpenHMI Memory Compatibility Review');
    await page.locator('[type=submit]').click();
    await page.getByRole('status').filter({hasText:'already been submitted'}).waitFor();
    assert.equal(requests,1,'Duplicate suppressed');
    await page.locator('#part').fill('Changed-PN');
    await page.route('https://api.web3forms.com/submit',route=>route.fulfill({status:500,contentType:'application/json',body:'{"success":false}'}));
    await page.locator('[type=submit]').click();
    await page.locator('[data-email-preview]').waitFor({state:'visible'});
    assert.ok((await page.locator('[data-prepared-brief]').inputValue()).includes('Changed-PN'));
    assert.ok((await page.locator('[data-email-fallback]').getAttribute('href')).includes('Memory%20Compatibility%20Review'));
    assert.equal(await page.locator('#part').inputValue(),'Changed-PN','Values kept after failure');
    // Existing checklist uses the same transport without the review-form branch.
    await page.goto(base+'/tools/embedded-memory-checklist/');
    await page.locator('#soc').selectOption({label:'NXP'});
    await page.locator('#socPart').fill('i.MX8M Plus');
    await page.locator('#memoryNeed').selectOption('dram');
    await page.locator('#ddrType').selectOption('LPDDR4');
    await page.locator('#dramCapacity').fill('2 GB');
    await page.locator('#annualVolume').fill('20000/year');
    await page.locator('#quoteButton').click();
    assert.ok((await page.locator('#quoteSummary').inputValue()).includes('2 GB'));
    assert.ok((await page.locator('#quoteSummary').inputValue()).includes('i.MX8M Plus'));
    assert.deepEqual(missing,[],'No missing local resources');
    assert.deepEqual(errors,[],'No browser errors');
    console.log('PASS: 7 memory pages at 8 widths; Hardware hierarchy, navigation, schemas, anchors, required fields, mocked submission, duplicate handling, email fallback and existing checklist. No live request sent.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
