import Phaser from 'phaser'
import ScoreLabel from '../ui/ScoreLabel'

const GROUND_KEY =  'ground'
const DUDE_KEY = 'dude'
const STAR_KEY = 'star'

export default class GameScene extends Phaser.Scene
{
	constructor()
	{
        super('game-scene')
        this.player = undefined
        this.cursors = undefined
        this.scoreLabel = undefined
	}

	preload()
    {
        this.load.image('sky', 'assets/sky.png')
		this.load.image( GROUND_KEY, 'assets/platform.png')
		this.load.image( STAR_KEY, 'assets/star.png')
		this.load.image('bomb', 'assets/bomb.png')

		this.load.spritesheet('dude', 
			'assets/dude.png',
			{ frameWidth: 32, frameHeight: 48 }
		)
    }

    create()
    {
        this.add.image(400, 300, 'sky')
        //this.add.image(400, 300, 'star')
        
        //create player and platforms
        //then add collisions between the 2 so we can stand on platforms
        const platforms = this.createPlatforms()
        this.player = this.createPlayer()
        this.physics.add.collider(this.player, platforms)

        //create stars to collect and add collider
        const stars = this.createStars()
        this.physics.add.collider(stars, platforms)

        //detect overlap between player and stars
        this.physics.add.overlap(this.player, stars, this.collectStar, null, this)

        //add key binds
        this.cursors = this.input.keyboard.createCursorKeys()

        //add score
        this.scoreLabel = this.createScoreLabel(16,16,0)
    }

    update()
	{
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
    }
    
    createScoreLabel(x, y, score)
	{
		const style = { fontSize: '32px', fill: '#000' }
		const label = new ScoreLabel(this, x, y, score, style)

		this.add.existing(label)

		return label
	}
}
