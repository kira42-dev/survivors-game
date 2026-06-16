Game.init();
Player.init();
Touch.init();
Game.loadAssets();
SaveManager.load();

function checkLoading() {
  if (Game.state !== 'LOADING') return;
  var pct = Game.totalAssets > 0 ? Math.round(Game.loadedAssets / Game.totalAssets * 100) : 0;
  var bar = document.getElementById('loadingBar');
  var text = document.getElementById('loadingProgress');
  if (bar) bar.style.width = pct + '%';
  if (text) text.textContent = pct + '%';
  if (Game.loadedAssets >= Game.totalAssets) {
    Game.state = 'IDLE';
    var loading = document.getElementById('loadingScreen');
    if (loading) loading.style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
    var menuMusic = document.getElementById('menuMusic');
    if (menuMusic) menuMusic.play();
    return;
  }
  requestAnimationFrame(checkLoading);
}

document.addEventListener('DOMContentLoaded', function() {
  checkLoading();
  document.getElementById('metaUpgradeBtn').addEventListener('click', function() {
    SaveManager.openMenu();
  });
});

function startGame() {
  if (Game.state === 'LOADING') return;
  document.getElementById('mainMenu').style.display = 'none';
  var menuMusic = document.getElementById('menuMusic');
  var gameplayMusic = document.getElementById('gameplayMusic');
  if (menuMusic) { menuMusic.pause(); menuMusic.currentTime = 0; }
  if (gameplayMusic) { gameplayMusic.currentTime = 0; gameplayMusic.play(); }
  if (Game.state === 'GAME_OVER') {
    Game.reset();
  } else {
    Game.start();
  }
}

