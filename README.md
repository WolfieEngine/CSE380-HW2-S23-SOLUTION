# Homework 2 - CSE 380 - Spring 2023
- Peter Walsh - peter.t.walsh@stonybrook.edu
- Professor Richard McKenna - richard@cs.stonybrook.edu
### Due Date: TBD


## Introduction
In this assignment, you will make an infinite scroller game using the Typescript programming language and the Wolfie2D game engine. By completing this assignment, you should start to become familiar with the Wolfie2D game engine and develop an understanding of:

* How to define a custom shader
* Deal with simple collision detection
* How to handle game events and use the EventQueue
* Load sprites and animated sprites 

## Getting Started

First, clone the `hw2` basecode. 


## Part 1 - Sprites
You should add the sprite you created in the first homework assignment into the game. I have added a dummy sprite with a single animation, `IDLE`, into the game as a reference.
> Don't make fun of the floating yellow barrel with windows that is my submarine. If you make fun of my art, I will make fun of yours.

Your sprite should have the following animations:
* Idle
* Move
* Hurt
* Dying
* Dead

Which animation your sprite plays will depend on the state of the player and what's going on in the scene.
- If the player is not moving (idling) then your sprite should play it's `IDLE` animation.
- If the player is moving, then your sprite should play it's `MOVING` animation.
- If the player is hit by a mine, then your sprite should cancel whatever animation it is currently playing and play the `HURT` animation.
- If the player's health reaches 0, your sprite should play it's`DYING` animation. Once it has finished playing the `DYING` animation, the scene should be notified that the game is over and your sprite should play the `DEAD` animation.

Each `AnimatedSprite` in Wolfie2D gets it's own `AnimationManager`. In order to play your sprites animations correctly, you will have to make calls to the methods exposed by the `AnimationManager`. The `AnimationManager.ts` file can be found here:
```
Wolfie2D
├── Nodes
│   ├── Sprites
│   │   ├── AnimatedSprite.ts
│   │   └── Sprite.ts
├── Rendering
    ├── Animations
        ├── AnimationManager.ts
        ├── AnimationTypes.ts
```

## Part 2 - PlayerController
A PlayerController is a piece of AI that is attached to our player's GameNode. A PlayerController is responsible for handling how the player should respond to input from the user and the rest of the game. The PlayerController is also responsible for alerting the rest of the game to changes in the state of the player. 

Inside of the `PlayerController` class, there are several TODO's for you to complete.
* Subscribing to game events
* Handling player-mine collisions
* Locking the player's position on the x-axis
* Wrapping the player's position on the y-axis

The `PlayerController` class can be found in the `PlayerController.ts` file located here:
```
src
├── hw3
│   ├── ai
        └── player
            ├── PlayerController.ts
            ├── PlayerControllerEnums.ts
            └── PlayerControllerOptions.ts
```
The files `PlayerControllerEnums.ts` and `PlayerControllerOptions.ts` define a set of enums and a set of options associated with the main `PlayerController` class, respectively. 

### 2.1 - Subscribing to Events
The PlayerController has a `Receiver` object that should be subscribed to 3 game events. You should be able to figure out which events the PlayerController's receiver should be subscribed to by looking at the rest of the code for the PlayerController. Where you subscribe to these events, is up to you. 

### 2.2 - Handling Player-Mine Collisions
You will implement the function `handleMineCollision` inside of the `PlayerController` class. The associated stub and documentation should look similar to the code shown below:
```ts
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
  // TODO
}
```
When collisions between mines and the player are detected in the main hw3 scene, the scene notifies the rest of the game that the player has collided with a mine by firing an event. How colliding with a mine changes the state of the player (if at all) is up to the PlayerController.

When a player collides with a mine, the player's health should be decremented by 1 and the UI should be notifed of the change in the player's health. After the player has been hit by a mine, the player should not take damage from colliding with mines for 2 seconds. How you do this is up to you.

### 2.3 - Player Locking 
You will implement a function called `lockPlayer` inside of the `PlayerController` class. The method stub and associated documentation should look similar to the code shown below. 
```ts
/**
 * Function for locking the player's coordinates. Player should not be able to move off the 
 * top or bottom of the screen.
 * 
 * @param player - the CanvasNode associated with the player
 * @param vpc - the coordinates of the center of the viewport
 * @param vphs - the halfsize of the viewport 
 */
protected lockPlayer(player: CanvasNode, vpc: Vec2, vphs: Vec2): void {}
```
Locking the player involves preventing the player from moving into the padded region of the viewport. In this game, the player should not be allowed to move off the screen at all along the horizontal axis (x-axis). 

For reference, a visualization of the padded viewport is shown below. The o's represent valid locations the player can move to. The X's represent invalid locations.

