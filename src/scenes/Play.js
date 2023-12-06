class Play extends Phaser.Scene {
  constructor() {
    super("playScene");
    this.billyOnGround = true;
    this.treeOnGround = true;
  }

  preload() {
    this.load.image("billyIdle", "../assets/billy-idle.png");
    this.load.image("billyFlamethrower", "../assets/billy-flamethrower.png");
    this.load.image("tree", "../assets/tree.png");
    this.load.image("projectile", "../assets/projectile.png");
  }

  create() {
    this.billy = this.add.sprite(100, 300, "billyIdle");
    this.tree = this.add.sprite(600, 220, "tree");
    this.physics.world.enable([this.billy, this.tree]);

    this.billy.body.setSize(70, 120);
    this.tree.body.setSize(this.tree.width * 0.2, 250);

    this.projectiles = this.physics.add.group(); // Create a group for projectiles
    this.projectileSpeed = 300; // Speed of the projectile

    this.billyMaxHealth = 100;
    this.billyCurrentHealth = this.billyMaxHealth;
    this.billyHPInitialWidth = 200;

    this.treeMaxHealth = 100;
    this.treeCurrentHealth = this.treeMaxHealth;
    this.treeHPInitialWidth = 200;

    this.billyHP = this.add.graphics();
    this.billyHP.fillStyle(0x24d330, 1);
    this.billyHP.fillRect(50, 100, this.billyHPInitialWidth, 20);

    this.treeHP = this.add.graphics();
    this.treeHP.fillStyle(0x24d330, 1);
    this.treeHP.fillRect(550, 100, this.treeHPInitialWidth, 20);

    //ground
    this.ground = this.add.rectangle(
      0,
      this.sys.game.config.height - 200,
      1600,
      40,
      0x654321
    );
    this.physics.add.existing(this.ground, true); // 'true' makes it a static object

    // Enable physics for Billy and the Tree
    this.physics.world.enable([this.billy, this.tree]);

    // Set gravity for the objects
    this.billy.body.setGravityY(300);
    this.tree.body.setGravityY(300);

    // Add collision between the ground and Billy and the tree
    this.physics.add.collider(this.billy, this.ground);
    this.physics.add.collider(this.tree, this.ground);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });
    this.shiftKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SHIFT
    );

    // Add W key for Billy's jump
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

    this.canUseFlamethrower = true;

    // Create a stationary cooldown timer bar
    this.cooldownBar = this.add.graphics();
    this.cooldownBarInitialX = 50;
    this.cooldownBarInitialWidth = 200;
    this.cooldownBar.fillStyle(0xff0000, 1);
    this.cooldownBar.fillRect(
      this.cooldownBarInitialX,
      50,
      this.cooldownBarInitialWidth,
      20
    );
    this.cooldownBar.visible = false;

    this.treeHPReduced = false;
    this.billyHPReduced = false;
  }

  update() {
    if (this.wKey.isDown && this.billyOnGround) {
      this.billy.body.setVelocityY(-250); // Adjust jump strength as needed
      this.billyOnGround = false;
    }

    // Tree's jump
    if (this.cursors.up.isDown && this.treeOnGround) {
      this.tree.body.setVelocityY(-250); // Adjust jump strength as needed
      this.treeOnGround = false;
    }

    // Check if Billy is on the ground
    if (this.billy.body.touching.down) {
      this.billyOnGround = true;
    }

    // Check if the tree is on the ground
    if (this.tree.body.touching.down) {
      this.treeOnGround = true;
    }

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
      this.billy.body.setSize(600, 120);

      // Timer to change back to the base form
      this.time.delayedCall(
        3000,
        () => {
          this.billy.setTexture("billyIdle");
          this.billy.body.setSize(70, 120);
          this.startCooldown();
        },
        [],
        this
      );

      this.physics.world.enable(this.tree);
    }

    // collision check for billy's flamethrower and the tree
    if (this.billy.texture.key === "billyFlamethrower") {
      if (this.checkOverlap(this.billy, this.tree)) {
        if (!this.treeHPReduced) {
          this.reduceTreeHealth(10);
          this.treeHPReduced = true;
        }
      }
    } else {
      this.treeHPReduced = false;
    }

    // Tree movement
    if (this.cursors.left.isDown) {
      this.tree.x -= 2;
    } else if (this.cursors.right.isDown) {
      this.tree.x += 2;
    }

    if (Phaser.Input.Keyboard.JustDown(this.shiftKey)) {
      this.spawnProjectile(this.tree.x, this.tree.y);
    }

    // Update projectiles
    this.projectiles.getChildren().forEach((projectile) => {
      projectile.body.setSize(200, 200);
      this.physics.overlap(
        projectile,
        this.billy,
        () => {
          if (!this.billyHPReduced) {
            this.reduceBillyHealth(10);
            this.billyHPReduced = true;
          }
        },
        null,
        this
      );

      if (projectile.x > this.sys.game.config.width) {
        projectile.destroy();
      }
    });
  }

  checkOverlap(spriteA, spriteB) {
    const boundsA = spriteA.getBounds();
    const boundsB = spriteB.getBounds();

    return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
  }

  reduceBillyHealth(damage) {
    this.billyCurrentHealth = Math.max(this.billyCurrentHealth - damage, 0);
    const newWidth =
      (this.billyHPInitialWidth * this.billyCurrentHealth) /
      this.billyMaxHealth;

    this.billyHP.clear();
    this.billyHP.fillStyle(0x24d330, 1);
    this.billyHP.fillRect(50, 100, newWidth, 20);
  }

  spawnProjectile(x, y) {
    this.billyHPReduced = false;
    // Create a new projectile at the specified x and y coordinates
    let projectile = this.projectiles.create(x, y, "projectile");
    projectile.setScale(0.4);

    // Set the velocity of the projectile to negative for leftward movement
    projectile.setVelocityX(-this.projectileSpeed);
  }

  reduceTreeHealth(damage) {
    this.treeCurrentHealth = Math.max(this.treeCurrentHealth - damage, 0);
    const newWidth =
      (this.treeHPInitialWidth * this.treeCurrentHealth) / this.treeMaxHealth;

    this.treeHP.clear();
    this.treeHP.fillStyle(0x24d330, 1);
    this.treeHP.fillRect(550, 100, newWidth, 20);
  }

  startCooldown() {
    let totalTime = 2000;
    let updateTime = 100;
    let totalUpdates = totalTime / updateTime;

    this.cooldownBar.visible = true;
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
        let elapsed = this.time.now - startTime;
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
        this.cooldownBar.visible = false;
        this.treeHPReduced = false;
      },
      [],
      this
    );
  }
}
