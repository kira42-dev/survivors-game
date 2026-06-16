const Touch = {
  active: false,
  identifier: null,
  baseX: 0,
  baseY: 0,
  thumbX: 0,
  thumbY: 0,
  dx: 0,
  dy: 0,
  baseRadius: 60,
  thumbRadius: 22,
  margin: 40,

  init() {
    const canvas = Game.canvas;
    canvas.addEventListener('touchstart', (e) => this.handleStart(e), { passive: false });
    canvas.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
    canvas.addEventListener('touchend', (e) => this.handleEnd(e), { passive: false });
    canvas.addEventListener('touchcancel', (e) => this.handleEnd(e), { passive: false });
  },

  handleStart(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    if (!touch) return;
    this.active = true;
    this.identifier = touch.identifier;
    this.baseX = this.margin + this.baseRadius;
    this.baseY = Game.height - this.margin - this.baseRadius;
    this.thumbX = this.baseX;
    this.thumbY = this.baseY;
    this.dx = 0;
    this.dy = 0;
  },

  handleMove(e) {
    e.preventDefault();
    if (!this.active) return;
    let touch = null;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.identifier) {
        touch = e.changedTouches[i];
        break;
      }
    }
    if (!touch) return;
    const rawDx = touch.clientX - this.baseX;
    const rawDy = touch.clientY - this.baseY;
    const dist = Math.sqrt(rawDx * rawDx + rawDy * rawDy);
    const maxDist = this.baseRadius;
    if (dist > maxDist) {
      this.thumbX = this.baseX + (rawDx / dist) * maxDist;
      this.thumbY = this.baseY + (rawDy / dist) * maxDist;
    } else {
      this.thumbX = touch.clientX;
      this.thumbY = touch.clientY;
    }
    this.dx = (this.thumbX - this.baseX) / maxDist;
    this.dy = (this.thumbY - this.baseY) / maxDist;
  },

  handleEnd(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.identifier) {
        this.active = false;
        this.identifier = null;
        this.dx = 0;
        this.dy = 0;
        break;
      }
    }
  },

  render(ctx) {
    if (!this.active) return;
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.baseX, this.baseY, this.baseRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(this.thumbX, this.thumbY, this.thumbRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },

  isMobile() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
};
