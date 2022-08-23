/**
 * A set of layers for a HW3Scene
 */
 export enum HW3Layers {
	PRIMARY = "PRIMARY",
	BACKGROUND = "BACKGROUND", 
	UI = "UI"
}

/**
 * A set of sprite keys for the sprites in a HW3Scene
 */
export enum HW3Sprites {
	PLAYER = "PLAYER", 
	ROCK = "ROCK", 
	BACKGROUND = "BACKGROUND"
}

/**
 * A set of events that the Scene can emit
 */
export enum HW3Events {
	PLAYER_MINE_COLLISION = "PLAYER_MINE_COLLISION", 
	PLAYER_BUBBLE_COLLISION = "PLAYER_BUBBLE_COLLISION"
}