import AI from "../../../Wolfie2D/DataTypes/Interfaces/AI";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../Wolfie2D/Events/Emitter";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import Receiver from "../../../Wolfie2D/Events/Receiver";
import Input from "../../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../../Wolfie2D/Timing/Timer";
import Viewport from "../../../Wolfie2D/SceneGraph/Viewport";
import MathUtils from "../../../Wolfie2D/Utils/MathUtils";


import { HW3Events } from "../../scenes/hw3/HW3Enums";

import { PlayerEvent, PlayerAnimation, PlayerControl } from "./PlayerControllerEnums";
import PlayerControllerOptions from "./PlayerControllerOptions";
import CanvasNode from "../../../Wolfie2D/Nodes/CanvasNode";


/**
 * A class for controlling the player. 
 * @author PeteyLumpkins
 */
export default class PlayerController implements AI {

	/** The GameNode that owns this PlayerController AI */
	private owner: AnimatedSprite;
	/** A set of PlayerControllerOptions */
	private opt: PlayerControllerOptions;

	/** A timer for charging the player's laser cannon thing */
	private laserTimer: Timer;
	/** A timer for handling the player's invincible frames */
	private invincibleTimer: Timer;

	// A receiver and emitter to hook into the event queue
	private receiver: Receiver;
	private emitter: Emitter;

	/**
	 * This method initializes all variables inside of this AI class, and sets
	 * up anything we need it do.
	 * 
	 * You should subscribe to the correct event for player damage here using the Receiver.
	 * The AI will react to the event in handleEvent() - you just need to make sure
	 * it is subscribed to them.
	 * 
	 * Also note the names of animations when calling this.owner.animation.play, you do not need to implement these parts but
	 * note that you either need to adjust the names of the animations to what you have or rename the animations where appropriate.
	 * 
	 * @param owner The owner of this AI - i.e. the player
	 * @param options The list of options for ai initialization
	 */
	public initializeAI(owner: AnimatedSprite, options: PlayerControllerOptions): void {
		this.owner = owner;

		this.receiver = new Receiver("Player");
		this.emitter = new Emitter();

		this.laserTimer = new Timer(2500, this.handleLaserTimerEnd, false);
		this.invincibleTimer = new Timer(2000);
		
		this.receiver.subscribe(HW3Events.PLAYER_BUBBLE_COLLISION);
		this.receiver.subscribe(HW3Events.PLAYER_MINE_COLLISION);
		this.receiver.subscribe(PlayerEvent.SHOOT_LASER);

		this.activate(options);
	}
	public activate(options: PlayerControllerOptions): void {
		this.opt = PlayerControllerOptions.parseOptions(options, PlayerControllerOptions.defaults);
	};
	/**
	 * Handles updates to the player 
	 * 
	 * @remarks
	 * 
	 * The PlayerController updates the player at every frame (each time the main
	 * GameLoop iterates). 
	 * 
	 * This method should handle all incoming user input events. Things like key-presses, 
	 * mouse-clicks, mouse-downs etc. In addition, this method should handle all events
	 * that the PlayerController's receiver is subscribed to.
	 * 
	 * This method is also responsible for updating the state of the player, and altering
	 * the rest of the game to changes in the state of the player. If the player's stats
	 * change, the UI needs to be notified so that it can reflect those changes. If the 
	 * player is dead, the scene needs to be notified so that it can change to GameOver scene.
	 * 
	 * @param deltaT - the amount of time that has passed since the last update
	 */
	public update(deltaT: number): void {
		while(this.receiver.hasNextEvent()){
			this.handleEvent(this.receiver.getNextEvent());
		}

		// Get the player's input direction 
		let forwardAxis = (Input.isPressed(PlayerControl.MOVE_UP) ? 1 : 0) + (Input.isPressed(PlayerControl.MOVE_DOWN) ? -1 : 0);
		let horizontalAxis = (Input.isPressed(PlayerControl.MOVE_LEFT) ? -1 : 0) + (Input.isPressed(PlayerControl.MOVE_RIGHT) ? 1 : 0);

		// Handle trying to shoot a laser from the submarine
		if (Input.isMouseJustPressed() && this.opt.curchrg > 0) {
			this.opt.curchrg -= 1;
			this.emitter.fireEvent(PlayerEvent.SHOOT_LASER, {src: this.owner.position});
			this.emitter.fireEvent(PlayerEvent.CHARGE_CHANGE, {curchrg: this.opt.curchrg, maxchrg: this.opt.maxchrg});
		}

		// Move the player
		let movement = Vec2.UP.scaled(forwardAxis * this.opt.curspd).add(new Vec2(horizontalAxis * this.opt.curspd, 0));
		this.owner.position.add(movement.scaled(deltaT));

		let vp = this.owner.getScene().getViewport();
		// Lock the players position
		this.lockPlayer(this.owner, vp.getCenter(), vp.getHalfSize());
		// Wrap the players position
		this.wrapPlayer(this.owner, vp.getCenter(), vp.getHalfSize());

		// Player looses a little bit of air each frame
		this.opt.curair = MathUtils.clamp(this.opt.curair - deltaT, this.opt.minair, this.opt.maxair);
		this.emitter.fireEvent(PlayerEvent.AIR_CHANGE, {curair: this.opt.curair, maxair: this.opt.maxair});

		// If the player is out of air - subtract from hp
		this.opt.curhp = this.opt.curair <= this.opt.minair ? MathUtils.clamp(this.opt.curhp - deltaT*2, this.opt.minhp, this.opt.maxhp) : this.opt.curhp;
		// If the player is out of air - then the players hp changed - update the UI
		this.opt.curair <= this.opt.minair && this.emitter.fireEvent(PlayerEvent.HEALTH_CHANGE, {curhp: this.opt.curhp, maxhp: this.opt.maxhp});
		// If the player is out of air and hp - then the player is dead
		this.opt.curhp <= this.opt.minhp && this.emitter.fireEvent(PlayerEvent.DEAD);
	}
	/**
	 * This method handles all events that the reciever for the PlayerController is
	 * subscribed to.
	 * 
	 * @see {AI.handleEvent}
	 * 
	 * @param event a GameEvent that the PlayerController is subscribed to
	 */
	public handleEvent(event: GameEvent): void {
		switch(event.type) {
			case HW3Events.PLAYER_BUBBLE_COLLISION: {
				this.handleBubbleCollisionEvent(event);
				break;
			}
			case HW3Events.PLAYER_MINE_COLLISION: {
				this.handleMineCollisionEvent(event);
				break;
			}
			case PlayerEvent.SHOOT_LASER: {
				this.handleShootLaserEvent(event);
				break;
			}
			default: {
				console.warn(`Unhandled event of type: ${event.type} caught in PlayerController`);
				break;
			}
		}
	}
	/**
	 * @see {AI.destroy}
	 */
	public destroy(): void {
		this.receiver.destroy()
	}

