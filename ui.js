const UI = {
  gameTime: 0,

  reset() {
    this.gameTime = 0;
  },

  render(ctx) {
    if (Game.state === 'LOADING') return;
    this.gameTime += Game.fixedDt;
    this.drawHpBar(ctx);
    this.drawXpBar(ctx);
    this.drawStats(ctx);
  },

  drawHpBar(ctx) {
    const x = 16, y = 16, w = 200, h = 18;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x, y, w, h);
    const pct = Math.max(0, Player.hp / Player.maxHp);
    const grad = ctx.createLinearGradient(x, y, x + w * pct, y);
    grad.addColorStop(0, '#e03030');
    grad.addColorStop(1, '#ff6060');
    ctx.fillStyle = grad;
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

  drawStats(ctx) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '13px monospace';
    ctx.textAlign = 'left';
    const mins = Math.floor(this.gameTime / 60);
    const secs = Math.floor(this.gameTime % 60);
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    ctx.fillText(`⏱ ${timeStr}  💀 ${Player.kills}`, 16, 52);
  },

  showUpgrades() {
    const overlay = document.getElementById('upgradeOverlay');
    if (!overlay) return;
    const choices = this.getRandomUpgrades(3);
    overlay.innerHTML = `<div class="upgrade-title">LEVEL ${Player.level}</div><div class="upgrade-choices">`;
    for (const c of choices) {
      overlay.innerHTML += `<div class="upgrade-card" data-id="${c.id}">
        <div class="upgrade-icon">${c.icon}</div>
        <div class="upgrade-name">${c.name}</div>
        <div class="upgrade-desc">${c.desc}</div>
      </div>`;
    }
    overlay.innerHTML += '</div>';
    overlay.style.display = 'flex';
    overlay.querySelectorAll('.upgrade-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        this.applyUpgrade(id);
        overlay.style.display = 'none';
        Game.state = 'PLAYING';
      });
    });
  },

  getRandomUpgrades(count) {
    const all = [
      { id: 'damage', name: 'Damage', icon: '⚔️', desc: '+1 attack damage' },
      { id: 'attackSpeed', name: 'Attack Speed', icon: '⚡', desc: 'Faster projectiles (-0.15s)' },
      { id: 'range', name: 'Range', icon: '🎯', desc: '+80 projectile range' },
      { id: 'projectiles', name: 'Multi-Shot', icon: '🔱', desc: '+1 projectile' },
      { id: 'speed', name: 'Move Speed', icon: '👟', desc: '+20 move speed' },
      { id: 'maxHp', name: 'Max HP', icon: '❤️', desc: '+5 max HP & heal' },
    ];
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  applyUpgrade(id) {
    const s = Player.stats;
    switch (id) {
      case 'damage': s.damage += 1; break;
      case 'attackSpeed': s.attackSpeed = Math.max(0.2, s.attackSpeed - 0.15); break;
      case 'range': s.range += 80; break;
      case 'projectiles': s.projectileCount += 1; break;
      case 'speed': s.speed += 20; break;
      case 'maxHp': Player.maxHp += 5; Player.hp = Player.maxHp; break;
    }
  },

  showGameOver() {
    const overlay = document.getElementById('upgradeOverlay');
    if (!overlay) return;
    const mins = Math.floor(this.gameTime / 60);
    const secs = Math.floor(this.gameTime % 60);
    overlay.innerHTML = `<div class="gameover-title">GAME OVER</div>
      <div class="gameover-stats">
        <div>Survived: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}</div>
        <div>Kills: ${Player.kills}</div>
        <div>Level: ${Player.level}</div>
      </div>
      <button class="restart-btn" id="restartBtn">RESTART</button>`;
    overlay.style.display = 'flex';
    document.getElementById('restartBtn').addEventListener('click', () => {
      overlay.style.display = 'none';
      Game.reset();
    });
  },
};