```
+---------------------------------------------------------------------------------------------------+
|                                                                                                   | 
|                                    X   PADDED REGION                                              | 
|                                                                                                   | 
|         +-------------------------------------------------------------------------------+         |
|         |                                      o                                        |         | 
|         |                                                                               |         | 
|        X|o                               VISIBLE REGION                                o|         | 
|         |                                                                               X         | 
|         |                                      o                                        |         | 
|         +-------------------------------------------------------------------------------+         |
|                                                                                                   | 
|                                    X   PADDED REGION                                              | 
|                                                                                                   | 
+---------------------------------------------------------------------------------------------------+
```

### 2.4 - Player Wrapping
You will implement a function called `wrapPlayer` inside of the `PlayerController` class. The method stub and associated documentation should look similar to the code shown below. 
```ts
/** 
 * Function that wraps the player's y-coordinates, if they have moved halfway into the padded
 * region of one side of the viewport.
 * 
 * @param player - the GameNode associated with the player
 * @param vpc - the coordinates of the center of the viewport
 * @param vphs - the halfsize of the viewport
 */
protected wrapPlayer(player: CanvasNode, vpc: Vec2, vphs: Vec2): void {}
```

Wrapping the player around the screen involves moving the player over from one side of the screen to the other side of the screen once the player has ventured too far into the padded region. To do his, you will have to, first, check if the player has moved halfway out of the visible region in the y-direction, then update the player's position to the opposite side of the visible region.

For reference, a visualization of the padded viewport is shown below. The o's represent locations where the player should be wrapped. The O's represent locations where the player should be wrapped to. The X's represent locations where the player shouldn't be wrapped.

Ex. the player should be wrapped from o1 -> O1, from o2 -> O2, etc. 

```
+---------------------------------------------------------------------------------------------------+
|                                                                                                   | 
|                                        PADDED REGION                                              | 
|                                                                                                   | 
|         +--------------o1----------------------------------------------O2---------------+         |
|         |                                                                               |         | 
|         |                                                                               |         | 
|         X                               VISIBLE REGION                                  X         | 
|         |                                                                               |         | 
|         |                                                                               |         | 
|         +--------------O1----------------------------------------------o2---------------+         |
|                                                                                                   | 
|                                        PADDED REGION                                              | 
|                                                                                                   | 
+---------------------------------------------------------------------------------------------------+
```

## Part 3 - The Scene
The main scene for this game is the `HW3Scene`. Again, there are several TODO's in this class for you to complete

* Handling Events
* Changing the color of the healthbar
* Despawning off-screen objects
* Detecting and handling bubble-player collisions
* Detecting AABB-Circle collisions

### 3.1 - Handling Events
Currently the `HW3Scene` ignores several events emitted by the player's controller. It is up to you to figure out how to differentiate between these events, and handle each type of event accordingly.

> The event handlers for these events have already been set up. All you have to do is connect the events and their data to the event handlers.

### 3.2 - HealthBar Color
Inside of the `HW3Scene` class there is a method called `handleHealthChange`. The method and it's associated documentation are shown below:
```ts
/**
 * This method handles updating the player's healthbar in the UI.
 * 
 * @param curhp the current health of the player
 * @param maxhp the maximum amount of health the player can have
 */
protected handleHealthChange(curhp: number, maxhp: number): void {
  let unit = this.healthBarBg.size.x / maxhp;

  this.healthBar.size.set(this.healthBarBg.size.x - unit * (maxhp - curhp), this.healthBarBg.size.y);
  this.healthBar.position.set(this.healthBarBg.position.x - (unit / 2) * (maxhp - curhp), this.healthBarBg.position.y);
}
```
Currently, the method updates the size of the healthbar in the scene's GUI to reflect the current health of the player. In addition to updating the size of the healthbar, the method should also update the color of the healthbar to reflect the current health of the player.

You should adapt the method `handleHealthChange` to change the color of the healthbar such that:

- If player's health is less than 1/4 of the player's maximum health, the healthbar should be colored red
- If the player's health is between 1/4 and 3/4 of the player's maximum health, the healthbar should be colored yellow
- If the player's health is more 3/4 of the player's maximum health, the healthbar should be colored green

> If you want strict inclusive and exlcusive bounds, go with [0, 1/4], (1/4, 3/4], and (3/4, 1]. 

