const Spawner = {
  elapsedTime: 0,
  timer: 0,
  baseInterval: 2.0,
  minInterval: 0.4,
  decreaseRate: 0.01,
  groupBase: 1,
  groupInterval: 15,

  reset() {
    this.elapsedTime = 0;
    this.timer = 0;
  },

  update(dt) {
    this.elapsedTime += dt;
    this.timer += dt;
    const interval = Math.max(this.minInterval, this.baseInterval - this.elapsedTime * this.decreaseRate);
    if (this.timer < interval) return;
    this.timer -= interval;
    const groupSize = this.groupBase + Math.floor(this.elapsedTime / this.groupInterval);
    for (let i = 0; i < groupSize; i++) {
      let x, y;
      const side = Math.floor(Math.random() * 4);
      const cam = Game.camera;
      const w = Game.width;
      const h = Game.height;
      const margin = Math.max(w, h) * 0.6;
      const spread = Math.max(w, h) * 0.4;
      if (side === 0) {
        x = cam.x + Math.random() * w;
        y = cam.y - margin - Math.random() * spread;
      } else if (side === 1) {
        x = cam.x + w + margin + Math.random() * spread;
        y = cam.y + Math.random() * h;
      } else if (side === 2) {
        x = cam.x + Math.random() * w;
        y = cam.y + h + margin + Math.random() * spread;
      } else {
        x = cam.x - margin - Math.random() * spread;
        y = cam.y + Math.random() * h;
      }
      const difficulty = Math.floor(this.elapsedTime / 8);
      Enemy.list.push(Enemy.create(x, y, difficulty));
    }
  },
};
