const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '../canonical-navigation.js'), 'utf8');
function run(pathname, protocol, search = '', hash = '') {
  const calls = [];
  vm.runInNewContext(code, {window: {location: {pathname, protocol, search, hash, replace: url => calls.push(url)}}});
  return calls;
}
assert.deepEqual(run('/index.html', 'https:', '?utm_source=test', '#intake'), ['/?utm_source=test#intake']);
assert.deepEqual(run('/index.html', 'http:'), ['/']);
assert.deepEqual(run('/', 'https:', '', '#intake'), []);
assert.deepEqual(run('/index.html', 'file:'), []);
assert.deepEqual(run('/tools/lvgl-memory-estimator/index.html', 'https:'), []);
console.log('PASS: homepage alias redirects with attribution and anchors; root, tools and file previews stay stable.');
