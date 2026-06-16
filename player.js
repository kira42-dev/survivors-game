const Player = {
  x: 1500,
  y: 1500,
  moveSpeed: 1,
  maxHp: 10,
  hp: 10,
  xp: 0,
  xpToNext: 10,
  level: 1,
  kills: 0,
  dir: 0,
  power: 1,
  cooldown: 0.667,
  area: 1,
  speed: 1,
  duration: 1,
  amount: 0,

  magnet: 0,
  growth: 1,
  xpDiscount: 0,
  armor: 0,
  regen: 0,
  vampChance: 0,
  invuln: false,
  animFrame: 0,
  animTimer: 0,
  moving: false,
  dead: false,
  keys: {},

  init() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key.startsWith('Arrow')) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
    window.addEventListener('blur', () => {
      this.keys = {};
    });
  },

  update(dt) {
    if (this.dead) return;
    let dx = 0, dy = 0;
    if (this.keys['w'] || this.keys['arrowup']) dy = -1;
    if (this.keys['s'] || this.keys['arrowdown']) dy = 1;
    if (this.keys['a'] || this.keys['arrowleft']) dx = -1;
    if (this.keys['d'] || this.keys['arrowright']) dx = 1;
    if (Touch && Touch.active) {
      dx = Touch.dx;
      dy = Touch.dy;
    }
    this.moving = dx !== 0 || dy !== 0;
    if (this.moving) {
      const len = Math.sqrt(dx * dx + dy * dy);
       dx /= len;
       dy /= len;
       this.x += dx * 200 * this.moveSpeed * dt;
       this.y += dy * 200 * this.moveSpeed * dt;
      if (dy < 0) this.dir = 0;
      else if (dy > 0) this.dir = 3;
      if (dx > 0) this.dir = 2;
      else if (dx < 0) this.dir = 1;
      this.animTimer += dt;
      if (this.animTimer > 0.12) {
        this.animFrame = (this.animFrame + 1) % 5;
        this.animTimer = 0;
      }
    } else {
      this.animTimer += dt;
      if (this.animTimer > 0.25) {
        this.animFrame = (this.animFrame + 1) % 5;
        this.animTimer = 0;
      }
    }
    Game.camera.x = this.x - Game.width / 2;
    Game.camera.y = this.y - Game.height / 2;
  },

  render(ctx) {
    const sprite = Game.sprites.player;
    if (!sprite || sprite.width === 0) {
      ctx.fillStyle = '#0f0';
      ctx.fillRect(this.x - 12, this.y - 12, 24, 24);
      return;
    }
    // Level glow
    if (this.level >= 15) {
      var pulse = 0.12 + Math.sin(performance.now() / 400) * 0.06;
      ctx.fillStyle = this.level > 25 ? 'rgba(255, 170, 0, ' + pulse + ')' : 'rgba(68, 136, 255, ' + pulse + ')';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.level > 25 ? 40 : 28, 0, Math.PI * 2);
      ctx.fill();
    }
    const fw = 48, fh = 48;
    let row, flipped = false;

    if (this.dead) {
      row = 9;
    } else if (this.moving) {
      switch (this.dir) {
        case 0: row = 5; break;
        case 1: row = 4; flipped = true; break;
        case 2: row = 4; break;
        case 3: row = 3; break;
      }
    } else {
      row = 0;
    }

    const col = this.animFrame;
    ctx.save();
    if (flipped) {
      ctx.translate(this.x, this.y);
      ctx.scale(-1, 1);
      ctx.drawImage(sprite, col * fw, row * fh, fw, fh, -fw / 2, -fh / 2, fw, fh);
    } else {
      ctx.drawImage(sprite, col * fw, row * fh, fw, fh, this.x - fw / 2, this.y - fh / 2, fw, fh);
    }
    ctx.restore();
  },

  addXp(amount) {
    var needed = Math.ceil(this.xpToNext * (1 - this.xpDiscount));
    this.xp += amount;
    if (this.xp >= needed) {
      this.xp -= needed;
      this.level++;
      this.xpToNext = Math.floor(this.xpToNext * 1.4);
      Game.state = 'LEVELING';
      UI.showUpgrades();
      if (typeof Audio !== 'undefined') Audio.play('levelUp');
    }
  },

  takeDamage(amount) {
    if (this.invuln) return;
    if (typeof Audio !== 'undefined') Audio.play('hit');
    this.hp -= amount;
    if (this.hp <= 0) {
      if (this._revives > 0) {
        this._revives--;
        this.hp = Math.ceil(this.maxHp / 2);
        this.invuln = true;
        setTimeout(function() { if (Player) Player.invuln = false; }, 2000);
        return;
      }
      this.hp = 0;
      this.dead = true;
      Game.state = 'GAME_OVER';
      UI.showGameOver();
    }
  },

  adRevive() {
    this.dead = false;
    this.hp = Math.ceil(this.maxHp / 2);
    this.invuln = true;
    setTimeout(() => { if (Player) Player.invuln = false; }, 2000);
    Game.state = 'PLAYING';
    var gp = document.getElementById('gameplayMusic');
    if (gp) { gp.currentTime = 0; gp.play(); }
  },
};
