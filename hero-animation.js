(() => {
 const video = document.getElementById('hero-video');
 const button = document.querySelector('.hero-video-toggle');
 const sync = () => { button.textContent = video.paused ? 'Play animation' : 'Pause animation'; };
 const start = () => { video.muted = true; video.play().catch(sync); sync(); };
 video.addEventListener('play', sync);
 video.addEventListener('pause', sync);
 button.addEventListener('click', () => { if (video.paused) video.play().catch(sync); else video.pause(); });
 video.addEventListener('canplay', start, { once: true });
 start();
})();
