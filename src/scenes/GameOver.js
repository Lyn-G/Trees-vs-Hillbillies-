class GameOver extends Phaser.Scene {
  constructor() {
    super("gameOver");
  }

  preload() {}

  create(data) {
    const winner = data.winner;
    const gameOverText = this.add.text(
      250,
      250,
      `${winner} wins!\nPlay again?`,
      {
        fontSize: "24px",
        fill: "#fff",
      }
    );
  }

  update() {}
}
