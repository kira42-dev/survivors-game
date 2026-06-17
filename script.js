Game.init();
Player.init();
Touch.init();
Game.loadAssets();
SaveManager.load();
if (typeof YandexSDK !== 'undefined') YandexSDK.init();

function checkLoading() {
  if (Game.state !== 'LOADING') return;
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

function togglePause() {
  var menu = document.getElementById('pauseMenu');
  var gp = document.getElementById('gameplayMusic');
  var rage = document.getElementById('rageMusic');
  if (Game.state === 'PLAYING') {
    Game.state = 'PAUSED';
    menu.style.display = 'flex';
    if (gp && !gp.paused) gp.pause();
    if (rage && !rage.paused) rage.pause();
  } else if (Game.state === 'PAUSED') {
    Game.state = 'PLAYING';
    menu.style.display = 'none';
    if (rage && rage.currentTime > 0) rage.play();
    else if (gp && gp.paused) gp.play();
  }
}

function quitToMenu() {
  var menu = document.getElementById('pauseMenu');
  menu.style.display = 'none';
  if (Player.coinsEarned > 0) SaveManager.addCoins(Player.coinsEarned);
  Player.coinsEarned = 0;
  Player.hp = 0;
  Player.dead = true;
  Game.state = 'GAME_OVER';
  UI.showGameOver();
}

document.addEventListener('DOMContentLoaded', function() {
  checkLoading();
  document.getElementById('metaUpgradeBtn').addEventListener('click', function() {
    SaveManager.openMenu();
  });
  document.getElementById('resumeBtn').addEventListener('click', togglePause);
  document.getElementById('quitBtn').addEventListener('click', quitToMenu);
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && (Game.state === 'PLAYING' || Game.state === 'PAUSED')) {
    togglePause();
  }
});

function startGame() {
  if (Game.state === 'LOADING') return;
  if (typeof Audio !== 'undefined') Audio.play('click');
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

