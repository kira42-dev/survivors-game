const Game = {
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,
  camera: { x: 0, y: 0 },
  mapSize: 3000,
  state: 'LOADING',
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

  loadAssets(callback) {
    const assets = {
      player: 'assets/sprites/characters/player.png',
      skeleton: 'assets/sprites/characters/skeleton.png',
      skeleton_swordless: 'assets/sprites/characters/skeleton_swordless.png',
      slime: 'assets/sprites/characters/slime.png',
      plains: 'assets/sprites/tilesets/plains.png',
      objects: 'assets/sprites/tilesets/objects.png',
    };
    let loaded = 0;
    const total = Object.keys(assets).length;
    for (const [key, src] of Object.entries(assets)) {
      const img = new Image();
      img.onload = () => {
        loaded++;
        if (loaded >= total) callback();
      };
      img.onerror = () => {
        loaded++;
        if (loaded >= total) callback();
      };
      img.src = src;
      this.sprites[key] = img;
    }
  },

  start() {
    this.state = 'PLAYING';
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
    Player.x = 1000;
    Player.y = 1000;
    Player.hp = Player.maxHp;
    Player.xp = 0;
    Player.level = 1;
    Player.kills = 0;
    Player.xpToNext = 10;
    Player.stats.damage = 1;
    Player.stats.attackSpeed = 0.8;
    Player.stats.range = 400;
    Player.stats.projectileCount = 1;
    Player.stats.speed = 200;
    Player.stats.maxHp = 10;
    Player.maxHp = 10;
    Enemy.list = [];
    Enemy.xpGems = [];
    Enemy.spawnTimer = 0;
    Enemy.totalSpawned = 0;
    Weapon.projectiles = [];
    Weapon.fireTimer = 0;
    UI.reset();
    this.state = 'PLAYING';
  },

  update(dt) {
    if (this.state !== 'PLAYING') return;
    Player.update(dt);
    Enemy.updateAll(dt);
    Weapon.update(dt);
    for (const e of Enemy.list) {
      if (!e.alive) continue;
      const dx = Player.x - e.x;
      const dy = Player.y - e.y;
      const threshold = e.type === 'slime' ? 16 : 20;
      if (dx * dx + dy * dy < threshold * threshold) {
        Player.takeDamage(1);
        e.alive = false;
      }
    }
  },

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    if (this.state === 'LOADING') {
      ctx.fillStyle = '#fff';
      ctx.font = '24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Loading...', this.width / 2, this.height / 2);
      return;
    }
    ctx.save();
    ctx.translate(Math.round(-this.camera.x), Math.round(-this.camera.y));
    this.renderMap(ctx);
    Enemy.renderAll(ctx);
    Weapon.renderAll(ctx);
    Enemy.renderXpGems(ctx);
    Player.render(ctx);
    ctx.restore();
    UI.render(ctx);
  },

  renderMap(ctx) {
    const plains = this.sprites.plains;
    if (!plains) return;
    const tileSize = 16;
    const tilesPerRow = Math.floor(plains.width / tileSize);
    const tilesPerCol = Math.floor(plains.height / tileSize);
    const mapExtent = this.mapSize;
    const startX = Math.max(0, Math.floor((this.camera.x) / tileSize) * tileSize);
    const startY = Math.max(0, Math.floor((this.camera.y) / tileSize) * tileSize);
    const endX = Math.min(mapExtent, this.camera.x + this.width + tileSize);
    const endY = Math.min(mapExtent, this.camera.y + this.height + tileSize);
    for (let y = startY; y < endY; y += tileSize) {
      for (let x = startX; x < endX; x += tileSize) {
        const tx = (Math.floor(x / tileSize) + Math.floor(y / tileSize) * 7) % tilesPerRow;
        const ty = (Math.floor(y / tileSize) * 3 + Math.floor(x / tileSize) * 11) % tilesPerCol;
        ctx.drawImage(
          plains,
          tx * tileSize, ty * tileSize, tileSize, tileSize,
          x, y, tileSize, tileSize
        );
      }
    }
  },
};