	/**
	 * This function handles a collision between a bubble and the player
	 * @param event a player-bubble collision event
	 * 
	 * @remarks 
	 * 
	 * The players current amount of air should be incremented by 1. The current amount
	 * of air should not exceed the maximum amount of air the player can have. The UI of
	 * the scene should be notified of the change to the amount of air the player has left.
	 */
	protected handleBubbleCollisionEvent(event: GameEvent): void {
		this.opt.curair = MathUtils.clamp(this.opt.curair + 1, this.opt.minair, this.opt.maxair);
		this.emitter.fireEvent(PlayerEvent.AIR_CHANGE, {curair: this.opt.curair, maxair: this.opt.maxair});
	}
	/**
	 * This function handles a collision between a mine and the player
	 * @param event a player-mine collision event
	 * 
	 * @remarks
	 * 
	 * This function decrements the player's health by 1. The player's health should not
	 * fall below the player's minimum health, and the player should become invincible. If 
	 * the player is invincible, then the player should not take any damage. 
	 */
	protected handleMineCollisionEvent(event: GameEvent): void {
		if (this.invincibleTimer.isStopped()) {
			this.opt.curhp = MathUtils.clamp(this.opt.curhp - 1, this.opt.minhp, this.opt.maxhp);
			this.emitter.fireEvent(PlayerEvent.HEALTH_CHANGE, {curhp: this.opt.curhp, maxhp: this.opt.maxhp});
			this.invincibleTimer.start();
		}
	}
	/**
	 * This function handles when the player successfully shoots a laser.
	 * @param event 
	 */
	protected handleShootLaserEvent(event: GameEvent): void {
		this.laserTimer.reset();
		this.laserTimer.start();
	}

