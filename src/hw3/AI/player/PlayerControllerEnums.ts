/**
 * A set of player animations
 */
export enum PlayerAnimation {
	IDLE = "IDLE",
}

/**
 * A set of events that can be fired from a PlayerController
 */
export enum PlayerEvent {
	HEALTH_CHANGE = "HEALTH_CHANGE",
    CHARGE_CHANGE = "CHARGE_CHANGE",
	AIR_CHANGE = "AIR_CHANGE",
	DEAD = "DEAD",
	SHOOT_LASER = "SHOOT_LASER"
}

/**
 * A set of input controls for the PlayerController
 */
export enum PlayerControl {
	MOVE_UP = "MOVE_UP",
	MOVE_DOWN = "MOVE_DOWN",
	MOVE_RIGHT = "MOVE_RIGHT",
	MOVE_LEFT = "MOVE_LEFT",
}