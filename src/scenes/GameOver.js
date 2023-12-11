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

    gameOverText.setInteractive({ useHandCursor: true });

    // Listen for the pointerdown event
    gameOverText.on("pointerdown", () => {
      this.scene.start("playScene");
    });
  }

  update() {}
}
