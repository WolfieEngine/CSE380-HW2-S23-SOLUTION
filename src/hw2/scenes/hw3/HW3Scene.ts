import AABB from "../../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Graphic from "../../../Wolfie2D/Nodes/Graphic";
import { GraphicType } from "../../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Label from "../../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../../Wolfie2D/Scene/Scene";
import Color from "../../../Wolfie2D/Utils/Color";
import RandUtils from "../../../Wolfie2D/Utils/RandUtils";
import Sprite from "../../../Wolfie2D/Nodes/Sprites/Sprite";
import CanvasNode from "../../../Wolfie2D/Nodes/CanvasNode";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import Timer from "../../../Wolfie2D/Timing/Timer";
import Circle from "../../../Wolfie2D/DataTypes/Shapes/Circle";
import MathUtils from "../../../Wolfie2D/Utils/MathUtils";

import PlayerController from "../../ai/player/PlayerController";
import { PlayerEvent, PlayerAnimation } from "../../ai/player/PlayerControllerEnums";

import MineBehavior from "../../ai/mine/MineBehavior";
import BubbleAI from "../../ai/bubble/BubbleBehavior";
import LaserBehavior, { LaserEvents } from "../../ai/laser/LaserBehavior";

import GameOver from "../game_over/GameOver";
import HW3SceneOptions from "./HW3SceneOptions";

import BubbleShaderType from "../../shaders/BubbleShaderType";
import LaserShaderType from "../../shaders/LaserShaderType";

import { HW3Layers, HW3Sprites, HW3Events } from "./HW3Enums";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import EventRecording from "../../playback/HW3Recording";

/**
 * This is the main scene for our game. 
 * @see Scene for more information about the Scene class and Scenes in Wolfie2D
 */
export default class HW3Scene extends Scene {
	// The options for the HW3Scene
	private opts: HW3SceneOptions;

	// Sprites for the background images
	private bg1: Sprite;
	private bg2: Sprite;

	// Here we define member variables of our game, and object pools for adding in game objects
	private player: AnimatedSprite;

	// Object pool for lasers
	private lasers: Array<Graphic>;
	// Object pool for rocks
	private mines: Array<Sprite>;
	// Object pool for bubbles
	private bubbles: Array<Graphic>;

	// Laser/Charge labels
	private chrgLabel: Label;
	private chrgBarLabels: Array<Label>;

	// Air labels
	private airLabel: Label;
	private airBar: Label;
	private airBarBg: Label;

	// Health labels
	private healthLabel: Label;
	private healthBar: Label;
	private healthBarBg: Label;

	// Timers for spawning rocks and bubbles
	private mineSpawnTimer: Timer;
	private bubbleSpawnTimer: Timer;
	private gameOverTimer: Timer;

	// Keeps track of mines destroyed, bubbles popped, amount of time passed
	private bubblesPopped: number = 0;
	private minesDestroyed: number = 0;
	private timePassed: number = 0;

	// The padding of the world
	private worldPadding: Vec2;

	/** Scene methods */

