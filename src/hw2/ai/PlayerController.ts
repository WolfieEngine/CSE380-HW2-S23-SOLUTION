import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../Wolfie2D/Events/Emitter";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../Wolfie2D/Timing/Timer";
import Viewport from "../../Wolfie2D/SceneGraph/Viewport";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";

import { HW2Events } from "../HW2Events";
import { HW2Controls } from "../HW2Controls";

import CanvasNode from "../../Wolfie2D/Nodes/CanvasNode";

export const PlayerAnimations = {
    IDLE: "IDLE",
    HIT: "HIT",
    DEATH: "DEATH"
} as const;


/**
 * A class for controlling the player in the HW2Scene.
 * @author PeteyLumpkins
 */
export default class PlayerController implements AI {
	/** The GameNode that owns this PlayerController AI */
	private owner: AnimatedSprite;

    private currentHealth: number;
    private maxHealth: number;
    private minHealth: number;

    private currentAir: number;
    private maxAir: number;
    private minAir: number;

    private currentSpeed: number;

    private currentCharge: number;
    private maxCharge: number;
    private minCharge: number;

	/** A timer for charging the player's laser cannon thing */
	private laserTimer: Timer;
	/** A timer for handling the player's invincible frames */
	private invincibleTimer: Timer;

	// A receiver and emitter to hook into the event queue
	private receiver: Receiver;
	private emitter: Emitter;

	/**
	 * This method initializes all variables inside of this AI class.
     * 
	 * @param owner The owner of this AI - i.e. the player
	 * @param options The list of options for ai initialization
	 */
	public initializeAI(owner: AnimatedSprite, options: Record<string,any>): void {
		this.owner = owner;

		this.receiver = new Receiver();
		this.emitter = new Emitter();

		this.laserTimer = new Timer(2500, this.handleLaserTimerEnd, false);
		this.invincibleTimer = new Timer(2000);
		
        // TODO Subscribing to events from the scene
		this.receiver.subscribe(HW2Events.SHOOT_LASER);

		this.activate(options);
	}
	public activate(options: Record<string,any>): void {
		// Set the player's current health
        this.currentHealth = 10;

        // Set upper and lower bounds on the player's health
        this.minHealth = 0;
        this.maxHealth = 10;

        // Set the player's current air
        this.currentAir = 20;

        // Set upper and lower bounds on the player's air
        this.minAir = 0;
        this.maxAir = 20;

        this.currentCharge = 4;
        this.minCharge = 0;
        this.maxCharge = 4;

        // Set the player's movement speed
        this.currentSpeed = 300

        // Play the idle animation by default
		this.owner.animation.play(PlayerAnimations.IDLE);
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
        // First, handle all events 
		while(this.receiver.hasNextEvent()){
			this.handleEvent(this.receiver.getNextEvent());
		}

        // If the player is out of hp - play the death animation
		if (this.currentHealth <= this.minHealth) { 
            this.owner.animation.playIfNotAlready(PlayerAnimations.DEATH, false, HW2Events.DEAD);
            return;
        }

		// Get the player's input direction 
		let forwardAxis = (Input.isPressed(HW2Controls.MOVE_UP) ? 1 : 0) + (Input.isPressed(HW2Controls.MOVE_DOWN) ? -1 : 0);
		let horizontalAxis = (Input.isPressed(HW2Controls.MOVE_LEFT) ? -1 : 0) + (Input.isPressed(HW2Controls.MOVE_RIGHT) ? 1 : 0);

		// Handle trying to shoot a laser from the submarine
		if (Input.isMouseJustPressed() && this.currentCharge > 0) {
			this.currentCharge -= 1;
			this.emitter.fireEvent(HW2Events.SHOOT_LASER, {src: this.owner.position});
			this.emitter.fireEvent(HW2Events.CHARGE_CHANGE, {curchrg: this.currentCharge, maxchrg: this.maxCharge});
		}

		// Move the player
		let movement = Vec2.UP.scaled(forwardAxis * this.currentSpeed).add(new Vec2(horizontalAxis * this.currentSpeed, 0));
		this.owner.position.add(movement.scaled(deltaT));

		let vp = this.owner.getScene().getViewport();

		// Lock the players position 
		this.lockPlayer(this.owner, vp.getCenter(), vp.getHalfSize());
		// Wrap the players position
		this.wrapPlayer(this.owner, vp.getCenter(), vp.getHalfSize());

		// Player looses a little bit of air each frame
		this.currentAir = MathUtils.clamp(this.currentAir - deltaT, this.minAir, this.maxAir);

		// If the player is out of air - start subtracting from the player's health
		this.currentHealth = this.currentAir <= this.minAir ? MathUtils.clamp(this.currentHealth - deltaT*2, this.minHealth, this.maxHealth) : this.currentHealth;
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
			case HW2Events.SHOOT_LASER: {
				this.handleShootLaserEvent(event);
				break;
			}
            case HW2Events.PLAYER_WAS_HIT: {
                this.handlePlayerHitEvent(event);
                break;
            }
			default: {
				throw new Error(`Unhandled event of type: ${event.type} caught in PlayerController`);
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
		this.currentAir = MathUtils.clamp(this.currentAir + 1, this.minAir, this.maxAir);
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
            this.owner.animation.playIfNotAlready(PlayerAnimations.HIT, false, HW2Events.PLAYER_WAS_HIT);
			this.currentHealth = MathUtils.clamp(this.currentHealth - 1, this.minHealth, this.maxHealth);
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
    
    protected handlePlayerHitEvent(event: GameEvent): void {
        this.owner.animation.play(PlayerAnimations.IDLE, true);
    }

	/**
	 * Function for locking the player's coordinates. Player should not be able to move off the 
	 * left or right side of the screen.
	 * 
	 * @see {Viewport} for more information about the viewport
	 * 
	 * @param player - the CanvasNode associated with the player
	 * @param vpc - the coordinates of the center of the viewport
	 * @param vphs - the halfsize of the viewport 
	 */
	protected lockPlayer(player: CanvasNode, vpc: Vec2, vphs: Vec2): void {
		// TODO prevent the player from moving off the left/right side of the screen
	}
	/**
	 * Function that wraps the player's y-coordinates, if they have moved halfway into the padded
	 * region of one side of the viewport.
	 * 
	 * @param player - the GameNode associated with the player
	 * @param viewportCenter - the coordinates of the center of the viewport
	 * @param viewportHalfSize - the halfsize of the viewport
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
	protected wrapPlayer(player: CanvasNode, viewportCenter: Vec2, viewportHalfSize: Vec2): void {
		// TODO wrap the player around the top/bottom of the screen
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
		this.currentCharge = MathUtils.clamp(this.currentCharge + 1, this.minCharge, this.maxCharge);
		this.emitter.fireEvent(HW2Events.CHARGE_CHANGE, {curchrg: this.currentCharge, maxchrg: this.maxCharge});
		if (this.currentCharge < this.maxCharge) {
			this.laserTimer.start();
		}
	}

} 



