import Phaser from 'phaser'
import ScoreLabel from '../ui/ScoreLabel'
import BombSpawner from './BombSpawner'

const GROUND_KEY =  'ground'
const DUDE_KEY = 'dude'
const STAR_KEY = 'star'
const BOMB_KEY = 'bomb'

export default class GameScene extends Phaser.Scene
{
	constructor()
	{
        super('game-scene')
        this.player = undefined
        this.cursors = undefined
        this.scoreLabel = undefined
        this.stars = undefined
        this.bombSpawner = undefined

        this.gameOver = false

        this.paused = false
        this.pauseLabel = undefined
        this.menu = undefined
        this.pointer = undefined
	}

	preload()
    {
        this.load.image('sky', 'assets/sky.png')
		this.load.image( GROUND_KEY, 'assets/platform.png')
		this.load.image( STAR_KEY, 'assets/star.png')
		this.load.image( BOMB_KEY, 'assets/bomb.png')

		this.load.spritesheet('dude', 
			'assets/dude.png',
			{ frameWidth: 32, frameHeight: 48 }
        )
        
        this.load.spritesheet('menu', 
            'assets/number-buttons.png',
            { frameWidth: 480, frameHeight: 317 }
            ) 
    }

    create()
    {
        this.add.image(400, 300, 'sky')
        
        //create player and platforms
        //then add collisions between the 2 so we can stand on platforms
        const platforms = this.createPlatforms()
        this.player = this.createPlayer()
        this.physics.add.collider(this.player, platforms)

        //create stars to collect and add collider
        this.stars = this.createStars()
        this.physics.add.collider(this.stars, platforms)

        //detect overlap between player and stars
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this)

        //add key binds
        this.cursors = this.input.keyboard.createCursorKeys()

        //add score
        this.scoreLabel = this.createScoreLabel(16,16,0)

        //BOMBS AWAY!!
        this.bombSpawner = new BombSpawner(this, BOMB_KEY)
        const bombsGroup = this.bombSpawner.group
        this.physics.add.collider(bombsGroup, platforms)

        //add collider between player and bombs
        //call hitBomb function when it happens
        this.physics.add.collider(this.player, bombsGroup, this.hitBomb, null, this)

        //PAUSE MENU
        // Create a label to use as a button
        const w = 800, h = 600;

        this.pauseLabel = this.add.text(w - 100, 20, 'Pause', { font: '24px Arial', fill: '#fff' });
        /* deprecated way to make clickable
        this.pauseLabel.inputEnabled = true;
        this.pauseLabel.events.onInputUp.add(function () {
            // When the pause button is pressed, we pause the game
            this.paused = true;
    
            // Then add the menu
            menu = this.add.sprite(w/2, h/2, 'menu');
            menu.anchor.setTo(0.5, 0.5);
    
            // And a label to illustrate which menu item was chosen. (This is not necessary)
            //choiseLabel = this.add.text(w/2, h-150, 'Click outside menu to continue', { font: '30px Arial', fill: '#fff' });
            //choiseLabel.anchor.setTo(0.5, 0.5);
            });
        */
       /* Phaser 3 clickable function using the new InputPlugin
       https://photonstorm.github.io/phaser3-docs/Phaser.Input.InputPlugin.html
       */
       this.pauseLabel.setInteractive();
       this.pauseLabel.on('pointerdown', () => {
           //set menu visible
           if(this.paused){
            this.menu.setVisible(false)
            this.paused = false
           } else {
            this.menu.setVisible(true)
            this.paused = true
           }
           //this.menu.setVisible(true)
           // When the pause button is pressed, we pause the game
           //this.scene.pause()
           //this.paused = true;
       });


       this.menu = this.createPauseMenu()
       this.menu.setVisible(false)

 
        //create pointer
        this.pointer = this.input.activePointer