	/**
	 * @see Scene.initScene
	 */
	public override initScene(options: Record<string, any>): void {
		this.opts = HW3SceneOptions.parseOptions(options, new HW3SceneOptions(), HW3SceneOptions.defaults);
	}
	/**
	 * @see Scene.loadScene
	 */
	public override loadScene(){
		// Load in the player car spritesheet
		this.load.spritesheet(HW3Sprites.PLAYER, "hw3_assets/spritesheets/sub.json");
		// Load in the background image
		this.load.image(HW3Sprites.BACKGROUND, "hw3_assets/sprites/WavyBlueLines.png");
		// Load in the rock sprite
		this.load.image(HW3Sprites.ROCK, "hw3_assets/sprites/SpikyMineThing.png");
	}
	/**
	 * @see Scene.startScene
	 */
	public override startScene(){
		this.worldPadding = new Vec2(this.opts.worldPadding.x, this.opts.worldPadding.y);

		// Create a background layer
		this.addLayer(HW3Layers.BACKGROUND, 0);
		this.initBackground();
		// Create a layer to serve as our main game - Feel free to use this for your own assets
		// It is given a depth of 5 to be above our background
		this.addLayer(HW3Layers.PRIMARY, 5);
		// Initialize the player
		this.initPlayer();
		// Initialize the Timers
		this.initTimers();
		// Initialize the UI
		this.initUI();
		// Initialize object pools
		this.initObjectPools();

		// Subscribe to player events
		this.receiver.subscribe(PlayerEvent.HEALTH_CHANGE);
		this.receiver.subscribe(PlayerEvent.AIR_CHANGE);
		this.receiver.subscribe(PlayerEvent.CHARGE_CHANGE);
		this.receiver.subscribe(PlayerEvent.SHOOT_LASER);
		this.receiver.subscribe(PlayerEvent.DEAD);

		// Subscribe to laser events
		this.receiver.subscribe(LaserEvents.FIRING);
		// Set the seed
		RandUtils.seed = this.opts.seed;

        if (this.opts.recording) {
		    // Start Recording
		    this.emitter.fireEvent(GameEventType.START_RECORDING, {recording: new EventRecording(HW3Scene, {seed: this.opts.seed, recording: false})});
        }
	}
	/**
	 * @see Scene.updateScene 
	 */
	public override updateScene(deltaT: number){
		this.timePassed += deltaT;
		// Handle events
		while (this.receiver.hasNextEvent()) {
			this.handleEvent(this.receiver.getNextEvent());
		}
		
		// Move the backgrounds
		this.moveBackgrounds(deltaT);

		// Handles mine and bubble collisions
		this.handleMinePlayerCollisions();
		this.bubblesPopped += this.handleBubblePlayerCollisions();

		// Handle timers
		this.handleTimers();

		// Get the viewport center and padded size
		let viewportCenter = this.viewport.getCenter().clone();
		let paddedViewportSize = this.viewport.getHalfSize().scaled(2).add(this.worldPadding.scaled(2));

		// Handle screen despawning of mines and bubbles
		for (let mine of this.mines) if (mine.visible) this.handleScreenDespawn(mine, viewportCenter, paddedViewportSize);
		for (let bubble of this.bubbles) if (bubble.visible) this.handleScreenDespawn(bubble, viewportCenter, paddedViewportSize);
	}


	/**
	 * This method helps with handling events. 
	 * 
	 * @param event the event to be handled
	 * @see GameEvent
	 */
	protected handleEvent(event: GameEvent){
		switch(event.type) {
			case PlayerEvent.SHOOT_LASER: {
				this.spawnLaser(event.data.get("src"));
				break;
			}
			case PlayerEvent.DEAD: {
				this.player.setAIActive(false, {});
				this.gameOverTimer.start();
				break;
			}
			case PlayerEvent.HEALTH_CHANGE: {
				this.handleHealthChange(event.data.get("curhp"), event.data.get("maxhp"));
				break;
			}
			case PlayerEvent.AIR_CHANGE: {
				this.handleAirChange(event.data.get("curair"), event.data.get("maxair"));
				break;
			}
			case PlayerEvent.CHARGE_CHANGE: {
				this.handleChargeChange(event.data.get("curchrg"), event.data.get("maxchrg"));
				break;
			}
			case LaserEvents.FIRING: {
				this.minesDestroyed += this.handleMineLaserCollisions(event.data.get("laser"), this.mines);
				break;
			}
			default: {
				console.warn(`Unhandled event with type ${event.type} caught in ${this.constructor.name}`);
				break;
			}
		}

	}

	/** Initialization methods */