### 3.3 - Bubble-Player Collisions
Implement the method `handleBubblePlayerCollisions` that checks for collisions between the Player and each of the bubbles in the scene. The method stub and associated documentation is shown below.
```ts
/**
 * Handles collisions between the bubbles and the player.
 * @return the number of collisions between the player and the bubbles in a given frame.
 */
public handleBubblePlayerCollisions(): number { return 0; }
```
- Detecting collisions between the bubbles and the player will require you to detect collisions between AABBs and Circles using the method `aabbToCircleCollision` which is a seperate TODO inside of the `HW3Scene`. 
- When a collision between the Player and a bubble is detected, an event should be fired to notify the player's controller that the player has collided with a bubble. 
- The bubble should be returned to the scene's bubble object-pool

### 3.4 - AABB-Circle Collisions
Implement the static method `aabbToCircleCollision` inside of the `HW3Scene` class. The method stub and associated documentation are shown below. 
```ts
/**
 * This method checks for a collision between an AABB and a circle.
 * 
 * @param aabb the AABB
 * @param circle the Circle
 * @return true if the AABB is colliding with the circle; false otherwise. 
 */
public static checkAABBtoCircleCollision(aabb: AABB, circle: Circle): boolean { return false; }
```
Checking for a collision between an AABB and a circle is not trivial. Here's a diagram I stole from OpenGL's official doumentation. It's a little out of context, but I think you guys can figure it out. I also recommend you have a look at the `AABB`, `Circle` and `MathUtils` classes in Wolfie2D. 

<p align="center"> <img src="https://user-images.githubusercontent.com/63989572/174504494-aca3fc9e-4b1e-4388-a60c-22ea6b4e55b5.png"></img> </p>

## Part 4 - Custom Shaders
For this part of the assignment, you will be working with two custom shaders types. 

- `BubbleShaderType` - defines the shader type for the bubbles
- `LaserShaderType` - defines the shader type for the lasers

Each shader type has a corresponding vertex and fragment shader. The `BubbleShaderType` uses the `bubble.vshader` vertex shader and `bubble.fshader` fragment shader. The `LaserShaderType` uses the `laser.vshader` vertex shader and `laser.fshader` fragment shader. The shader types and shaders can be found here:
```
.
├── dist
|   ├── hw3_assets
|       ├── shaders
|           ├── bubble.fshader
|           ├── bubble.vshader
|           ├── laser.fshader
|           └── laser.vshader
├── src
    ├── hw3
        ├── shaders
            ├── BubbleShaderType.ts
            └── LaserShaderType.ts
``` 

### 4.1 - The Bubble Shader
One of the shader's you'll be working with in this assignment is the bubble shader. Currently, the bubbles in the game are a hazy gray-ish looking color. Your job is to change the color of the bubbles to be blue-ish color. The final, blue bubbles should look similar to the image shown below:

<p align="center"> <img width="67" alt="Screen Shot 2022-06-21 at 5 17 13 PM" src="https://user-images.githubusercontent.com/63989572/174898917-5b073563-74e1-4235-96c6-db0d4f370926.png"> </p>

As far as I know, there are two ways to do this. The first way involves hard-coding the color into the fragment shader for the bubble. The second way involves passing the color of the bubble into the render method of the shader type, and then into the fragment shader. 

### 4.2 - The Laser Shader
The second shader you'll be working with is the shader for the submarine's laser beam. Inside of the `laser.fshader` file, you will find two functions in addition to the main method. 
```
/**
 *  This function generates the appropriate alpha value for the fragment color
 *  to render a laser that looks like a sine wave. The alpha value depends on 
 *  the distance of the vertex position from the sine waves curve. Positions
 *  closer to the curve of the sine wave should have a higher alpha value.
 *
 *  @param position - the position from the vertex shader (v_Position)
 *  @return - the alpha value of the fragment color
 */
float sinewave_laser(vec4 position);

/**
 *  This function generates the appropriate alpha value for the fragment shader
 *  to render a laser that is a straight line. The alpha value depends on the
 *  distance of the vertex fragments position from the midline of the lasers
 *  bounding rectangle. 
 *  
 *  @param position - the position from the vertex shader (v_Position)
 *  @param midpoint - the midline
 *  @return - the alpha value of the fragment color
 */
float linear_laser(vec4 position, float midline);
```
Your job is to implement the `sinewave_laser` function. The `sinwave_laser` function takes a single argument that should be the position of a vertex from the vertex shader (v_Position). The function computes the alpha value to be used in the fragment color for that vertex, such that the fragment shader produces a sine wave. Your laser should look similar to the laser shown in the image below:

<p align="center">
<img width="600" height="300" alt="Screen Shot 2022-06-21 at 6 42 50 PM" src="https://user-images.githubusercontent.com/63989572/174909029-f6a83757-c5f0-4b9f-a64e-57a5a6a0279b.png">
</p>

Currently, the `sinewave_laser` function just returns the result of the `linear_laser` function. The method `linear_laser` has already been implemented for you, and is there for you to reference. 



