const Touch = {
  active: false,
  identifier: null,
  baseX: 0,
  baseY: 0,
  thumbX: 0,
  thumbY: 0,
  dx: 0,
  dy: 0,
  baseRadius: 65,
  thumbRadius: 26,

  init() {
    const canvas = Game.canvas;
    canvas.addEventListener('touchstart',  (e) => this.handleStart(e),  { passive: false });
    canvas.addEventListener('touchmove',   (e) => this.handleMove(e),   { passive: false });
    canvas.addEventListener('touchend',    (e) => this.handleEnd(e),    { passive: false });
    canvas.addEventListener('touchcancel', (e) => this.handleEnd(e),    { passive: false });
  },

  _toCanvas(clientX, clientY) {
    const rect = Game.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (Game.width  / rect.width),
      y: (clientY - rect.top)  * (Game.height / rect.height),
    };
  },

  handleStart(e) {
    e.preventDefault();
    if (this.active) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const pos = this._toCanvas(t.clientX, t.clientY);
      if (pos.x > Game.width / 2) continue;
      this.active = true;
      this.identifier = t.identifier;
      this.baseX  = pos.x;
      this.baseY  = pos.y;
      this.thumbX = pos.x;
      this.thumbY = pos.y;
      this.dx = 0;
      this.dy = 0;
      break;
    }
  },

  handleMove(e) {
    e.preventDefault();
    if (!this.active) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier !== this.identifier) continue;
      const pos = this._toCanvas(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
      const rawDx = pos.x - this.baseX;
      const rawDy = pos.y - this.baseY;
      const dist  = Math.sqrt(rawDx * rawDx + rawDy * rawDy);
      const max   = this.baseRadius;
      if (dist > max) {
        this.thumbX = this.baseX + (rawDx / dist) * max;
        this.thumbY = this.baseY + (rawDy / dist) * max;
      } else {
        this.thumbX = pos.x;
        this.thumbY = pos.y;
      }
      this.dx = (this.thumbX - this.baseX) / max;
      this.dy = (this.thumbY - this.baseY) / max;
      break;
    }
  },

  handleEnd(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier !== this.identifier) continue;
      this.active = false;
      this.identifier = null;
      this.dx = 0;
      this.dy = 0;
      break;
    }
  },

  render(ctx) {
    if (!this.active) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.beginPath();
    ctx.arc(this.baseX, this.baseY, this.baseRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.baseX - this.baseRadius, this.baseY);
    ctx.lineTo(this.baseX + this.baseRadius, this.baseY);
    ctx.moveTo(this.baseX, this.baseY - this.baseRadius);
    ctx.lineTo(this.baseX, this.baseY + this.baseRadius);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.thumbX, this.thumbY, this.thumbRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  },

  isMobile() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
};