	/** 
	 * This method initializes the player.
	 * 
	 * @remarks 
	 * 
	 * This method should add the player to the scene as an animated sprite. The player
	 * should be added to the primary layer of the scene. The player's position should 
	 * initially be set to the center of the viewport. The player should also be given
	 * a collision shape and PlayerController AI.
	 */ 
	protected initPlayer(): void {
		// Add in the player as an animated sprite
		// We give it the key specified in our load function and the name of the layer
		this.player = this.add.animatedSprite(HW3Sprites.PLAYER, HW3Layers.PRIMARY);
		
		// Set the player's position to the middle of the screen, and scale it down
		this.player.position.set(this.viewport.getCenter().x, this.viewport.getCenter().y);
		this.player.scale.set(0.4, 0.4);

		// Play the idle animation by default
		this.player.animation.play(PlayerAnimation.IDLE);

		// Give the player a smaller hitbox
		let playerCollider = new AABB(Vec2.ZERO, this.player.sizeWithZoom);
		this.player.setCollisionShape(playerCollider)

		// Add a playerController to the player
		this.player.addAI(PlayerController);
	}
	/**
	 * Initializes the UI for the HW3-Scene.
	 * 
	 * @remarks
	 * 
	 * The UI should probably be extracted out of the Scene class and put into
	 * it's own UI class, but I don't have time for that.
	 */
	protected initUI(): void {
		// UILayer stuff
		this.addUILayer(HW3Layers.UI);

		// HP Label
		this.healthLabel = <Label>this.add.uiElement(UIElementType.LABEL, HW3Layers.UI, {position: new Vec2(this.opts.hpLabelPos.x, this.opts.hpLabelPos.y), text: "HP "});
		this.healthLabel.size.set(300, 30);
		this.healthLabel.fontSize = 24;
		this.healthLabel.font = "Courier";

		// Air Label
		this.airLabel = <Label>this.add.uiElement(UIElementType.LABEL, HW3Layers.UI, {position: new Vec2(this.opts.airLabelPos.x, this.opts.airLabelPos.y), text: "Air"});
		this.airLabel.size.set(300, 30);
		this.airLabel.fontSize = 24;
		this.airLabel.font = "Courier";

		// Charge Label
		this.chrgLabel = <Label>this.add.uiElement(UIElementType.LABEL, HW3Layers.UI, {position: new Vec2(this.opts.chrgLabelPos.x, this.opts.chrgLabelPos.y), text: "Lasers"});
		this.chrgLabel.size.set(300, 30);
		this.chrgLabel.fontSize = 24;
		this.chrgLabel.font = "Courier";

		// Charge airBars
		this.chrgBarLabels = new Array(this.opts.playerControllerOptions.maxchrg);
		for (let i = 0; i < this.chrgBarLabels.length; i++) {
			let pos = new Vec2(this.opts.chrgBarPos.x + (i + 1)*(this.opts.chrgBarSize.x / this.chrgBarLabels.length), this.opts.chrgBarPos.y)
			this.chrgBarLabels[i] = <Label>this.add.uiElement(UIElementType.LABEL, HW3Layers.UI, {position: pos, text: ""});
			this.chrgBarLabels[i].size = new Vec2(this.opts.chrgBarSize.x / this.chrgBarLabels.length, this.opts.chrgBarSize.y);
			this.chrgBarLabels[i].backgroundColor = Color.GREEN;
			this.chrgBarLabels[i].borderColor = Color.BLACK;
		}

		// HealthBar
		this.healthBar = <Label>this.add.uiElement(UIElementType.LABEL, HW3Layers.UI, {position: new Vec2(this.opts.hpBarPos.x, this.opts.hpBarPos.y), text: ""});
		this.healthBar.size = new Vec2(this.opts.hpBarSize.x, this.opts.hpBarSize.y);
		this.healthBar.backgroundColor = Color.GREEN;

		// AirBar
		this.airBar = <Label>this.add.uiElement(UIElementType.LABEL, HW3Layers.UI, {position: new Vec2(this.opts.airBarPos.x, this.opts.airBarPos.y), text: ""});
		this.airBar.size = new Vec2(this.opts.airBarSize.x, this.opts.airBarSize.y);
		this.airBar.backgroundColor = Color.CYAN;

		// HealthBar Border
		this.healthBarBg = <Label>this.add.uiElement(UIElementType.LABEL, HW3Layers.UI, {position: new Vec2(this.opts.hpBarPos.x, this.opts.hpBarPos.y), text: ""});
		this.healthBarBg.size = new Vec2(this.opts.hpBarSize.x, this.opts.hpBarSize.y);
		this.healthBarBg.borderColor = Color.BLACK;

		// AirBar Border
		this.airBarBg = <Label>this.add.uiElement(UIElementType.LABEL, HW3Layers.UI, {position: new Vec2(this.opts.airBarPos.x, this.opts.airBarPos.y), text: ""});
		this.airBarBg.size = new Vec2(this.opts.airBarSize.x, this.opts.airBarSize.y);
		this.airBarBg.borderColor = Color.BLACK;

	}
	/**
	 * Initializes the timer objects for the game.
	 */
	protected initTimers(): void {
		this.mineSpawnTimer = new Timer(this.opts.mineSpawnRate);
		this.mineSpawnTimer.start();

		this.bubbleSpawnTimer = new Timer(this.opts.bubbleSpawnRate);
		this.bubbleSpawnTimer.start();

		this.gameOverTimer = new Timer(this.opts.gameOverTime);
	}
	/**
	 * Initializes the background image sprites for the game.
	 */
	protected initBackground(): void {
		this.bg1 = this.add.sprite(HW3Sprites.BACKGROUND, HW3Layers.BACKGROUND);
		this.bg1.scale.set(1.5, 1.5);
		this.bg1.position.copy(this.viewport.getCenter());

		this.bg2 = this.add.sprite(HW3Sprites.BACKGROUND, HW3Layers.BACKGROUND);
		this.bg2.scale.set(1.5, 1.5);
		this.bg2.position = this.bg1.position.clone();
		this.bg2.position.add(this.bg1.sizeWithZoom.scale(2, 0));
	}
	/**
	 * This method initializes each of the object pools for this scene.
	 * 
	 * @remarks
	 * 
	 * There are three object pools that need to be initialized before the scene 
	 * can start running. They are as follows:
	 * 
	 * 1. The bubble object-pool
	 * 2. The mine object-pool
	 * 3. The laseer object-pool
	 * 
	 * For each object-pool, if an object is not currently in use, it's visible
	 * flag will be set to false. If an object is in use, then it's visible flag
	 * will be set to true. This makes returning objects to their respective pools
	 * as simple as just setting a flag.
	 * 
	 * @see {@link https://gameprogrammingpatterns.com/object-pool.html Object-Pools} 
	 */
	protected initObjectPools(): void {
		
		// Init bubble object pool
		this.bubbles = new Array(this.opts.maxNumBubbles);
		for (let i = 0; i < this.bubbles.length; i++) {
			this.bubbles[i] = this.add.graphic(GraphicType.RECT, HW3Layers.PRIMARY, {position: new Vec2(0, 0), size: new Vec2(50, 50)});
            
            // Give the bubbles a custom shader
			this.bubbles[i].useCustomShader(BubbleShaderType.KEY);
			this.bubbles[i].visible = false;
			this.bubbles[i].color = Color.BLUE;

            // Give the bubbles AI
			this.bubbles[i].addAI(BubbleAI, this.opts.bubbleBehaviorOptions);

            // Give the bubbles a collider
			let collider = new Circle(Vec2.ZERO, 25);
			this.bubbles[i].setCollisionShape(collider);
		}

		// Init the object pool of mines
		this.mines = new Array(this.opts.maxNumMines);
		for (let i = 0; i < this.mines.length; i++){
			this.mines[i] = this.add.sprite(HW3Sprites.ROCK, HW3Layers.PRIMARY);

			// Make our mine inactive by default
			this.mines[i].visible = false;

			// Assign them mine ai
			this.mines[i].addAI(MineBehavior, this.opts.mineBehaviorOptions);

			this.mines[i].scale.set(0.3, 0.3);

			// Give them a collision shape
			let collider = new AABB(Vec2.ZERO, this.mines[i].sizeWithZoom);
			this.mines[i].setCollisionShape(collider);
		}

		// Init the object pool of lasers
		this.lasers = new Array(this.opts.maxNumLasers);
		for (let i = 0; i < this.lasers.length; i++) {
			this.lasers[i] = this.add.graphic(GraphicType.RECT, HW3Layers.PRIMARY, {position: Vec2.ZERO, size: Vec2.ZERO})
			this.lasers[i].useCustomShader(LaserShaderType.KEY);
			this.lasers[i].color = Color.RED;
			this.lasers[i].visible = false;
			this.lasers[i].addAI(LaserBehavior, {src: Vec2.ZERO, dst: Vec2.ZERO});
		}
	}

