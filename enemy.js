const Enemy = {
  list: [],
  spawnTimer: 0,
  spawnInterval: 3,
  baseSpeed: 60,
  baseHp: 3,

  create(x, y, type) {
    return {
      x, y,
      type: type || 'skeleton',
      hp: this.baseHp,
      maxHp: this.baseHp,
      speed: this.baseSpeed,
      width: 48,
      height: 48,
      animFrame: 0,
      animTimer: 0,
      alive: true,
    };
  },

  spawnWave() {
    const margin = 60;
    for (let i = 0; i < 5; i++) {
      let x, y;
      const side = Math.floor(Math.random() * 4);
      const cam = Game.camera;
      const w = Game.width;
      const h = Game.height;
      if (side === 0) {
        x = cam.x + Math.random() * w;
        y = cam.y - margin;
      } else if (side === 1) {
        x = cam.x + w + margin;
        y = cam.y + Math.random() * h;
      } else if (side === 2) {
        x = cam.x + Math.random() * w;
        y = cam.y + h + margin;
      } else {
        x = cam.x - margin;
        y = cam.y + Math.random() * h;
      }
      const type = Math.random() < 0.5 ? 'skeleton' : 'slime';
      this.list.push(this.create(x, y, type));
    }
  },

  updateAll(dt) {
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnWave();
    }
    for (let i = this.list.length - 1; i >= 0; i--) {
      const e = this.list[i];
      if (!e.alive) {
        this.list.splice(i, 1);
        continue;
      }
      const dx = Player.x - e.x;
      const dy = Player.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        e.x += (dx / dist) * e.speed * dt;
        e.y += (dy / dist) * e.speed * dt;
      }
      e.animTimer += dt;
      if (e.animTimer > 0.2) {
        e.animFrame = (e.animFrame + 1) % 3;
        e.animTimer = 0;
      }
    }
  },

  renderAll(ctx) {
    for (const e of this.list) {
      const sprite = e.type === 'skeleton'
        ? Game.sprites.skeleton
        : Game.sprites.slime;
      if (!sprite) {
        ctx.fillStyle = e.type === 'skeleton' ? '#888' : '#0a8';
        ctx.fillRect(e.x - 12, e.y - 12, 24, 24);
        return;
      }
      const frameW = e.type === 'slime' ? 32 : 48;
      const frameH = e.type === 'slime' ? 32 : 48;
      const sy = (3 + e.animFrame) * frameH;
      const sx = 0;
      ctx.drawImage(
        sprite,
        sx, sy, frameW, frameH,
        e.x - frameW / 2, e.y - frameH / 2 + 4, frameW, frameH
      );
    }
  },
};
