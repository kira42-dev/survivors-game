const Player = {
  x: 1000,
  y: 1000,
  speed: 200,
  width: 48,
  height: 48,
  dir: 0,
  animFrame: 0,
  animTimer: 0,
  moving: false,
  keys: {},

  init() {
    window.addEventListener('keydown', (e) => { this.keys[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', (e) => { this.keys[e.key.toLowerCase()] = false; });
  },

  update(dt) {
    let dx = 0, dy = 0;
    if (this.keys['w'] || this.keys['arrowup']) dy = -1;
    if (this.keys['s'] || this.keys['arrowdown']) dy = 1;
    if (this.keys['a'] || this.keys['arrowleft']) dx = -1;
    if (this.keys['d'] || this.keys['arrowright']) dx = 1;
    this.moving = dx !== 0 || dy !== 0;
    if (this.moving) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
      this.x += dx * this.speed * dt;
      this.y += dy * this.speed * dt;
      if (dx > 0) this.dir = 2;
      else if (dx < 0) this.dir = 1;
      if (dy < 0) this.dir = 0;
      else if (dy > 0) this.dir = 3;
      this.animTimer += dt;
      if (this.animTimer > 0.15) {
        this.animFrame = (this.animFrame + 1) % 3;
        this.animTimer = 0;
      }
    } else {
      this.animFrame = 0;
      this.animTimer = 0;
    }
    Game.camera.x = this.x - Game.width / 2;
    Game.camera.y = this.y - Game.height / 2;
  },

  render(ctx) {
    const sprite = Game.sprites.player;
    if (!sprite) {
      ctx.fillStyle = '#0f0';
      ctx.fillRect(this.x - 12, this.y - 12, 24, 24);
      return;
    }
    const frameW = 48;
    const frameH = 48;
    const dirOrder = [3, 1, 2, 0];
    const dirRow = dirOrder[this.dir] || 0;
    const animCol = this.moving ? 3 + this.animFrame : this.animFrame;
    const sx = animCol * frameW;
    const sy = dirRow * frameH;
    ctx.drawImage(
      sprite,
      sx, sy, frameW, frameH,
      this.x - frameW / 2, this.y - frameH / 2 + 4, frameW, frameH
    );
  },
};