	/** Methods for spawing/despawning objects */

	/**
	 * This method attempts spawns a laser starting at the specified position
	 * 
	 * @param src - the specified starting position of the laser
	 * 
	 * @remarks
	 * 
	 * This method should attempts to retrieve a laser object from the object-pool
	 * of laser and spawn it, starting at the specified position. 
	 * 
	 * If there are no lasers in the object pool, then a laser should not be spawned. 
	 * Otherwise the laser should be spawned starting at the specified position and 
	 * go all the way to the edge of the padded viewport.
	 */
	protected spawnLaser(src: Vec2): void {
		let laser: Graphic = this.lasers.find((laser: Graphic) => { return !laser.visible; });
		if (laser) {
			laser.visible = true;
			laser.setAIActive(true, {src: src, dst: this.viewport.getHalfSize().scaled(2).add(this.worldPadding.scaled(2))});
		}
	}
	/**
	 * This method handles spawning a mine from the object-pool of mines
	 * 
	 * @remark
	 * 
	 * If there are no mines in the object-pool, then a mine shouldn't be spawned and 
	 * the mine-spawn timer should not be reset. Otherwise a mine should be spawned
	 * and the mine-spawn timer should be reset.
	 * 
	 * Mines should randomly spawn inside of the padded area of the viewport on the 
	 * right side of the screen. In addition, mines should not spawn within a
	 * a specified distance of the player (ie. we don't want mines spawning on top
	 * of the player).
	 * 
	 * A visualization of the padded viewport is shown below. o's represent valid mine
	 * spawnn locations. X's represent invalid locations.
	 * 
	 * 
	 * 					 X	 THIS IS OUT OF BOUNDS
	 * 			 _______________________________________________
	 * 			|	 THIS IS THE PADDED REGION (OFF SCREEN)		|
	 * 			|						X					X	|
	 * 			|		 _______________________________		|
	 * 			|		|								|		|
	 * 			|		|								|	o	|
	 *	 		|		|	  THIS IS THE VISIBLE		|		|
	 * 		X	|	X	|			 REGION				|	o	|   X 
	 * 			|		|								|		|
	 * 			|		|		X						|	o	|
	 * 			|		|_______________________________|		|
	 * 			|							X				X	|
	 * 			|_______________________________________________|
	 * 
	 * 							X THIS IS OUT OF BOUNDS
	 */
	protected spawnMine(): void {
		// Find the first visible rock
		let mine: Sprite = this.mines.find((rock: Sprite) => { return !rock.visible });

		if (mine){
			// Bring this rock to life
			mine.visible = true;

			// Extract the size of the viewport
			let paddedViewportSize = this.viewport.getHalfSize().scaled(2).add(this.worldPadding.scaled(2));
			let viewportSize = this.viewport.getHalfSize().scaled(2);

			// Loop on position until we're clear of the player
			mine.position = RandUtils.randVec(viewportSize.x, paddedViewportSize.x, paddedViewportSize.y - viewportSize.y, viewportSize.y);
			while(mine.position.distanceTo(this.player.position) < this.opts.mineSpawnDist){
				mine.position = RandUtils.randVec(paddedViewportSize.x, paddedViewportSize.x, 0, paddedViewportSize.y);
			}

			mine.setAIActive(true, {});
			// RockAI.SPEED += this.ROCK_SPEED_INC;
			this.mineSpawnTimer.start(this.opts.mineSpawnRate);

		}
	}
	protected spawnBubble(): void {
		let bubble: Graphic = this.bubbles.find((bubble: Graphic) => { return !bubble.visible; });

		if (bubble) {
			bubble.visible = true;
			let paddedViewportSize = this.viewport.getHalfSize().scaled(2).add(this.worldPadding.scaled(2));
			let viewportSize = this.viewport.getHalfSize().scaled(2);
			bubble.position = RandUtils.randVec(viewportSize.x / 4, viewportSize.x, viewportSize.y, paddedViewportSize.y);
			bubble.setAIActive(true, {});
		}
	}
	/**
	 * This function takes in a GameNode that may be out of bounds of the viewport and
	 * "kills" it as if it was destroyed through usual collision. This is done so that
	 * the object pools are refreshed. Once an object is off the screen, it's no longer 
	 * in use.
	 * 
	 * @param node The node to wrap around the screen
	 * @param viewportCenter The center of the viewport
	 * @param paddedViewportSize The size of the viewport with padding
	 * 
	 * @remarks
	 * 
	 * You'll notice that if you play the game without changing any of the code, rocks will 
	 * suddenly stop coming, and you'll no longer be able to fire bullets after a few click. 
	 * This is because all of those objects are still active in the scene, just out of sight, 
	 * so to our object pools we've used up all valid objects.
	 * 
	 * Keep in mind that the despawn area in this case is padded, meaning that a GameNode can 
	 * go off the side of the viewport by the padding amount in any direction before it will be 
	 * despawned. 
	 * 
	 * A visualization of the padded viewport is shown below. o's represent valid locations for 
	 * GameNodes, X's represent invalid locations.
	 * 
	 * 
	 * 					 X	 THIS IS OUT OF BOUNDS
	 * 			 _______________________________________________
	 * 			|	 THIS IS THE PADDED REGION (OFF SCREEN)		|
	 * 			|						o						|
	 * 			|		 _______________________________		|
	 * 			|		|								|		|
	 * 			|		|								|		|
	 *	 		|		|	  THIS IS THE VISIBLE		|		|
	 * 		X	|	o	|			 REGION				|	o	|   X 
	 * 			|		|								|		|
	 * 			|		|		o						|		|
	 * 			|		|_______________________________|		|
	 * 			|							o					|
	 * 			|_______________________________________________|
	 * 
	 * 							X THIS IS OUT OF BOUNDS
	 * 
	 * It may be helpful to make your own drawings while figuring out the math for this part.
	 */
	public handleScreenDespawn(node: CanvasNode, viewportCenter: Vec2, paddedViewportSize: Vec2): void {
		let vp = new AABB(viewportCenter, paddedViewportSize.clone().div(new Vec2(2, 2)));
		if (!node.collisionShape.getBoundingRect().overlaps(vp)) {
			node.visible = false;
		}
	}

