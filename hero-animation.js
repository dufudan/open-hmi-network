(() => {
 const video = document.getElementById('hero-video');
 const button = document.querySelector('.hero-video-toggle');
 const motion = matchMedia('(prefers-reduced-motion: reduce)');
 const sync = () => { button.textContent = video.paused ? 'Play animation' : 'Pause animation'; };
 const preference = () => { if (motion.matches) { video.pause(); video.removeAttribute('autoplay'); } else { video.play().catch(sync); } sync(); };
 video.addEventListener('play', sync);
 video.addEventListener('pause', sync);
 button.addEventListener('click', () => { if (video.paused) video.play().catch(sync); else video.pause(); });
 motion.addEventListener('change', preference);
 preference();
})();
