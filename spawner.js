const Spawner = {
  elapsedTime: 0,
  timer: 0,
  baseInterval: 0.8,
  minInterval: 0.3,
  decreaseRate: 0.006,
  groupBase: 3,
  groupInterval: 16,
  bossTimer: 0,
  bossInterval: 30,
  _lastWaveMinute: -1,
  rageMul: 1,
  enemyCycleTime: 0,
  _tutorial1: false,
  _tutorial2: false,
  _milestone3: false,
  _milestone5: false,
  _milestone10: false,
  _milestone15: false,
  _speedMul: 1,
  _xpMul: 1,
  _nightMode: false,
  _chestTimer: 0,

  getEnemyType: function(t) {
    var minute = Math.floor(t / 60);
    if (minute < 2) return 'slime';
    var roll = Math.random();
    if (minute < 5) return roll < 0.5 ? 'slime' : 'bat';
    if (roll < 0.35) return 'slime';
    if (roll < 0.65) return 'bat';
    return 'bomber';
  },

  reset() {
    this.elapsedTime = 0;
    this.timer = this.baseInterval;
    this.bossTimer = 0;
    this.rageMul = 1;
    this._lastWaveMinute = -1;
    this._tutorial1 = false;
    this._tutorial2 = false;
    this._milestone3 = false;
    this._milestone5 = false;
    this._milestone10 = false;
    this._milestone15 = false;
    this._speedMul = 1;
    this._xpMul = 1;
    this._nightMode = false;
    this._chestTimer = 0;
  },

  update(dt) {
    this.elapsedTime += dt;
    this.enemyCycleTime = this.elapsedTime;

    // Tutorial messages
    if (!this._tutorial1 && this.elapsedTime >= 0.5) {
      this._tutorial1 = true;
      UI.showMessage('Двигайся! Оружие стреляет само.', 4);
    }
    if (!this._tutorial2 && this.elapsedTime > 8) {
      this._tutorial2 = true;
      UI.showMessage('Собирай зелёные кристаллы — это опыт!', 3);
    }

    var currentMinute = Math.floor(this.elapsedTime / 60);
    if (currentMinute !== this._lastWaveMinute) {
      this._lastWaveMinute = currentMinute;
      var typeName = this.getEnemyType(this.elapsedTime) === 'slime' ? 'Слаймы' : 'Летучие мыши';
      var phase = currentMinute % 3;
      var waveName = phase === 0 ? 'СЛАЙМЫ' : phase === 1 ? 'СМЕШАННАЯ ВОЛНА' : 'БОМБЕРЫ';
      UI.showMessage('Волна ' + (currentMinute + 1) + ': ' + waveName, 2.5);

      // Milestone events
      if (currentMinute === 3 && !this._milestone3) {
        this._milestone3 = true;
        UI.showMessage('🌲 Лес просыпается...', 3);
        this._speedMul = 1.2;
      }
      if (currentMinute === 5 && !this._milestone5) {
        this._milestone5 = true;
        UI.showMessage('⚔️ Два босса!', 3);
        var bx1 = Player.x + (Math.random() - 0.5) * 600;
        var by1 = Player.y + (Math.random() - 0.5) * 600;
        var bx2 = Player.x + (Math.random() - 0.5) * 600;
        var by2 = Player.y + (Math.random() - 0.5) * 600;
        Enemy.spawnBoss(bx1, by1);
        Enemy.spawnBoss(bx2, by2);
        if (typeof Audio !== 'undefined') Audio.play('boss');
      }
      if (currentMinute === 10 && !this._milestone10) {
        this._milestone10 = true;
        UI.showMessage('🌙 НОЧЬ... опыт ×2!', 3);
        this._nightMode = true;
        this._xpMul = 2;
        this._speedMul = 1.5;
      }
      if (currentMinute === 15 && !this._milestone15) {
        this._milestone15 = true;
        UI.showMessage('☀️ РАССВЕТ!', 3);
        this._nightMode = false;
        this._xpMul = 1;
        this._speedMul = 1;
        var cx = Player.x + (Math.random() - 0.5) * 300;
        var cy = Player.y + (Math.random() - 0.5) * 300;
        Enemy.spawnChest(cx, cy);
      }
    }

    // Boss spawn (runs independently of regular spawn timer)
    this.bossTimer += dt;
    if (this.bossTimer >= this.bossInterval) {
      this.bossTimer = 0;
      var hasBoss = false;
      for (var bi = 0; bi < Enemy.list.length; bi++) {
        if (Enemy.list[bi].isBoss && Enemy.list[bi].alive) { hasBoss = true; break; }
      }
      if (!hasBoss) {
        var bx = Player.x + (Math.random() - 0.5) * 600;
        var by = Player.y + (Math.random() - 0.5) * 600;
        Enemy.spawnBoss(bx, by);
        if (typeof Audio !== 'undefined') Audio.play('boss');
        UI.showMessage('BOSS APPEARS!', 3);
      }
    }

    // Chest spawn every 2 minutes
    this._chestTimer += dt;
    if (this._chestTimer >= 120) {
      this._chestTimer = 0;
      var cxc = Player.x + (Math.random() - 0.5) * 400;
      var cyc = Player.y + (Math.random() - 0.5) * 400;
      Enemy.spawnChest(cxc, cyc);
      UI.showMessage('💰 Сундук появился на карте!', 3);
    }

    this.timer += dt * this.rageMul;
    var t = this.elapsedTime;
    var interval = Math.max(this.minInterval, this.baseInterval - t * this.decreaseRate);
    if (t > 300) interval = Math.max(this.minInterval, interval - (t - 300) * 0.001);
    if (this.timer < interval) return;
    this.timer -= interval;
    var ENEMY_LIMIT = t < 180 ? 300 : t < 600 ? 600 : 840;
    if (Enemy.aliveCount() >= ENEMY_LIMIT) return;
    var maxGroup = t < 120 ? 9 : t < 300 ? 18 : t < 600 ? 30 : 42;
    var groupSize = Math.min(maxGroup, this.groupBase + Math.floor(t / this.groupInterval));
    for (let i = 0; i < groupSize; i++) {
      let x, y;
      var attempts = 0;
      do {
        const side = Math.floor(Math.random() * 4);
        const cam = Game.camera;
        const w = Game.width / Game.zoom;
        const h = Game.height / Game.zoom;
        const margin = 0;
        const spread = 48;
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
        attempts++;
      } while (attempts < 10 && (x - Player.x) * (x - Player.x) + (y - Player.y) * (y - Player.y) < 300 * 300);
      const timeDiff = Math.floor(this.elapsedTime / 6);
      const levelDiff = Math.floor(Player.level * 0.35);
      const difficulty = timeDiff + levelDiff;
      var type = Spawner.getEnemyType(this.elapsedTime);
      Enemy.spawn(x, y, difficulty, type);
    }
  },
};
