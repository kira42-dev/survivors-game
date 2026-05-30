const Weapon = {
  projectiles: [],
  fireTimer: 0,
  fireInterval: 0.8,
  damage: 1,
  speed: 400,
  range: 400,

  update(dt) {
    this.fireTimer += dt;
    if (this.fireTimer >= this.fireInterval) {
      this.fireTimer = 0;
      this.fire();
    }
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.distTraveled += Math.sqrt(p.vx * p.vx + p.vy * p.vy) * dt;
      if (p.distTraveled >= this.range) {
        this.projectiles.splice(i, 1);
        continue;
      }
      let hit = false;
      for (const e of Enemy.list) {
        if (!e.alive) continue;
        const dx = p.x - e.x;
        const dy = p.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 24) {
          e.hp -= this.damage;
          if (e.hp <= 0) e.alive = false;
          hit = true;
          break;
        }
      }
      if (hit) this.projectiles.splice(i, 1);
    }
  },

  fire() {
    let closest = null;
    let closestDist = Infinity;
    for (const e of Enemy.list) {
      if (!e.alive) continue;
      const dx = e.x - Player.x;
      const dy = e.y - Player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.range && dist < closestDist) {
        closestDist = dist;
        closest = e;
      }
    }
    if (!closest) return;
    const dx = closest.x - Player.x;
    const dy = closest.y - Player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.projectiles.push({
      x: Player.x,
      y: Player.y,
      vx: (dx / dist) * this.speed,
      vy: (dy / dist) * this.speed,
      distTraveled: 0,
    });
  },

  renderAll(ctx) {
    ctx.fillStyle = '#ff0';
    for (const p of this.projectiles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};
