
/*
MAJOR PHASER COMPONENTS:

Physics Systems: I am using Phaser's Arcade physics system to manage player movement and gravity. This is implemented in the Player class where I enable the physics body for the player and set gravity.

Text Objects: I am using Phaser's text objects in my Menu scene to display the game title and instructions. This is done by calling this.add.text() and passing in the desired text and styling.

Tween Manager: I am using Phaser's tween manager to animate the player's jump. This is done in the jump() method of the Player class, where I create a tween that changes the player's y position over time to simulate a jump.
  
Cameras: I am using Phaser's camera system to create a "fog of war" effect, enhancing the stealth aspect of my game. Only the area around the player is visible, while the rest of the game world is obscured. This is implemented by creating a circular mask around the player and setting the camera to only display the area within the mask.

Timers: I am using Phaser's timer system to create a sense of tension and urgency, which is crucial for a stealth game. I have a timer that counts down to when enemy patrols change their routes, adding an extra layer of challenge and unpredictability to the game. I've also implemented a timer that counts down to when the player is discovered if they stay in the enemies' line of sight for too long, further enhancing the stealth mechanics of the game.




*/







let config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 600,
    scene: [ Menu, Play, GameOver],

    physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 300 },
          debug: false,
      },
    },
  }
  
let game = new Phaser.Game(config);

let borderUISize = game.config.height / 15;
let borderPadding = borderUISize / 3;

// reserve keyboard vars
let keyF, keyR, keyLEFT, keyRIGHT, keyUP;