const Enemy = {
  list: [],
  xpGems: [],
  pickupParticles: [],
  nukeItems: [],
  rageItems: [],
  coinItems: [],
  chestItems: [],

  aliveCount() {
    var n = 0;
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i].alive) n++;
    }
    return n;
  },

  createBoss: function(x, y) {
    return {
      x: x, y: y, type: 'boss', isBoss: true,
      hp: 2400, maxHp: 2400,
      speed: 40,
      xp: 20,
      width: 64, height: 64,
      dir: 2, animFrame: 0, animTimer: 0,
      alive: true,
      dying: false, deathTimer: 0,
    };
  },

  create(x, y, difficulty, type) {
    type = type || 'slime';
    var timeMins = (typeof Spawner !== 'undefined' ? Spawner.elapsedTime : 0) / 60;
    var hpMul = (1 + difficulty * 0.18) * Math.pow(1.065, timeMins);
    const isElite = Math.random() < 0.15;
    const eliteHpMul = isElite ? 2.5 : 1;
    const eliteSpdMul = isElite ? 1.3 : 1;
    const eliteXpMul = isElite ? 1.5 : 1;
    const eliteSizeMul = isElite ? 1.4 : 1;
    var isBomber = type === 'bomber';
    var speedBonus = Math.min(1.6, 1 + (typeof Spawner !== 'undefined' ? Spawner.elapsedTime : 0) / 3000);
    return {
      x, y, type,
      hp: Math.ceil((isBomber ? 8 : 3) * hpMul * eliteHpMul),
      maxHp: Math.ceil((isBomber ? 8 : 3) * hpMul * eliteHpMul),
      speed: Math.ceil((isBomber ? 35 : 55 + Math.random() * 10) * eliteSpdMul * speedBonus),
      xp: Math.ceil((1 + Math.floor(difficulty / 3)) * eliteXpMul),
      width: Math.ceil((isBomber ? 36 : (type === 'bat' ? 16 : 32)) * eliteSizeMul),
      height: Math.ceil((isBomber ? 36 : (type === 'bat' ? 24 : 32)) * eliteSizeMul),
      dir: 0,
      animFrame: 0,
      animTimer: 0,
      alive: true,
      dying: false, deathTimer: 0,
      isElite: isElite,
      isBomber: isBomber,
    };
  },

  spawnBoss(x, y) {
    var e = this.createBoss(x, y);
    for (var i = 0; i < this.list.length; i++) {
      if (!this.list[i].alive) {
        this.list[i] = e;
        return;
      }
    }
    this.list.push(e);
  },

  spawnXpGem(x, y, value) {
    var MAX_GEMS = 300;
    var alive = 0;
    for (var gi = 0; gi < this.xpGems.length; gi++) {
      if (this.xpGems[gi].alive) alive++;
    }
    if (alive >= MAX_GEMS) {
      var best = -1, bestDist = 2500;
      for (var gi = 0; gi < this.xpGems.length; gi++) {
        if (!this.xpGems[gi].alive) continue;
        var dx = this.xpGems[gi].x - x, dy = this.xpGems[gi].y - y;
        var d = dx * dx + dy * dy;
        if (d < bestDist) { bestDist = d; best = gi; }
      }
      if (best >= 0 && bestDist <= 50 * 50) {
        this.xpGems[best].value += value;
      }
      return;
    }
    var g = { x: x, y: y, value: value, size: 6, bob: 0, alive: true };
    for (var i = 0; i < this.xpGems.length; i++) {
      if (!this.xpGems[i].alive) {
        this.xpGems[i] = g;
        return;
      }
    }
    this.xpGems.push(g);
  },

  spawnNukeItem(x, y) {
    var ni = { x: x, y: y, life: 10, bob: 0, alive: true };
    for (var i = 0; i < this.nukeItems.length; i++) {
      if (!this.nukeItems[i].alive) {
        this.nukeItems[i] = ni;
        return;
      }
    }
    this.nukeItems.push(ni);
  },

  spawnRageItem(x, y) {
    var ri = { x: x, y: y, life: 10, bob: 0, alive: true };
    for (var i = 0; i < this.rageItems.length; i++) {
      if (!this.rageItems[i].alive) {
        this.rageItems[i] = ri;
        return;
      }
    }
    this.rageItems.push(ri);
  },

  spawnCoinItem(x, y, value) {
    var ci = { x: x, y: y, value: value, size: 6, bob: 0, alive: true };
    for (var i = 0; i < this.coinItems.length; i++) {
      if (!this.coinItems[i].alive) {
        this.coinItems[i] = ci;
        return;
      }
    }
    this.coinItems.push(ci);
  },

  spawnChest(x, y) {
    var c = { x: x, y: y, alive: true, bob: 0, opened: false };
    for (var i = 0; i < this.chestItems.length; i++) {
      if (!this.chestItems[i].alive) {
        this.chestItems[i] = c;
        return;
      }
    }
    this.chestItems.push(c);
  },

  spawn(x, y, difficulty, type) {
    var e = this.create(x, y, difficulty, type);
    for (var i = 0; i < this.list.length; i++) {
      if (!this.list[i].alive) {
        this.list[i] = e;
        return;
      }
    }
    this.list.push(e);
  },

  updateAll(dt) {
    for (let i = this.xpGems.length - 1; i >= 0; i--) {
      const g = this.xpGems[i];
      if (!g.alive) continue;
      g.bob += dt * 3;
      const ugx = Game.unwrap(g.x, Player.x);
      const ugy = Game.unwrap(g.y, Player.y);
      const dx = Player.x - ugx;
      const dy = Player.y - ugy;
      if (g._magnet) {
        var md = Math.sqrt(dx * dx + dy * dy);
        if (md < 5) { Player.addXp(g.value); g.alive = false; }
        else { g.x += (dx / md) * 400 * dt; g.y += (dy / md) * 400 * dt; g.x = Game.wrap(g.x); g.y = Game.wrap(g.y); }
        continue;
      }
      const distSq = dx * dx + dy * dy;
      var pickupRadius = 150 + Player.magnet;
      if (distSq < pickupRadius * pickupRadius) {
        if (distSq < 400) {
          Player.addXp(g.value);
          for (var pi = 0; pi < 5; pi++) {
            this.pickupParticles.push({
              x: g.x, y: g.y,
              vx: (Math.random() - 0.5) * 120,
              vy: (Math.random() - 0.5) * 120 - 40,
              life: 0.4, maxLife: 0.4, size: 2 + Math.random() * 2,
            });
          }
          g.alive = false;
          if (typeof Audio !== 'undefined') Audio.play('xp');
        } else {
          var dist = Math.sqrt(distSq);
          var speed = 300 + Player.magnet * 0.5;
          g.x += (dx / dist) * speed * dt;
          g.y += (dy / dist) * speed * dt;
          g.x = Game.wrap(g.x);
          g.y = Game.wrap(g.y);
        }
      }
    }
    var gw = 0;
    for (var gr = 0; gr < this.xpGems.length; gr++) {
      if (this.xpGems[gr].alive) this.xpGems[gw++] = this.xpGems[gr];
    }
    this.xpGems.length = gw;

    for (let i = this.nukeItems.length - 1; i >= 0; i--) {
      var ni = this.nukeItems[i];
      if (!ni.alive) continue;
      ni.life -= dt;
      if (ni.life <= 0) { ni.alive = false; continue; }
      ni.bob += dt * 3;
      var nux = Game.unwrap(ni.x, Player.x);
      var nuy = Game.unwrap(ni.y, Player.y);
      var ndx = Player.x - nux;
      var ndy = Player.y - nuy;
      var ndistSq = ndx * ndx + ndy * ndy;
      var npickupRadius = 150 + Player.magnet;
      if (ndistSq < npickupRadius * npickupRadius) {
        if (ndistSq < 400) {
          Game.triggerNuke();
          ni.alive = false;
        } else {
          var ndist = Math.sqrt(ndistSq);
          var nspeed = 300 + Player.magnet * 0.5;
          ni.x += (ndx / ndist) * nspeed * dt;
          ni.y += (ndy / ndist) * nspeed * dt;
          ni.x = Game.wrap(ni.x);
          ni.y = Game.wrap(ni.y);
        }
      }
    }

    for (let i = this.rageItems.length - 1; i >= 0; i--) {
      var ri = this.rageItems[i];
      if (!ri.alive) continue;
      ri.life -= dt;
      if (ri.life <= 0) { ri.alive = false; continue; }
      ri.bob += dt * 3;
      var rux = Game.unwrap(ri.x, Player.x);
      var ruy = Game.unwrap(ri.y, Player.y);
      var rdx = Player.x - rux;
      var rdy = Player.y - ruy;
      var rdistSq = rdx * rdx + rdy * rdy;
      var rpickupRadius = 150 + Player.magnet;
      if (rdistSq < rpickupRadius * rpickupRadius) {
        if (rdistSq < 400) {
          Game.triggerRage();
          ri.alive = false;
        } else {
          var rdist = Math.sqrt(rdistSq);
          var rspeed = 300 + Player.magnet * 0.5;
          ri.x += (rdx / rdist) * rspeed * dt;
          ri.y += (rdy / rdist) * rspeed * dt;
          ri.x = Game.wrap(ri.x);
          ri.y = Game.wrap(ri.y);
        }
      }
    }

    var nw = 0;
    for (var nr = 0; nr < this.nukeItems.length; nr++) {
      if (this.nukeItems[nr].alive) this.nukeItems[nw++] = this.nukeItems[nr];
    }
    this.nukeItems.length = nw;

    var rw = 0;
    for (var rr = 0; rr < this.rageItems.length; rr++) {
      if (this.rageItems[rr].alive) this.rageItems[rw++] = this.rageItems[rr];
    }
    this.rageItems.length = rw;

    for (let i = this.coinItems.length - 1; i >= 0; i--) {
      var ci = this.coinItems[i];
      if (!ci.alive) continue;
      ci.bob += dt * 3;
      var cux = Game.unwrap(ci.x, Player.x);
      var cuy = Game.unwrap(ci.y, Player.y);
      var cdx = Player.x - cux;
      var cdy = Player.y - cuy;
      var cdistSq = cdx * cdx + cdy * cdy;
      var cpickupRadius = 150 + Player.magnet;
      if (cdistSq < cpickupRadius * cpickupRadius) {
        if (cdistSq < 400) {
          ci.alive = false;
          if (typeof Audio !== 'undefined') Audio.play('coin');
          for (var ci_pi = 0; ci_pi < 5; ci_pi++) {
            this.pickupParticles.push({
              x: ci.x, y: ci.y,
              vx: (Math.random() - 0.5) * 120,
              vy: (Math.random() - 0.5) * 120 - 40,
              life: 0.4, maxLife: 0.4, size: 2 + Math.random() * 2,
            });
          }
        } else {
          var cdist = Math.sqrt(cdistSq);
          var cspeed = 300 + Player.magnet * 0.5;
          ci.x += (cdx / cdist) * cspeed * dt;
          ci.y += (cdy / cdist) * cspeed * dt;
          ci.x = Game.wrap(ci.x);
          ci.y = Game.wrap(ci.y);
        }
      }
    }
    var cw = 0;
    for (var cr = 0; cr < this.coinItems.length; cr++) {
      if (this.coinItems[cr].alive) this.coinItems[cw++] = this.coinItems[cr];
    }
    this.coinItems.length = cw;

    for (var pi = this.pickupParticles.length - 1; pi >= 0; pi--) {
      var p = this.pickupParticles[pi];
      p.life -= dt;
      if (p.life <= 0) {
        this.pickupParticles[pi] = this.pickupParticles[this.pickupParticles.length - 1];
        this.pickupParticles.pop();
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 200 * dt;
    }
    for (let i = this.list.length - 1; i >= 0; i--) {
      const e = this.list[i];
      if (!e.alive) continue;
      if (e.dying) {
        e.deathTimer -= dt;
        if (e.deathTimer <= 0) {
          e.alive = false;
          Player.kills++;
          if (typeof Audio !== 'undefined') Audio.play(e.isBoss ? 'explosion' : 'hit');
          var xpMul = (typeof Spawner !== 'undefined' && Spawner._xpMul) || 1;
          Enemy.spawnXpGem(e.x, e.y, Math.ceil(e.xp * xpMul));
          if (Math.random() < 0.0005) { Enemy.spawnNukeItem(e.x, e.y); }
          if (Math.random() < 0.0002) { Enemy.spawnRageItem(e.x, e.y); }
          if (e.isBoss) {
            var cv = 5;
            Player.coinsEarned = (Player.coinsEarned || 0) + cv;
            Enemy.spawnCoinItem(e.x, e.y, cv);
            Enemy.spawnChest(e.x, e.y);
          } else if (Math.random() < 0.2) {
            var cv = Math.random() < 0.1 ? 3 : 1;
            Player.coinsEarned = (Player.coinsEarned || 0) + cv;
            Enemy.spawnCoinItem(e.x, e.y, cv);
          }
          // Bomber explosion
          if (e.isBomber) {
            for (var be = 0; be < Enemy.list.length; be++) {
              var other = Enemy.list[be];
              if (other === e || !other.alive || other.dying) continue;
              var bex = Game.unwrap(other.x, e.x);
              var bey = Game.unwrap(other.y, e.y);
              var bdx = e.x - bex, bdy = e.y - bey;
              if (bdx * bdx + bdy * bdy < 80 * 80) {
                other.dying = true;
                other.deathTimer = 0.4;
              }
            }
            var pex = Game.unwrap(Player.x, e.x);
            var pey = Game.unwrap(Player.y, e.y);
            var pdx = e.x - pex, pdy = e.y - pey;
            if (pdx * pdx + pdy * pdy < 80 * 80) {
              Player.takeDamage(3);
            }
          }
        }
        continue;
      }
      const uex = Game.unwrap(e.x, Player.x);
      const uey = Game.unwrap(e.y, Player.y);
      const dx = Player.x - uex;
      const dy = Player.y - uey;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        var speedMul = (typeof Spawner !== 'undefined' && Spawner._speedMul) || 1;
        e.x += (dx / dist) * e.speed * dt * speedMul;
        e.y += (dy / dist) * e.speed * dt * speedMul;
        e.x = Game.wrap(e.x);
        e.y = Game.wrap(e.y);
        if (Math.abs(dy) > Math.abs(dx)) {
          e.dir = dy < 0 ? 0 : 3;
        } else {
          e.dir = dx < 0 ? 1 : 2;
        }
      }
      e.animTimer += dt;
      if (e.isBoss) {
        if (e.animTimer > 0.15) { e.animFrame = (e.animFrame + 1) % 8; e.animTimer = 0; }
      } else {
        if (e.animTimer > 0.12) { e.animFrame = (e.animFrame + 1) % 5; e.animTimer = 0; }
      }
    }
    var ew = 0;
    for (var er = 0; er < this.list.length; er++) {
      if (this.list[er].alive) {
        var ecx = Game.unwrap(this.list[er].x, Player.x);
        var ecy = Game.unwrap(this.list[er].y, Player.y);
        var edx = Player.x - ecx, edy = Player.y - ecy;
        if (edx * edx + edy * edy > 2000 * 2000) {
          this.list[er].alive = false;
        }
      }
      if (this.list[er].alive) this.list[ew++] = this.list[er];
    }
    this.list.length = ew;

    // Chest update
    for (let ci = this.chestItems.length - 1; ci >= 0; ci--) {
      var ch = this.chestItems[ci];
      if (!ch.alive) continue;
      ch.bob += dt * 3;
      var crx = Game.unwrap(ch.x, Player.x);
      var cry = Game.unwrap(ch.y, Player.y);
      var cdx = Player.x - crx, cdy = Player.y - cry;
      if (cdx * cdx + cdy * cdy < 30 * 30) {
        ch.alive = false;
        if (typeof Audio !== 'undefined') Audio.play('levelUp');
        Game.state = 'LEVELING';
        UI.showUpgrades();
      }
    }
    var cw2 = 0;
    for (var cr2 = 0; cr2 < this.chestItems.length; cr2++) {
      if (this.chestItems[cr2].alive) this.chestItems[cw2++] = this.chestItems[cr2];
    }
    this.chestItems.length = cw2;
  },

  renderXpGems(ctx) {
    for (const g of this.xpGems) {
      if (!g.alive) continue;
      var rx = Game.unwrap(g.x, Player.x);
      var ry = Game.unwrap(g.y, Player.y);
      var bob = Math.sin(g.bob) * 2;
      ctx.fillStyle = 'rgba(50, 255, 100, 0.8)';
      ctx.beginPath();
      ctx.arc(rx, ry + bob, g.size + 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(180, 255, 180, 0.6)';
      ctx.beginPath();
      ctx.arc(rx - 1, ry - 1 + bob, g.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    for (var pi = 0; pi < this.pickupParticles.length; pi++) {
      var p = this.pickupParticles[pi];
      var palpha = p.life / p.maxLife;
      ctx.fillStyle = 'rgba(180, 255, 100, ' + palpha + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * palpha, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  renderNukeItems: function(ctx) {
    for (var i = 0; i < this.nukeItems.length; i++) {
      var ni = this.nukeItems[i];
      if (!ni.alive) continue;
      var rx = Game.unwrap(ni.x, Player.x);
      var ry = Game.unwrap(ni.y, Player.y);
      var bob = Math.sin(ni.bob) * 2;
      ctx.save();
      ctx.translate(rx - ni.x, ry - ni.y);
      ctx.fillStyle = 'rgba(50, 100, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(ni.x, ni.y + bob, 12, 0, Math.PI * 2);
      ctx.fill();
      var sprite = Game.sprites.nuke;
      if (sprite && sprite.width > 0) {
        ctx.drawImage(sprite, ni.x - 16, ni.y - 16 + bob, 32, 32);
      } else {
        ctx.fillStyle = '#4488ff';
        ctx.beginPath();
        ctx.moveTo(ni.x, ni.y - 10 + bob);
        ctx.lineTo(ni.x + 8, ni.y + bob);
        ctx.lineTo(ni.x, ni.y + 10 + bob);
        ctx.lineTo(ni.x - 8, ni.y + bob);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  },

  renderRageItems: function(ctx) {
    for (var i = 0; i < this.rageItems.length; i++) {
      var ri = this.rageItems[i];
      if (!ri.alive) continue;
      var rx = Game.unwrap(ri.x, Player.x);
      var ry = Game.unwrap(ri.y, Player.y);
      var bob = Math.sin(ri.bob) * 2;
      ctx.save();
      ctx.translate(rx - ri.x, ry - ri.y);
      ctx.fillStyle = 'rgba(255, 50, 50, 0.25)';
      ctx.beginPath();
      ctx.arc(ri.x, ri.y + bob, 12, 0, Math.PI * 2);
      ctx.fill();
      var sprite = Game.sprites.rage;
      if (sprite && sprite.width > 0) {
        ctx.drawImage(sprite, ri.x - 16, ri.y - 16 + bob, 32, 32);
      } else {
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.moveTo(ri.x, ri.y - 10 + bob);
        ctx.lineTo(ri.x + 8, ri.y + bob);
        ctx.lineTo(ri.x, ri.y + 10 + bob);
        ctx.lineTo(ri.x - 8, ri.y + bob);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  },

  renderCoinItems: function(ctx) {
    for (var i = 0; i < this.coinItems.length; i++) {
      var ci = this.coinItems[i];
      if (!ci.alive) continue;
      var rx = Game.unwrap(ci.x, Player.x);
      var ry = Game.unwrap(ci.y, Player.y);
      var bob = Math.sin(ci.bob) * 2;
      ctx.save();
      ctx.translate(rx - ci.x, ry - ci.y);
      ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(ci.x, ci.y + bob, 10, 0, Math.PI * 2);
      ctx.fill();
      var sprite = Game.sprites.coin;
      if (sprite && sprite.width > 0) {
        ctx.drawImage(sprite, ci.x - 8, ci.y - 8 + bob, 16, 16);
      } else {
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(ci.x, ci.y + bob, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#daa520';
        ctx.beginPath();
        ctx.arc(ci.x, ci.y + bob, 5, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  },

  renderChestItems: function(ctx) {
    for (var i = 0; i < this.chestItems.length; i++) {
      var ch = this.chestItems[i];
      if (!ch.alive) continue;
      var rx = Game.unwrap(ch.x, Player.x);
      var ry = Game.unwrap(ch.y, Player.y);
      var bob = Math.sin(ch.bob) * 3;
      // Glow
      ctx.fillStyle = 'rgba(255, 200, 50, 0.15)';
      ctx.beginPath();
      ctx.arc(rx, ry + bob, 14, 0, Math.PI * 2);
      ctx.fill();
      // Chest body
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(rx - 8, ry - 6 + bob, 16, 12);
      ctx.fillStyle = '#DAA520';
      ctx.fillRect(rx - 4, ry - 4 + bob, 8, 3);
      ctx.fillRect(rx - 2, ry + 1 + bob, 4, 2);
      // Sparkle
      ctx.fillStyle = 'rgba(255, 215, 0, ' + (0.5 + Math.sin(ch.bob * 2) * 0.3) + ')';
      ctx.beginPath();
      ctx.arc(rx + 6, ry - 4 + bob, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  renderAll(ctx) {
    for (const e of this.list) {
      if (!e.alive && !e.dying) continue;
      var rx = Game.unwrap(e.x, Player.x);
      var ry = Game.unwrap(e.y, Player.y);
      ctx.save();
      ctx.translate(rx - e.x, ry - e.y);
      if (e.isBomber) {
        ctx.fillStyle = 'rgba(255, 50, 50, ' + (0.2 + Math.sin(e.animTimer * 8) * 0.1) + ')';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.width * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      if (e.isBoss) {
        this._renderBoss(ctx, e);
      } else if (e.type === 'bat') {
        this._renderBat(ctx, e);
      } else {
        this._renderSlime(ctx, e);
      }
      ctx.restore();
    }
  },

  _renderSlime(ctx, e) {
    if (e.dying) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, e.deathTimer / 0.4);
    }
    const sprite = Game.sprites.slime;
    if (!sprite || sprite.width === 0) {
      ctx.fillStyle = '#0a8';
      ctx.fillRect(e.x - 12, e.y - 12, 24, 24);
      if (e.dying) ctx.restore();
      return;
    }
    if (e.isElite) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.width * 0.75, 0, Math.PI * 2);
      ctx.fill();
    }
    const gs = 32;
    let row, flipped = false;
    if (!e.alive) {
      row = 12;
    } else {
      switch (e.dir) {
        case 0: row = 5; break;
        case 1: row = 4; flipped = true; break;
        case 2: row = 4; break;
        case 3: row = 6; break;
        default: row = 0;
      }
    }
    const col = e.animFrame;
    ctx.save();
    if (flipped) {
      ctx.translate(e.x, e.y);
      ctx.scale(-1, 1);
      ctx.drawImage(sprite, col * gs, row * gs, gs, gs, -gs / 2, -gs / 2, gs, gs);
    } else {
      ctx.drawImage(sprite, col * gs, row * gs, gs, gs, e.x - gs / 2, e.y - gs / 2, gs, gs);
    }
    ctx.restore();
    if (e.isElite) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★', e.x, e.y - e.height * 0.5 - 4);
    }
    if (e.dying) ctx.restore();
  },

  _renderBat(ctx, e) {
    if (e.dying) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, e.deathTimer / 0.4);
    }
    const sprite = Game.sprites.bat;
    if (!sprite || sprite.width === 0) {
      ctx.fillStyle = '#a0a';
      ctx.fillRect(e.x - 8, e.y - 12, 16, 24);
      return;
    }
    if (e.isElite) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.width * 0.75, 0, Math.PI * 2);
      ctx.fill();
    }
    const fw = 16, fh = 24;
    var row = e.alive ? 0 : 2;
    var col = e.alive ? e.animFrame : 0;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprite, col * fw, row * fh, fw, fh, e.x - fw / 2, e.y - fh / 2, fw, fh);
    ctx.imageSmoothingEnabled = true;
    ctx.restore();
    if (e.isElite) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★', e.x, e.y - e.height * 0.5 - 4);
    }
    if (e.dying) ctx.restore();
  },

  _renderBoss: function(ctx, e) {
    if (e.dying) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, e.deathTimer / 0.4);
    }
    const sprite = Game.sprites.boss;
    if (!sprite || sprite.width === 0) {
      ctx.fillStyle = '#c00';
      ctx.fillRect(e.x - 24, e.y - 24, 48, 48);
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText('BOSS', e.x - 16, e.y);
      if (e.dying) ctx.restore();
      return;
    }
    const fw = 64, fh = 64;
    var col = e.animFrame;
    var row = 0;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprite, col * fw, row * fh, fw, fh, e.x - fw / 2, e.y - fh / 2, fw, fh);
    ctx.imageSmoothingEnabled = true;
    // HP bar
    var barW = 52, barH = 6;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(e.x - barW / 2, e.y - fh / 2 - 10, barW, barH);
    ctx.fillStyle = '#e22';
    ctx.fillRect(e.x - barW / 2 + 1, e.y - fh / 2 - 9, (barW - 2) * (e.hp / e.maxHp), barH - 2);
    ctx.restore();
    if (e.dying) ctx.restore();
  },
};
