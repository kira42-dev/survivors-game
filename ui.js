const UI = {
  gameTime: 0,
  statsCache: null,
  message: null,
  messageTimer: 0,

  showMessage: function(text, duration) {
    this.message = text;
    this.messageTimer = duration || 2;
  },

  showChestBonus() {
    const overlay = document.getElementById('upgradeOverlay');
    if (!overlay) return;
    overlay.innerHTML = `<div class="upgrade-title">СУНДУК</div>
      <div style="color:#aaa;margin-bottom:20px;font-size:16px;">+1 уровень бесплатно и бонус за рекламу</div>
      <button class="restart-btn" id="chestAdBtn" style="background:#2a6;border-color:#4f8;">+5 МОНЕТ (реклама)</button>
      <button class="restart-btn" id="chestSkipBtn">ЗАБРАТЬ</button>`;
    overlay.style.display = 'flex';
    document.getElementById('chestAdBtn').addEventListener('click', () => {
      if (typeof Audio !== 'undefined') Audio.play('click');
      if (typeof YandexSDK !== 'undefined' && YandexSDK.ready) {
        YandexSDK.showRewarded(function(success) {
          if (success) {
            Player.coinsEarned = (Player.coinsEarned || 0) + 5;
            UI.showMessage('+5 монет!', 2);
          }
          UI._applyChestLevel();
        });
      } else {
        Player.coinsEarned = (Player.coinsEarned || 0) + 5;
        UI.showMessage('+5 монет!', 2);
        UI._applyChestLevel();
      }
    });
    document.getElementById('chestSkipBtn').addEventListener('click', () => {
      if (typeof Audio !== 'undefined') Audio.play('click');
      UI._applyChestLevel();
    });
  },

  _applyChestLevel() {
    document.getElementById('upgradeOverlay').style.display = 'none';
    Player.chestBonusPending = false;
    var needed = Math.ceil(Player.xpToNext * (1 - Player.xpDiscount));
    Player.xp = needed;
    Player.addXp(0);
  },

  reset() {
    this.gameTime = 0;
    this.statsCache = null;
    this.message = null;
    this.messageTimer = 0;
  },

  render(ctx) {
    if (Game.state === 'LOADING') return;
    this.drawHpBar(ctx);
    this.drawXpBar(ctx);
    this.drawStats(ctx);
    this.drawEquipment(ctx);
    this.drawMinimap(ctx);
    this.updateXpBoostBtn();
    if (this.message) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(Game.width / 2 - 120, 80, 240, 40);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.message, Game.width / 2, 100);
      ctx.restore();
    }
  },

  drawStats(ctx) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '13px monospace';
    ctx.textAlign = 'left';
    const mins = Math.floor(this.gameTime / 60);
    const secs = Math.floor(this.gameTime % 60);
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    ctx.fillText(`${timeStr}  Kills: ${Player.kills}  \u25C8${Player.coinsEarned || 0}`, 16, 52);
  },

  drawHpBar(ctx) {
    const x = 16, y = 16, w = 200, h = 18;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x, y, w, h);
    const pct = Math.max(0, Player.hp / Player.maxHp);
    ctx.fillStyle = '#e03030';
    ctx.fillRect(x + 1, y + 1, (w - 2) * pct, h - 2);
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`HP ${Player.hp}/${Player.maxHp}`, x + w / 2, y + 13);
  },

  drawXpBar(ctx) {
    const w = 260, h = 16;
    const x = (Game.width - w) / 2;
    const y = Game.height - 30;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x, y, w, h);
    const pct = Player.xp / Player.xpToNext;
    ctx.fillStyle = '#2a8';
    ctx.fillRect(x + 1, y + 1, (w - 2) * pct, h - 2);
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Lv.${Player.level} ${Player.xp}/${Player.xpToNext} XP`, x + w / 2, y + 12);
  },

  drawEquipment(ctx) {
    var weapons = typeof WeaponManager !== 'undefined' ? WeaponManager.weapons : [];
    var passives = typeof PassiveManager !== 'undefined' ? PassiveManager.items : [];
    if (weapons.length === 0 && passives.length === 0) return;

    var iconSize = 32;
    var gap = 6;
    var padX = 10;
    var padY = 8;
    var maxCount = Math.max(weapons.length, passives.length);
    var panelW = maxCount * (iconSize + gap) + padX * 2 - gap;
    var panelH = (weapons.length > 0 && passives.length > 0 ? 2 : 1) * (iconSize + gap) + padY * 2 - gap;
    var x = Game.width - 16 - panelW;
    var y = 16;

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(x, y, panelW, panelH);

    var drawX = x + padX;
    var drawY = y + padY;

    for (var wi = 0; wi < weapons.length; wi++) {
      var w = weapons[wi];
      var sx = drawX + wi * (iconSize + gap);
      var sy = drawY;
      var smap = typeof WEAPON_SPRITE_MAP !== 'undefined' ? WEAPON_SPRITE_MAP : {};
      var spriteKey = smap[w.id];
      var img = spriteKey ? Game.sprites[spriteKey] : null;
      if (img && img.width > 0) {
        ctx.drawImage(img, sx, sy, iconSize, iconSize);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(sx, sy, iconSize, iconSize);
      }
      ctx.fillStyle = '#ffe040';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(w.level + '/' + w.maxLevel, sx + iconSize - 2, sy + iconSize - 2);
    }

    if (passives.length > 0) {
      drawY += iconSize + gap;
      for (var pi = 0; pi < passives.length; pi++) {
        var p = passives[pi];
        var sx = drawX + pi * (iconSize + gap);
        var sy = drawY;
        var pmap = typeof PASSIVE_SPRITE_MAP !== 'undefined' ? PASSIVE_SPRITE_MAP : {};
        var spriteKey = pmap[p.id];
        var img = spriteKey ? Game.sprites[spriteKey] : null;
        if (img && img.width > 0) {
          ctx.drawImage(img, sx, sy, iconSize, iconSize);
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          ctx.fillRect(sx, sy, iconSize, iconSize);
        }
        ctx.fillStyle = '#8cf';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        var pdefs = typeof PASSIVE_DEFS !== 'undefined' ? PASSIVE_DEFS : {};
        var maxLv = pdefs[p.id] ? pdefs[p.id].maxLevel : '?';
        ctx.fillText(p.level + '/' + maxLv, sx + iconSize - 2, sy + iconSize - 2);
      }
    }
  },

  drawMinimap(ctx) {
    var mmSize = Touch.isMobile() ? 90 : 150;
    var margin = 16;
    var mmX = Game.width - mmSize - margin;
    var mmY = Touch.isMobile() ? margin : Game.height - mmSize - margin;
    var center = mmSize / 2;
    var worldView = 700;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(mmX, mmY, mmSize, mmSize);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(mmX, mmY, mmSize, mmSize);

    ctx.save();
    ctx.translate(mmX, mmY);

    var ms = Game.mapSize;
    var scale = center / worldView;

    for (var ei = 0; ei < Enemy.list.length; ei++) {
      var e = Enemy.list[ei];
      if (!e.alive) continue;
      var ux = Game.unwrap(e.x, Player.x);
      var uy = Game.unwrap(e.y, Player.y);
      var dx = ux - Player.x;
      var dy = uy - Player.y;
      if (Math.abs(dx) > worldView || Math.abs(dy) > worldView) continue;
      var ex = center + dx * scale;
      var ey = center + dy * scale;
      ctx.fillStyle = e.isElite ? '#ff0' : '#e22';
      ctx.fillRect(ex - 1.5, ey - 1.5, 3, 3);
    }

    for (var gi = 0; gi < Enemy.xpGems.length; gi++) {
      var g = Enemy.xpGems[gi];
      if (!g.alive) continue;
      var ux = Game.unwrap(g.x, Player.x);
      var uy = Game.unwrap(g.y, Player.y);
      var dx = ux - Player.x;
      var dy = uy - Player.y;
      if (Math.abs(dx) > worldView || Math.abs(dy) > worldView) continue;
      var gx = center + dx * scale;
      var gy = center + dy * scale;
      ctx.fillStyle = '#8f8';
      ctx.fillRect(gx - 1, gy - 1, 2, 2);
    }

    for (var ci = 0; ci < Enemy.coinItems.length; ci++) {
      var c = Enemy.coinItems[ci];
      if (!c.alive) continue;
      var ux = Game.unwrap(c.x, Player.x);
      var uy = Game.unwrap(c.y, Player.y);
      var dx = ux - Player.x;
      var dy = uy - Player.y;
      if (Math.abs(dx) > worldView || Math.abs(dy) > worldView) continue;
      var cx = center + dx * scale;
      var cy = center + dy * scale;
      ctx.fillStyle = '#fd0';
      ctx.fillRect(cx - 1.5, cy - 1.5, 3, 3);
    }

    for (var chi = 0; chi < Enemy.chestItems.length; chi++) {
      var ch = Enemy.chestItems[chi];
      if (!ch.alive) continue;
      var ux = Game.unwrap(ch.x, Player.x);
      var uy = Game.unwrap(ch.y, Player.y);
      var dx = ux - Player.x;
      var dy = uy - Player.y;
      if (Math.abs(dx) > worldView || Math.abs(dy) > worldView) continue;
      var chx = center + dx * scale;
      var chy = center + dy * scale;
      ctx.fillStyle = '#a64';
      ctx.fillRect(chx - 2, chy - 2, 4, 4);
      ctx.fillStyle = '#fd0';
      ctx.fillRect(chx - 1, chy - 1, 2, 2);
    }

    ctx.fillStyle = '#4f4';
    ctx.beginPath();
    ctx.arc(center, center, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  },

  createXpBoostBtn() {
    if (document.getElementById('xpBoostBtn')) return;
    var btn = document.createElement('div');
    btn.id = 'xpBoostBtn';
    btn.textContent = 'XP×2';
    var activating = false;
    btn.addEventListener('click', function() {
      if (Game.state !== 'PLAYING') return;
      if (Player.xpBoost > 0) return;
      if (activating) return;
      activating = true;
      if (typeof Audio !== 'undefined') Audio.play('click');
      var doBoost = function() {
        Player.xpBoost = 30;
        UI.showMessage('XP×2 на 30с!', 2);
        activating = false;
      };
      if (typeof YandexSDK !== 'undefined' && YandexSDK.ready) {
        YandexSDK.showRewarded(function(success) {
          if (success) doBoost();
          else activating = false;
        });
      } else {
        doBoost();
        activating = false;
      }
    });
    document.body.appendChild(btn);
  },

  updateXpBoostBtn() {
    var btn = document.getElementById('xpBoostBtn');
    if (!btn) return;
    if (Game.state === 'PLAYING' && typeof YandexSDK !== 'undefined') {
      btn.style.display = 'block';
      if (Player.xpBoost > 0) {
        btn.textContent = 'XP×2 ' + Math.ceil(Player.xpBoost) + 'с';
        btn.style.background = 'rgba(0,150,80,0.85)';
      } else {
        btn.textContent = 'XP×2';
        btn.style.background = 'rgba(255,255,255,0.12)';
      }
    } else {
      btn.style.display = 'none';
    }
  },

  _weaponSpriteTag(spriteKey) {
    if (!spriteKey) return '';
    var path = Game.spritePaths && Game.spritePaths[spriteKey];
    if (!path) {
      var s = Game.sprites[spriteKey];
      if (!s) return '';
      path = s.src;
    }
    return `<img src="${path}" class="upgrade-weapon-img">`;
  },

  showUpgrades() {
    const overlay = document.getElementById('upgradeOverlay');
    if (!overlay) return;
    const choices = this.getRandomUpgrades(3);
    if (!choices || choices.length === 0) {
      overlay.innerHTML = `<div class="upgrade-title">УРОВЕНЬ ${Player.level}</div>
        <div style="color:#aaa;margin-bottom:20px;">Все улучшения максимальны</div>
        <button class="restart-btn" id="continueBtn">ПРОДОЛЖИТЬ</button>`;
      overlay.style.display = 'flex';
      document.getElementById('continueBtn').addEventListener('click', () => {
        if (typeof Audio !== 'undefined') Audio.play('click');
        overlay.style.display = 'none';
        Game.state = 'PLAYING';
      });
      return;
    }
    overlay.innerHTML = `<div class="upgrade-title">УРОВЕНЬ ${Player.level}</div><div class="upgrade-choices">`;
    for (const c of choices) {
      const descClass = c.type === 'evolution' ? 'upgrade-desc evolve' : 'upgrade-desc';
      var iconHtml = c._sprite ? this._weaponSpriteTag(c._sprite) : `<div class="upgrade-icon">${c.icon}</div>`;
      overlay.innerHTML += `<div class="upgrade-card" data-id="${c.id}" data-type="${c.type}">
        ${iconHtml}
        <div class="upgrade-name">${c.name}</div>
        <div class="${descClass}">${c.desc}</div>
      </div>`;
    }
    overlay.innerHTML += '</div>';
    overlay.style.display = 'flex';
    overlay.querySelectorAll('.upgrade-card').forEach((card) => {
      card.addEventListener('click', () => {
        if (typeof Audio !== 'undefined') Audio.play('click');
        this.applyUpgrade(card.dataset.id, card.dataset.type);
        overlay.style.display = 'none';
        Game.state = 'PLAYING';
      });
    });
  },

  getRandomUpgrades(count) {
    var pool = [];

    var PASSIVE_DESC_RU = {
      power:     'Урон +10%',
      maxHpMult: 'Макс. HP +10%',
      regen:     'Регенерация +0.1',
      cooldown:  'Перезарядка -2.5%',
      speed:     'Скорость снарядов +10%',
      amount:    'Количество +1',
      magnet:    'Магнит +100',
      growth:    'Требуется на 10% меньше опыта',
      vampChance: 'Вампиризм 10%',
    };

    function passDescRu(pdef) {
      var keys = Object.keys(pdef.bonuses);
      return keys.map(function(k) { return PASSIVE_DESC_RU[k] || ''; }).filter(Boolean).join(', ');
    }

    // Add evolutions as first priority
    var evolvable = WeaponManager.getEvolvableWeapons();
    for (var ei = 0; ei < evolvable.length; ei++) {
      var w = evolvable[ei];
      var evoDef = WEAPON_FACTORIES[w.evoId];
      pool.push({
        type: 'evolution',
        id: w.id,
        name: 'Эволюция: ' + w.nameRu,
        icon: '\u2606',
        desc: 'Улучшается в ' + (evoDef ? evoDef().nameRu : '???'),
        _sprite: WEAPON_SPRITE_MAP[w.evoId] || WEAPON_SPRITE_MAP[w.id],
      });
    }

    // Add owned weapons that can level up
    var lvWeapons = WeaponManager.getLevelableWeapons();
    for (var wi = 0; wi < lvWeapons.length; wi++) {
      var w = lvWeapons[wi];
      pool.push({
        type: 'weaponLevel',
        id: w.id,
        name: w.nameRu + ' Ур.' + w.level,
        icon: '\u2191',
        desc: 'Атака +' + Math.round(10 * w.getStat('power') * Player.power * 0.15),
        _sprite: WEAPON_SPRITE_MAP[w.id],
      });
    }

    // Add unowned non-evolved weapons (only if under limit)
    if (WeaponManager.weapons.length < WeaponManager.MAX_WEAPONS) {
      for (var key in WEAPON_FACTORIES) {
        if (key === 'holyMissile' || key === 'bloodyTear' ||
            key === 'thousandEdge' || key === 'hellfire' || key === 'bora' ||
            key === 'loop') continue;
        if (!WeaponManager.hasWeapon(key)) {
          var def = WEAPON_FACTORIES[key]();
          pool.push({ type: 'weaponNew', id: key, name: def.nameRu, icon: '\u2694', desc: 'Новое оружие', _sprite: WEAPON_SPRITE_MAP[key] });
        }
      }
    }

    // Add passive items (only allow new if under limit)
    for (var pid in PASSIVE_DEFS) {
      var pdef = PASSIVE_DEFS[pid];
      var passiveSprite = PASSIVE_SPRITE_MAP[pid] || null;
      if (!PassiveManager.has(pid)) {
        if (PassiveManager.items.length >= PassiveManager.MAX_PASSIVES) continue;
        pool.push({ type: 'passive', id: pid, name: pdef.nameRu, icon: '\u25C8', desc: passDescRu(pdef), _sprite: passiveSprite });
      } else if (!PassiveManager.isMaxed(pid)) {
        var level = PassiveManager.getLevel(pid);
        pool.push({ type: 'passive', id: pid, name: pdef.nameRu + ' Ур.' + (level + 1), icon: '\u25C8', desc: passDescRu(pdef), _sprite: passiveSprite });
      }
    }

    var shuffled = pool.slice().sort(function() { return Math.random() - 0.5; });
    var result = [];
    var hasEvo = false;
    for (var si = 0; si < shuffled.length && result.length < count; si++) {
      if (shuffled[si].type === 'evolution') {
        if (!hasEvo) { result.push(shuffled[si]); hasEvo = true; }
        continue;
      }
      result.push(shuffled[si]);
    }
    return result;
  },

  applyUpgrade(id, type) {
    if (type === 'evolution') {
      var weapons = WeaponManager.weapons;
      for (var i = 0; i < weapons.length; i++) {
        if (weapons[i].id === id && weapons[i].canEvolve()) {
          WeaponManager.evolveWeapon(weapons[i]);
          break;
        }
      }
      return;
    }
    if (type === 'weaponLevel') {
      var weapons = WeaponManager.weapons;
      for (var i = 0; i < weapons.length; i++) {
        if (weapons[i].id === id) {
          weapons[i].level++;
          break;
        }
      }
      return;
    }
    if (type === 'weaponNew') {
      WeaponManager.addWeapon(id);
      return;
    }
    if (type === 'passive') {
      PassiveManager.add(id);
      return;
    }

  },

  showGameOver() {
    const overlay = document.getElementById('upgradeOverlay');
    if (!overlay) return;
    if (typeof Audio !== 'undefined') Audio.play('gameOver');
    var gp = document.getElementById('gameplayMusic');
    if (gp) { gp.pause(); gp.currentTime = 0; }
    var rage = document.getElementById('rageMusic');
    if (rage) { rage.pause(); rage.currentTime = 0; }
    var menu = document.getElementById('menuMusic');
    if (menu) { menu.currentTime = 0; menu.play(); }
    var coins = Player.coinsEarned || 0;
    const mins = Math.floor(this.gameTime / 60);
    const secs = Math.floor(this.gameTime % 60);
    const curTime = this.gameTime;
    if (curTime > SaveManager.data.bestTime) {
      SaveManager.data.bestTime = curTime;
      SaveManager.save();
    }
    const bm = Math.floor(SaveManager.data.bestTime / 60);
    const bs = Math.floor(SaveManager.data.bestTime % 60);
    const hasAd = typeof YandexSDK !== 'undefined';
    var _coinsClaimed = false;
    overlay.innerHTML = `<div class="gameover-title">GAME OVER</div>
      <div class="gameover-stats">
        <div>Survived: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}</div>
        <div style="color:#ffa500;">Best: ${String(bm).padStart(2, '0')}:${String(bs).padStart(2, '0')}</div>
        <div>Kills: ${Player.kills}</div>
        <div>Level: ${Player.level}</div>
        <div style="color:#ffe040;margin-top:8px;" id="coinDisplay">Монет заработано: ${coins}</div>
        <div style="color:#8f8;font-size:14px;">Всего монет: ${SaveManager.data.coins}</div>
      </div>
      ${hasAd && coins > 0 ? '<button class="restart-btn" id="doubleCoinBtn" style="background:#b08020;border-color:#ffe040;">×2 МОНЕТ (реклама)</button>' : ''}
      ${hasAd ? '<button class="restart-btn" id="adReviveBtn" style="background:#2a6;border-color:#4f8;">ВОСКРЕСНУТЬ (реклама)</button>' : ''}
      <button class="restart-btn" id="restartBtn">ЕЩЁ РАЗ</button>
      <button class="restart-btn menu-btn" id="upgradeBtn" style="margin-top:10px;background:#b08020;border-color:#ffe040;">УЛУЧШЕНИЯ</button>
      <button class="restart-btn menu-btn" id="menuBtn" style="margin-top:10px;background:#333;border-color:#666;">ГЛАВНОЕ МЕНЮ</button>`;
    overlay.style.display = 'flex';
    var claim = function(mul) {
      if (_coinsClaimed) return;
      _coinsClaimed = true;
      if (coins > 0) SaveManager.addCoins(coins * mul);
    };
    if (hasAd && coins > 0) {
      document.getElementById('doubleCoinBtn').addEventListener('click', function() {
        if (typeof Audio !== 'undefined') Audio.play('click');
        var doDouble = function() {
          claim(2);
          var cd = document.getElementById('coinDisplay');
          if (cd) cd.innerHTML = 'Монет заработано: ' + coins + ' ×2';
          document.getElementById('doubleCoinBtn').disabled = true;
          document.getElementById('doubleCoinBtn').style.opacity = '0.5';
        };
        if (YandexSDK.ready) {
          YandexSDK.showRewarded(function(success) {
            if (success) doDouble();
          });
        } else {
          doDouble();
        }
      });
    }
    if (hasAd) {
      document.getElementById('adReviveBtn').addEventListener('click', function() {
        if (typeof Audio !== 'undefined') Audio.play('click');
        var doRevive = function() {
          overlay.style.display = 'none';
          Player.adRevive();
        };
        if (YandexSDK.ready) {
          YandexSDK.showRewarded(function(success) {
            if (success) doRevive();
          });
        } else {
          doRevive();
        }
      });
    }
    document.getElementById('restartBtn').addEventListener('click', () => {
      claim(1);
      overlay.style.display = 'none';
      Game.reset();
    });
    document.getElementById('upgradeBtn').addEventListener('click', () => {
      SaveManager.openMenu();
    });
    document.getElementById('menuBtn').addEventListener('click', () => {
      claim(1);
      overlay.style.display = 'none';
      document.getElementById('mainMenu').style.display = 'flex';
    });
    if (typeof YandexSDK !== 'undefined' && YandexSDK.ready) {
      YandexSDK.showInterstitial();
    }
  },
};