        /*
        // And finally the method that handels the pause menu
        //function unpause(event) {
        const unpause = (event) => {
            console.log('tets')
         // Only act if paused
         if(this.scene.isPaused){
            // Calculate the corners of the menu
             var x1 = w/2 - 270/2, x2 = w/2 + 270/2,
                 y1 = h/2 - 180/2, y2 = h/2 + 180/2;
 
             // Check if the click was inside the menu
             if(event.x > x1 && event.x < x2 && event.y > y1 && event.y < y2 ){
                 // The choicemap is an array that will help us see which item was clicked
                 //var choisemap = ['one', 'two', 'three', 'four', 'five', 'six'];
 
                 // Get menu local coordinates for the click
                 var x = event.x - x1,
                     y = event.y - y1;
 
                 // Calculate the choice 
                 var choise = Math.floor(x / 90) + 3*Math.floor(y / 90);
 
                 // Display the choice
                 //choiseLabel.text = 'You chose menu item: ' + choisemap[choise];
             }
             else { 
                 // Remove the menu and the label
                 this.menu.destroy();
                 //choiseLabel.destroy();
 
                 // Unpause the game
                 //this.paused = false;
                 this.scene.resume()
                 this.menu.setVisible(false)
             }
         }

         // Add a input listener that can help us return from being paused
        //this.input.onDown.add(unpause, self);
        //this.input.on('pointerdown', () => console.log('click'));
        }; */
    }

    update()
	{
        //check for pause
        if (this.paused) {
            return
        }
        
        //check for game over
        if (this.gameOver){
            return
        }
        
        if (this.cursors.left.isDown)
		{
			this.player.setVelocityX(-160)

			this.player.anims.play('left', true)
		}
		else if (this.cursors.right.isDown)
		{
			this.player.setVelocityX(160)

			this.player.anims.play('right', true)
		}
		else
		{
			this.player.setVelocityX(0)

			this.player.anims.play('turn')
		}

		if (this.cursors.up.isDown && this.player.body.touching.down)
		{
			this.player.setVelocityY(-330)
		}
	}

    createPlatforms() {
        //make platforms static, not dynamic
        const platforms = this.physics.add.staticGroup()

        //resize and then refresh the GROUND_KEYdisplay
        platforms.create(400, 568,  GROUND_KEY).setScale(2).refreshBody()
	
		platforms.create(600, 400,  GROUND_KEY)
		platforms.create(50, 250,  GROUND_KEY)
        platforms.create(750, 220,  GROUND_KEY)
        
        return platforms
    }
    
    createPlayer()
	{
        //use sprite object
        const player = this.physics.add.sprite(100, 450, DUDE_KEY)
		player.setBounce(0.2)
	    player.setCollideWorldBounds(true)

		this.anims.create({
			key: 'left',
			frames: this.anims.generateFrameNumbers(DUDE_KEY, { start: 0, end: 3 }),
			frameRate: 10,
			repeat: -1
		})
		
		this.anims.create({
			key: 'turn',
			frames: [ { key: DUDE_KEY, frame: 4 } ],
			frameRate: 20
		})
		
		this.anims.create({
			key: 'right',
			frames: this.anims.generateFrameNumbers(DUDE_KEY, { start: 5, end: 8 }),
			frameRate: 10,
			repeat: -1
        })

        return player
    }

    createStars() {
        //make a bunch of star objects with physics applied 
        const stars = this.physics.add.group({
            key: STAR_KEY,
			repeat: 11,
			setXY: { x: 12, y: 0, stepX: 70 } //stepX adds 70px to each consective star
        })

        stars.children.iterate((child) => {
			child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
		})

		return stars
    }

    collectStar(player, star)
	{
        //remove the star
        star.disableBody(true, true)
        //add 10 pts
        this.scoreLabel.add(10)

        //if there are no more stars
        if (this.stars.countActive(true) === 0)
		{
			//  A new batch of stars to collect
			this.stars.children.iterate((child) => {
				child.enableBody(true, child.x, 0, true, true)
			})
		}
        //THROW A BOMB!!
		this.bombSpawner.spawn(player.x)
    }
    
    createScoreLabel(x, y, score)
	{
		const style = { fontSize: '32px', fill: '#000' }
		const label = new ScoreLabel(this, x, y, score, style)

		this.add.existing(label)

		return label
    }
    
    hitBomb(player, bomb)
    {
        //pause movement
        this.physics.pause()
        //death animation
        player.setTint(0xff0000)
		player.anims.play('turn')
        //game over
		this.gameOver = true
    }

    createPauseMenu() {
        // Then add the menu
        //WILL NOT WORK this.physics doesn't have scope? but it works in stars!
        //const menu = this.physics.add.sprite(100, 450, 'menu');

        //add a static group or our menu will fall off screen
        const menu = this.physics.add.staticGroup()
        //this.physics.add.staticGroup()
        //then add sprite art
        menu.create(400, 200, 'menu')
        //menu.anchor.setTo(0.5, 0.5);
        //this.add.existing(menu)
        return menu

        // And a label to illustrate which menu item was chosen. (This is not necessary)
        //choiseLabel = this.add.text(w/2, h-150, 'Click outside menu to continue', { font: '30px Arial', fill: '#fff' });
        //choiseLabel.anchor.setTo(0.5, 0.5);
    }
}
