import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import Graphic from "../../Wolfie2D/Nodes/Graphic";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../Wolfie2D/Timing/Timer";
import { HW2Events } from "../HW2Events";

export const MineAnimations = {
    IDLE: "IDLE",
    EXPLODING: "EXPLODING"
} as const;

/**
 * A class that represents a set of behavior for the mines.
 * @author PeteyLumpkins
 */
export default class MineBehavior implements AI {
    private owner: AnimatedSprite;
    private speed: number;
    private direction: Vec2;

    /**
     * @see {AI.initializeAI}
     */
    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        this.direction = Vec2.LEFT;

        this.activate(options);
    }
    /**
     * @see {AI.activate}
     */
    activate(options: Record<string, any>): void {
        this.speed = 100;
        this.owner.animation.play(MineAnimations.IDLE, true);
    }
    /**
     * @see {AI.handleEvent}
     */
    handleEvent(event: GameEvent): void { 
        switch(event.type) {
            default: {
                throw new Error("Unhandled event in MineBehavior! Event type: " + event.type);
            }
        }
    }

    /**
     * @see {Updatable.update}
     */
    update(deltaT: number): void {
        // If the mine is visible - update the position
        if (this.owner.visible) {
            this.owner.position.add(this.direction.scaled(this.speed * deltaT));
        }
    }

    /**
     * @see {AI.destroy}
     */
    destroy(): void { 
        
    }  
    
}





