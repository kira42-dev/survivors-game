window.addEventListener('load', () => {
  Game.init();
  Player.init();
  Game.loadAssets(() => {
    Game.start();
  });
});