	/** Methods for updating the UI */

	/**
	 * This method handles updating the player's healthbar in the UI.
	 * 
	 * @param curhp the current health of the player
	 * @param maxhp the maximum amount of health the player can have
	 * 
	 * @remarks
	 * 
	 * The player's healthbar in the UI is updated to reflect the current health
	 * of the player. The method should be called in response to a player health
	 * change event.
	 * 
	 * The player's healthbar has two components:
	 * 
	 * 1.) The actual healthbar (the colored portion)
	 * 2.) The healthbar background
	 * 
	 * The size of the healthbar background should reflect the maximum amount of
	 * health the player can have. The size of the colored healthbar should reflect
	 * the current health of the player.
	 * 
	 * If the players health is less then 1/4 of the player's maximum health, the
	 * healthbar should be colored red. If the players health is less then 3/4 of
	 * the player's maximum health but no less than 1/4e the player's maximum health, 
	 * then the healthbar should appear yellow. If the player's health is greater 
	 * than 3/4 of the player's maximum health, then the healthbar should appear green.
	 * 
	 * @see Color for more information about colors
	 * @see Label for more information about labels 
	 */
	protected handleHealthChange(curhp: number, maxhp: number): void {
		let unit = this.healthBarBg.size.x / maxhp;

		this.healthBar.size.set(this.healthBarBg.size.x - unit * (maxhp - curhp), this.healthBarBg.size.y);
		this.healthBar.position.set(this.healthBarBg.position.x - (unit / 2) * (maxhp - curhp), this.healthBarBg.position.y);

		this.healthBar.backgroundColor = curhp < maxhp * 1/4 ? Color.RED: curhp < maxhp * 3/4 ? Color.YELLOW : Color.GREEN;
	}
	/**
	 * This method handles updating the player's air-bar in the UI.
	 * 
	 * @param curair the current amount of air the player has
	 * @param maxair the maximum amount of air the player can have
	 * 
	 * @remarks
	 * 
	 * This method functions very similarly to how handleHealthChange function. The
	 * method should update the UI in response to a player-air-change event to 
	 * reflect the current amount of air the player has left.
	 * 
	 * The air-bar has two components:
	 * 
	 * 1.) The actual air-bar (the colored portion)
	 * 2.) The air-bar background
	 * 
	 * The size of the air-bar background should reflect the maximum amount of
	 * air the player can have. The size of the colored air-bar should reflect
	 * the current amount of air the player has.
	 * 
	 * Unlike the healthbar, the color of the air-bar should be a constant cyan.
	 * 
	 * @see Label for more information about labels
	 */
	protected handleAirChange(curair: number, maxair: number): void {
		let unit = this.airBarBg.size.x / maxair;
		this.airBar.size.set(this.airBarBg.size.x - unit * (maxair - curair), this.airBarBg.size.y);
		this.airBar.position.set(this.airBarBg.position.x - (unit / 2) * (maxair - curair), this.airBarBg.position.y);
	}
	/**
	 * This method handles updating the charge of player's laser in the UI.
	 * 
	 * @param curchrg the current number of charges the player's laser has
	 * @param maxchrg the maximum amount of charges the player's laser can have
	 * 
	 * @remarks
	 * 
	 * This method updates the UI to reflect the latest state of the charge
	 * of the player's laser-beam. 
	 * 
	 * Unlike the the health and air bars, the charge bar is broken up into multiple 
	 * "bars". If the player can have a maximum of N-lasers (or charges) at a time, 
	 * then the charge-bar will have N seperate components. Each component representing 
	 * a single charge of the player's laser.
	 * 
	 * Each of the N components will be colored green or red. The green components will 
	 * reflect how many charges the player's laser has available. The red components will
	 * reflect the number of bars that need to be charged.
	 * 
	 * When a player fires a laser, the rightmost green component should become red. When 
	 * the player's laser recharges, the leftmost red component should become green.
	 * 
	 * @example
	 * 
	 * Maxcharges = 4
	 * 
	 * Before firing a laser:
	 *  _______ _______ _______ _______
	 * | GREEN | GREEN | GREEN | GREEN |
	 * |_______|_______|_______|_______|
	 * 
	 * After firing a laser:
	 *  _______ _______ _______ _______
	 * | GREEN | GREEN | GREEN |  RED  |
	 * |_______|_______|_______|_______|
	 * 
	 * After firing a second laser:
	 *  _______ _______ _______ _______
	 * | GREEN | GREEN |  RED  |  RED  |
	 * |_______|_______|_______|_______|
	 * 
	 * After waiting for a recharge
	 *  _______ _______ _______ _______
	 * | GREEN | GREEN | GREEN |  RED  |
	 * |_______|_______|_______|_______|
	 * 
	 * @see Color for more information about color
	 * @see Label for more information about labels
	 */
	protected handleChargeChange(curchrg: number, maxchrg: number): void {
		for (let i = 0; i < curchrg && i < this.chrgBarLabels.length; i++) {
			this.chrgBarLabels[i].backgroundColor = Color.GREEN;
		}
		for (let i = curchrg; i < this.chrgBarLabels.length; i++) {
			this.chrgBarLabels[i].backgroundColor = Color.RED;
		}
	}