	/**
	 * Function for locking the player's coordinates. Player should not be able to move off the 
	 * top or bottom of the screen.
	 * 
	 * @see {Viewport} for more information about the viewport
	 * 
	 * @param player - the CanvasNode associated with the player
	 * @param vpc - the coordinates of the center of the viewport
	 * @param vphs - the halfsize of the viewport 
	 */
	protected lockPlayer(player: CanvasNode, vpc: Vec2, vphs: Vec2): void {
		if (player.position.x - player.sizeWithZoom.x <= vpc.x - vphs.x) {
			player.position.x = vpc.x - vphs.x + player.sizeWithZoom.x;
		}	
		if (player.position.x + player.sizeWithZoom.x >= vpc.x + vphs.x) {
			player.position.x = vpc.x + vphs.x - player.sizeWithZoom.x;
		}
	}
	/**
	 * Function that wraps the player's y-coordinates, if they have moved halfway into the padded
	 * region of one side of the viewport.
	 * 
	 * @param player - the GameNode associated with the player
	 * @param vpc - the coordinates of the center of the viewport
	 * @param vphs - the halfsize of the viewport
	 * 
	 * @remarks
	 * 
	 * Wrapping the player around the screen involves moving the player over from one side of the screen 
	 * to the other side of the screen once the player has ventured too far into the padded region. To do
	 * this, you will have to:
	 * 
	 * 1.) Check if the player has moved halfway out of the visible region in the y-direction
	 * 2.) Update the player's position to the opposite side of the visible region
	 * 
	 * @see {Viewport} for more information about the viewport
	 * 
	 * For reference, a visualization of the padded viewport is shown below. The o's represent locations 
	 * where the player should be wrapped. The O's represent locations where the player should be wrapped to. 
	 * The X's represent locations where the player shouldn't be wrapped
	 * 
	 * Ex. the player should be wrapped from o1 -> O1, from o2 -> O2, etc. 
	 * 
	 * 
	 * 					 X	 THIS IS OUT OF BOUNDS
	 * 			 _______________________________________________
	 * 			|	 THIS IS THE PADDED REGION (OFF SCREEN)		|
	 * 			|												|
	 * 			|											    |
	 * 			|		 ___o1_______________O2_________		|
	 * 			|		|								|		|
	 * 			|		|								|		|
	 *	 		|		|	  THIS IS THE VISIBLE		|		|
	 * 		X	|	X	|			 REGION				|	X	|   X 
	 * 			|		|								|		|
	 * 			|		|		X						|		|
	 * 			|		|___O1_______________o2_________|		|
	 * 			|		   										|
	 * 			|		   						   				|
	 * 			|_______________________________________________|
	 *
	 * 							X THIS IS OUT OF BOUNDS													
	 */
	protected wrapPlayer(player: CanvasNode, vpc: Vec2, vphs: Vec2): void {
		if (player.position.y < vpc.y - vphs.y) {
			player.position.y = vpc.y + vphs.y;
		} 
		if (player.position.y > vpc.y + vphs.y) {
			player.position.y = vpc.y - vphs.y;
		}
	}

	/** 
	 * A callback function that increments the number of charges the player's laser cannon has.
	 * 
	 * @remarks 
	 * 
	 * This function 
	 * updates the total number of charges the player's laser cannon has
	 */
	protected handleLaserTimerEnd = () => {
		this.opt.curchrg = MathUtils.clamp(this.opt.curchrg + 1, this.opt.minchrg, this.opt.maxchrg);
		this.emitter.fireEvent(PlayerEvent.CHARGE_CHANGE, {curchrg: this.opt.curchrg, maxchrg: this.opt.maxchrg});
		if (this.opt.curchrg < this.opt.maxchrg) {
			this.laserTimer.start();
		}
	}

} 



