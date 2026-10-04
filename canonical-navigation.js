// Keep browser navigation on the canonical URL; preserve attribution and anchors.
(function () {
  if (window.location.pathname === '/index.html' &&
      (window.location.protocol === 'https:' || window.location.protocol === 'http:')) {
    window.location.replace('/' + window.location.search + window.location.hash);
  }
})();
