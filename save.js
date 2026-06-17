var SaveManager = {
  SAVE_KEY: 'survivors_save',

  data: {
    coins: 0,
    bestTime: 0,
    upgrades: {
      damage: 0,
      maxHp: 0,
      speed: 0,
      cooldown: 0,
      revive: 0,
    }
  },

  UPGRADE_DEFS: {
    damage:  { name: 'Мощь',      desc: 'Урон +5%',        maxLevel: 5, costs: [50, 100, 200, 400, 800] },
    maxHp:   { name: 'Живучесть', desc: 'Макс. HP +10%',   maxLevel: 5, costs: [50, 100, 200, 400, 800] },
    speed:   { name: 'Скорость',  desc: 'Скорость +5%',    maxLevel: 5, costs: [75, 150, 300, 600, 1200] },
    cooldown:{ name: 'Кулдаун',   desc: 'Перезарядка -3%', maxLevel: 5, costs: [100, 200, 400, 800, 1600] },
    revive:  { name: 'Воскрешение', desc: '+1 жизнь',      maxLevel: 5, costs: [200, 500, 1000, 2000, 4000] },
  },

  load: function() {
    try {
      var raw = localStorage.getItem(this.SAVE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        for (var k in parsed.upgrades) {
          if (this.data.upgrades.hasOwnProperty(k)) {
            this.data.upgrades[k] = parsed.upgrades[k];
          }
        }
        this.data.coins = parsed.coins || 0;
        this.data.bestTime = parsed.bestTime || 0;
      }
    } catch (e) {}
  },

  save: function() {
    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(this.data));
    } catch (e) {}
  },

  addCoins: function(amount) {
    this.data.coins += amount;
    this.save();
  },

  getCost: function(id) {
    var def = this.UPGRADE_DEFS[id];
    if (!def) return Infinity;
    var level = this.data.upgrades[id] || 0;
    if (level >= def.maxLevel) return -1;
    return def.costs[level];
  },

  buy: function(id) {
    var cost = this.getCost(id);
    if (cost < 0) return false;
    if (this.data.coins < cost) return false;
    this.data.coins -= cost;
    this.data.upgrades[id]++;
    this.save();
    return true;
  },

  getBonus: function(id) {
    var level = this.data.upgrades[id] || 0;
    switch (id) {
      case 'damage':   return 1 + level * 0.05;
      case 'maxHp':    return 1 + level * 0.1;
      case 'speed':    return 1 + level * 0.05;
      case 'cooldown': return 1 - level * 0.03;
      case 'revive':   return level;
    }
    return 0;
  },

  applyToPlayer: function() {
    Player.power *= this.getBonus('damage');
    Player.maxHp = Math.ceil(Player.maxHp * this.getBonus('maxHp'));
    Player.hp = Player.maxHp;
    Player.moveSpeed *= this.getBonus('speed');
    Player.cooldown *= this.getBonus('cooldown');
    Player._revives = this.getBonus('revive');
  },

  getTotalCoinsEarned: function() {
    var total = 0;
    for (var id in this.UPGRADE_DEFS) {
      var level = this.data.upgrades[id] || 0;
      var def = this.UPGRADE_DEFS[id];
      for (var i = 0; i < level; i++) {
        total += def.costs[i];
      }
    }
    return total + this.data.coins;
  },

  openMenu: function() {
    var overlay = document.getElementById('upgradeOverlay');
    if (!overlay) return;
    var mainMenu = document.getElementById('mainMenu');
    this._fromMainMenu = mainMenu && mainMenu.style.display !== 'none';
    if (this._fromMainMenu) mainMenu.style.display = 'none';

    var html = '<div class="upgrade-title">УЛУЧШЕНИЯ</div>';
    html += '<div class="meta-coins">Монет: <span id="metaCoinsCount">' + this.data.coins + '</span></div>';
    html += '<div class="upgrade-choices meta-choices">';
    for (var id in this.UPGRADE_DEFS) {
      var def = this.UPGRADE_DEFS[id];
      var level = this.data.upgrades[id] || 0;
      var cost = this.getCost(id);
      var canBuy = cost > 0 && this.data.coins >= cost;
      var isMaxed = cost < 0;
      html += '<div class="meta-card" data-id="' + id + '">';
      html += '  <div class="meta-card-name">' + def.name + '</div>';
      html += '  <div class="meta-card-desc">' + def.desc + '</div>';
      html += '  <div class="meta-card-level">Ур. ' + level + '/' + def.maxLevel + '</div>';
      if (isMaxed) {
        html += '  <div class="meta-card-cost maxed">МАКС</div>';
      } else {
        html += '  <div class="meta-card-cost' + (canBuy ? '' : ' too-expensive') + '">' + cost + ' монет</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    html += '<button class="restart-btn menu-btn" id="metaBackBtn" style="background:#555;margin-top:20px;">НАЗАД</button>';
    overlay.innerHTML = html;
    overlay.style.display = 'flex';

    overlay.querySelectorAll('.meta-card').forEach(function(card) {
      card.addEventListener('click', function() {
        var id = this.dataset.id;
        if (SaveManager.buy(id)) {
          SaveManager.openMenu();
        }
      });
    });
    document.getElementById('metaBackBtn').addEventListener('click', function() {
      overlay.style.display = 'none';
      if (SaveManager._fromMainMenu) {
        document.getElementById('mainMenu').style.display = 'flex';
      }
    });
  },
};