	/** Methods for collision Detection */

	/**
	 * Handles collisions between the bubbles and the player.
	 *  
	 * @return the number of collisions between the player and the bubbles in a given frame.
	 * 
	 * @remarks
	 * 
	 * The collision type is AABB to Circle. Detecting these collisions should be done using the 
	 * checkAABBtoCircleCollision() method in the HW3Scene.
	 * 
	 * Collisions between the player and bubbles should be checked during each frame. If a collision 
	 * is detected between the player and a bubble, the player should be notified of the collision via
	 * the EventQueue. The bubble should be made invisible, returning it to the bubble object pool.
	 * 
	 * @see HW3Scene.checkAABBtoCircleCollision the method to be used to check for a collision between
	 * an AABB and a Circle
	 * 
	 * @see HW3Events.PLAYER_BUBBLE_COLLISION the event to be fired when a collision between a mine 
	 * and a player is detected.
	 */
	public handleBubblePlayerCollisions(): number {
		let collisions = 0;
		for (let bubble of this.bubbles) {
			if (bubble.visible && HW3Scene.checkAABBtoCircleCollision(<AABB>this.player.collisionShape, <Circle>bubble.collisionShape)){
				bubble.visible = false;
				this.emitter.fireEvent(HW3Events.PLAYER_BUBBLE_COLLISION, {});
				collisions += 1;
			}
		}
		return collisions;
	}

