class Play extends Phaser.Scene {
  constructor() {
    super("playScene");
    this.billyOnGround = true;
    this.treeOnGround = true;
    this.flamethrowerBoosted = false;
  }

  preload() {
    this.load.image("billyIdle", "./assets/billy-idle.png");
    this.load.image("billyFlamethrower", "./assets/billy-flamethrower.png");
    this.load.image("tree", "./assets/tree.png");
    this.load.image("projectile", "./assets/projectile.png");
    this.load.image("pill2", "./assets/pill2.png");
    this.load.image("background", "./assets/treeBackground.png");
  }

  create() {
    this.add.image(0, 0, "background").setOrigin(0, 0).setDepth(-1);

    this.billy = this.add.sprite(100, 100, "billyIdle");
    this.tree = this.add.sprite(600, 220, "tree");

    this.physics.world.enable(this.billy);
    this.physics.world.enable(this.tree);

    this.billy.body.setSize(70, 80);
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
    this.ctrlKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.CTRL
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

    //new code
    this.pills = this.physics.add.group();

    this.time.delayedCall(
      Phaser.Math.Between(5000, 7000),
      this.spawnPill,
      [],
      this
    );

    // Timer event to schedule subsequent pill spawns
    this.time.addEvent({
      delay: 7000,
      loop: true,
      callback: () => {
        this.time.delayedCall(
          Phaser.Math.Between(2000, 6000),
          this.spawnPill,
          [],
          this
        );
      },
    });

    this.physics.add.overlap(
      this.billy,
      this.pills,
      this.collectPill,
      null,
      this
    );
  }

  update() {
    if (this.billyCurrentHealth <= 0 || this.treeCurrentHealth <= 0) {
      let winner = this.billyCurrentHealth <= 0 ? "Tree" : "Billy";
      this.scene.start("gameOver", { winner: winner });
    }

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
      this.billy.body.setSize(600, 80);

      // collision check for billy's flamethrower and the tree
      if (this.billy.texture.key == "billyFlamethrower") {
        if (this.checkOverlap(this.billy, this.tree)) {
          console.log("overlap");
          if (!this.treeHPReduced) {
            let damage = this.flamethrowerBoosted ? 68 : 34; // Double damage if boosted
            this.reduceTreeHealth(damage);
            this.treeHPReduced = true;
          }
        }
      } else {
        this.treeHPReduced = false;
      }

      // Timer to change back to the base form
      this.time.delayedCall(
        3000,
        () => {
          this.billy.setTexture("billyIdle");
          this.billy.body.setSize(70, 80);
          this.startCooldown();
        },
        [],
        this
      );

      this.physics.world.enable(this.billy);
      this.physics.world.enable(this.tree);
    }

    // Tree movement
    if (this.cursors.left.isDown) {
      this.tree.x -= 2;
    } else if (this.cursors.right.isDown) {
      this.tree.x += 2;
    }

    if (Phaser.Input.Keyboard.JustDown(this.ctrlKey)) {
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
            this.reduceBillyHealth(3);
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

    // Further lower the spawn position of the projectile
    let spawnY = y + 100; // Increase this value to spawn the projectile even lower

    // Create a new projectile at the specified x and adjusted y coordinates
    let projectile = this.projectiles.create(x, spawnY, "projectile");
    projectile.setScale(0.4);

    // Make the hitbox of the projectile even smaller
    let hitboxWidth = 25; // Decrease these dimensions for a smaller hitbox
    let hitboxHeight = 25;
    projectile.body.setSize(hitboxWidth, hitboxHeight);

    // Set the velocity of the projectile
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

    let startTime = this.time.now;

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

  //new code
  spawnPill() {
    let x = Phaser.Math.Between(0, this.sys.game.config.width / 2);
    let pill = this.pills.create(x, 0, "pill2");
    pill.setVelocityY(100);

    let hitboxSize = 20;
    pill.body.setSize(hitboxSize, hitboxSize);
    let offset = (pill.width - hitboxSize) / 2;
    pill.body.setOffset(offset, offset);
  }

  collectPill(billy, pill) {
    pill.destroy();
    this.boostFlamethrower();
  }
  boostFlamethrower() {
    this.flamethrowerBoosted = true;
    this.time.delayedCall(
      10000,
      () => {
        // Duration of the boost
        this.flamethrowerBoosted = false;
      },
      [],
      this
    );
  }
}
