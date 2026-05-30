const Game = {
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,
  camera: { x: 0, y: 0 },
  mapSize: 3000,
  state: 'PLAYING',
  sprites: {},
  lastTime: 0,
  accumulator: 0,
  fixedDt: 1 / 60,

  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  },

  loadAssets() {
    const assets = {
      plains: 'assets/sprites/tilesets/grass.png',
      player: 'assets/sprites/characters/player.png',
      slime: 'assets/sprites/characters/slime.png',
    };
    for (const [key, src] of Object.entries(assets)) {
      const img = new Image();
      img.src = src;
      this.sprites[key] = img;
    }
  },

  start() {
    this.camera.x = Player.x - this.width / 2;
    this.camera.y = Player.y - this.height / 2;
    WeaponManager.reset();
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  },

  loop(time) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;
    this.accumulator += dt;
    while (this.accumulator >= this.fixedDt) {
      this.update(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }
    this.render();
    requestAnimationFrame((t) => this.loop(t));
  },

  reset() {
    Player.dead = false;
    Player.xp = 0;
    Player.level = 1;
    Player.kills = 0;
    Player.xpToNext = 10;
    Player.moveSpeed = 1;
    Player.power = 1;
    Player.cooldown = 1;
    Player.area = 1;
    Player.speed = 1;
    Player.duration = 1;
    Player.amount = 0;
    Player.luck = 1;
    Player.magnet = 0;
    Player.growth = 1;
    Player.armor = 0;
    Player.regen = 0;
    Player.maxHp = 10;
    Player.hp = Player.maxHp;
    Player.x = 1500;
    Player.y = 1500;
    Enemy.list = [];
    Enemy.xpGems = [];
    Spawner.reset();
    WeaponManager.reset();
    PassiveManager.reset();
    UI.reset();
    this.state = 'PLAYING';
  },

  update(dt) {
    if (this.state !== 'PLAYING') return;
    Player.update(dt);
    Spawner.update(dt);
    Enemy.updateAll(dt);
    WeaponManager.update(dt);
    UI.gameTime += dt;

    // Regen tick every 5s
    UI._regenTimer = (UI._regenTimer || 0) + dt;
    if (UI._regenTimer >= 5) {
      UI._regenTimer -= 5;
      var regenAmt = Player.regen;
      if (regenAmt > 0 && Player.hp < Player.maxHp) {
        Player.hp = Math.min(Player.maxHp, Player.hp + Math.max(1, Math.ceil(regenAmt)));
      }
    }

    // Enemy contact damage with armor reduction
    for (const e of Enemy.list) {
      if (!e.alive) continue;
      const dx = Player.x - e.x;
      const dy = Player.y - e.y;
      const threshold = 16;
      if (dx * dx + dy * dy < threshold * threshold) {
        var dmg = 1;
        // Armor gives chance to block
        if (Player.armor > 0 && Math.random() < Player.armor * 0.15) {
          dmg = 0;
        }
        if (dmg > 0) Player.takeDamage(dmg);
        e.alive = false;
      }
    }
  },

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);
    this.renderMap(ctx);
    Enemy.renderAll(ctx);
    WeaponManager.render(ctx);
    Enemy.renderXpGems(ctx);
    Player.render(ctx);
    ctx.restore();
    UI.render(ctx);
  },

  renderMap(ctx) {
    const grass = this.sprites.plains;
    if (!grass || grass.width === 0) return;
    const ts = 16;
    const sx = Math.max(0, Math.floor(this.camera.x / ts) * ts);
    const sy = Math.max(0, Math.floor(this.camera.y / ts) * ts);
    const ex = Math.min(this.mapSize, this.camera.x + this.width + ts);
    const ey = Math.min(this.mapSize, this.camera.y + this.height + ts);
    for (let y = sy; y < ey; y += ts)
      for (let x = sx; x < ex; x += ts)
        ctx.drawImage(grass, 0, 0, ts, ts, x, y, ts, ts);
  },
};