	/**
	 * Handles collisions between the mines and the player. 
	 * 
	 * @return the number of collisions between mines and the players
	 * 
	 * @remarks 
	 * 
	 * The collision type is an AABB to AABB collision. Collisions between the player and the mines 
	 * need to be checked each frame.
	 * 
	 * If a collision is detected between the player and a mine, the player should be notified
	 * of the collision, and the mine should be made invisible. This returns the mine to it's
	 * respective object-pool.
	 * 
	 * @see HW3Events.PLAYER_ROCK_COLLISION the event to be fired when a collision is detected
	 * between a mine and the player
	 */
	public handleMinePlayerCollisions(): number {
		let collisions = 0;
		for (let mine of this.mines) {
			if (mine.visible && this.player.collisionShape.overlaps(mine.collisionShape)) {
				mine.visible = false;
				this.emitter.fireEvent(HW3Events.PLAYER_MINE_COLLISION, {});
				collisions += 1;
			}
		}	
		return collisions;
	}

	/**
	 * Handles collisions between a laser and the mines. 
	 * 
	 * @param laser the laser Graphic
	 * @param mines the object-pool of mines
	 * @return the number of collisions between the laser and the mines
	 * 
	 * @remarks
	 * 
	 * The collision type is an AABB to AABB, collision. Collisions between a laser and the mines only 
	 * need to be checked immediatly after the laser has been fired. 
	 * 
	 * A single laser will collide with all mines in it's path. 
	 * 
	 * If a collision is detected between a laser and a mine, the mine should
	 * be returned to it's respective object-pool. The laser should be unaffected. 
	 */
	public handleMineLaserCollisions(laser: Graphic, mines: Array<Sprite>): number {
		let collisions = 0;
		if (laser.visible) {
			for (let mine of mines) {
				if (mine.collisionShape.overlaps(laser.collisionShape)) {
					mine.visible = false;
					collisions += 1;
				}
			}
		}
		return collisions;
	}

