class Play extends Phaser.Scene {
  constructor() {
    super("playScene");
  }

  preload() {
    this.load.image("billyIdle", "../assets/billy-idle.png");
    this.load.image("billyFlamethrower", "../assets/billy-flamethrower.png");
    this.load.image("tree", "../assets/tree.png");
  }

  create() {
    this.billy = this.add.sprite(100, 300, "billyIdle");

    this.tree = this.add.sprite(600, 220, "tree");

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Set physics properties
    // this.billy.setCollideWorldBounds(true);
    // this.tree.setCollideWorldBounds(true);
  }

  update() {
    if (this.keys.left.isDown) {
      this.billy.x -= 2; // Move left
    } else if (this.keys.right.isDown) {
      this.billy.x += 2; // Move right
    }

    // Tree movement
    if (this.cursors.left.isDown) {
      this.tree.x -= 2; // Move left
    } else if (this.cursors.right.isDown) {
      this.tree.x += 2; // Move right
    }
  }
}
