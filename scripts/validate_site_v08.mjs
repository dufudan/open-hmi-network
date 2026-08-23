import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>https:\/\/openhmi\.network\/(.*?)<\/loc>/g)].map(match => match[1]);
const htmlFiles = sitemapUrls
  .map(urlPath => path.join(root, urlPath || 'index.html'))
  .filter(file => file.endsWith('.html'));
const missing = [];
let references = 0;
const attrPattern = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;

for (const htmlFile of htmlFiles) {
  const html = fs.readFileSync(htmlFile, 'utf8');
  for (const match of html.matchAll(attrPattern)) {
    const original = match[1].trim();
    if (!original || /^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(original)) continue;
    references += 1;
    const clean = decodeURIComponent(original.split('#')[0].split('?')[0]);
    const resolved = clean.startsWith('/')
      ? path.join(root, clean.replace(/^\/+/, ''))
      : path.resolve(path.dirname(htmlFile), clean);
    if (!fs.existsSync(resolved)) {
      missing.push(`${path.relative(root, htmlFile)} -> ${original}`);
    }
  }
}

for (const urlPath of sitemapUrls) {
  const clean = urlPath || 'index.html';
  const resolved = clean.endsWith('/') ? path.join(root, clean, 'index.html') : path.join(root, clean);
  const fallback = clean === '' ? path.join(root, 'index.html') : resolved;
  if (!fs.existsSync(fallback)) missing.push(`sitemap.xml -> /${urlPath}`);
}

console.log(`HTML files: ${htmlFiles.length}`);
console.log(`Local references checked: ${references}`);
console.log(`Sitemap URLs checked: ${sitemapUrls.length}`);
if (missing.length) {
  console.error(`Missing references: ${missing.length}`);
  missing.forEach(item => console.error(`- ${item}`));
  process.exitCode = 1;
} else {
  console.log('Missing references: 0');
}