	/**
	 * This method checks for a collision between an AABB and a circle.
	 * 
	 * @param aabb the AABB
	 * @param circle the Circle
	 * @return true if the AABB is colliding with the circle; false otherwise. 
	 * 
	 * @remarks 
	 * 
	 * Checking for a collision between an AABB and a circle is not trivial. I recommend taking a look 
	 * at the link below. I am aware that there is some sample code there. Personally, I found the diagrams
	 * to be much more intuitve to follow along with than the sample code. 
	 * 
	 * @see {@link https://learnopengl.com/In-Practice/2D-Game/Collisions/Collision-Detection#:~:text=Detecting%20collisions%20between%20a%20circle,radius%2C%20we%20have%20a%20collision AABBtoCircle}
	 * @see AABB for more information about AABBs
	 * @see Circle for more information about Circles
	 * @see MathUtils for more information about MathUtil functions
	 */
	public static checkAABBtoCircleCollision(aabb: AABB, circle: Circle): boolean {
		let dist = circle.center.clone().sub(aabb.center);
		dist.x = MathUtils.clamp(dist.x, -1*aabb.halfSize.x, aabb.halfSize.x);
		dist.y = MathUtils.clamp(dist.y, -1*aabb.halfSize.y, aabb.halfSize.y);
		dist.add(aabb.center);
		return circle.containsPoint(dist);
	}

	public handleTimers(): void {
		// If the mine timer is stopped, try to spawn a mine
		if (this.mineSpawnTimer.isStopped()) {
			this.spawnMine();
		}
		// If the bubble timer is stopped, try to spawn a bubble
		if (this.bubbleSpawnTimer.isStopped()) {
			this.spawnBubble();
		}
		// If the game-over timer has run, change to the game-over scene
		if (this.gameOverTimer.hasRun() && this.gameOverTimer.isStopped()) {
			this.emitter.fireEvent(GameEventType.STOP_RECORDING, {});
		 	this.sceneManager.changeToScene(GameOver, {
				bubblesPopped: this.bubblesPopped, 
				minesDestroyed: this.minesDestroyed,
				timePassed: this.timePassed
			}, {});
		}
	}

	/**
	 * To create the illusion of a never ending desert road, we maintain two identical background and move them as the game progresses.
	 * When one background is moved completely offscreen at the bottom, it will get moved back to the top to continue the cycle.
	 */
	protected moveBackgrounds(deltaT: number): void {
		let move = new Vec2(150, 0);
		this.bg1.position.sub(move.clone().scaled(deltaT));
		this.bg2.position.sub(move.clone().scaled(deltaT));

		let edgePos = this.viewport.getCenter().clone().add(this.bg1.sizeWithZoom.clone().scale(-2, 0));

		if (this.bg1.position.x <= edgePos.x){
			this.bg1.position = this.viewport.getCenter().clone().add(this.bg1.sizeWithZoom.clone().scale(2, 0))
		}
		if (this.bg2.position.x <= edgePos.x){
			this.bg2.position = this.viewport.getCenter().clone().add(this.bg2.sizeWithZoom.clone().scale(2, 0))
		}
	}

}