const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resize();
window.addEventListener('resize', resize);

ctx.fillStyle = '#fff';
ctx.font = '24px monospace';
ctx.textAlign = 'center';
ctx.fillText('Loading...', window.innerWidth / 2, window.innerHeight / 2);
