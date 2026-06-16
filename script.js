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

document.addEventListener('DOMContentLoaded', function() {
  checkLoading();
  document.getElementById('metaUpgradeBtn').addEventListener('click', function() {
    SaveManager.openMenu();
  });
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

