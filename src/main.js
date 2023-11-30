let config = {
  type: Phaser.AUTO,
  default: "arcade",
  arcade: {
    gravity: { y: 0 },
    debug: true,
  },
  width: 800,
  height: 600,
  scene: [Play],
};

let game = new Phaser.Game(config);
