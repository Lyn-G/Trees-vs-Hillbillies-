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
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    this.canUseFlamethrower = true; // Flag to control flamethrower usage

    // Create a stationary cooldown timer bar
    this.cooldownBar = this.add.graphics();
    this.cooldownBarInitialX = 50; // Initial x position
    this.cooldownBarInitialWidth = 200; // Initial width
    this.cooldownBar.fillStyle(0xff0000, 1); // Red color
    this.cooldownBar.fillRect(
      this.cooldownBarInitialX,
      50,
      this.cooldownBarInitialWidth,
      20
    ); // Position and size
    this.cooldownBar.visible = false; // Initially invisible
  }

  update() {
    // Billy movement
    if (this.keys.left.isDown) {
      this.billy.x -= 2;
    } else if (this.keys.right.isDown) {
      this.billy.x += 2;
    }

    // Handle flamethrower activation
    if (
      Phaser.Input.Keyboard.JustDown(this.keys.space) &&
      this.canUseFlamethrower
    ) {
      this.billy.setTexture("billyFlamethrower");
      this.canUseFlamethrower = false;

      // Timer to change back to the base form
      this.time.delayedCall(
        3000,
        () => {
          this.billy.setTexture("billyIdle");
          this.startCooldown();
        },
        [],
        this
      );
    }

    // Tree movement
    if (this.cursors.left.isDown) {
      this.tree.x -= 2;
    } else if (this.cursors.right.isDown) {
      this.tree.x += 2;
    }
  }
  startCooldown() {
    let totalTime = 2000; // Total time for cooldown
    let updateTime = 100; // Time per update
    let totalUpdates = totalTime / updateTime; // Total number of updates

    this.cooldownBar.visible = true; // Show cooldown bar
    this.cooldownBar.clear();
    this.cooldownBar.fillStyle(0xff0000, 1);
    this.cooldownBar.fillRect(
      this.cooldownBarInitialX,
      50,
      this.cooldownBarInitialWidth,
      20
    );

    let startTime = this.time.now; // Record the start time

    this.time.addEvent({
      delay: updateTime,
      repeat: totalUpdates - 1,
      callback: () => {
        let elapsed = this.time.now - startTime; // Calculate elapsed time
        let newWidth = this.cooldownBarInitialWidth * (1 - elapsed / totalTime);
        this.cooldownBar.clear();
        this.cooldownBar.fillStyle(0xff0000, 1);
        this.cooldownBar.fillRect(this.cooldownBarInitialX, 50, newWidth, 20);
      },
      callbackScope: this,
    });

    // Timer before the next flamethrower can be used
    this.time.delayedCall(
      totalTime,
      () => {
        this.canUseFlamethrower = true;
        this.cooldownBar.visible = false; // Hide cooldown bar
      },
      [],
      this
    );
  }
}
