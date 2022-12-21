import AI from "../../../Wolfie2D/DataTypes/Interfaces/AI";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import Graphic from "../../../Wolfie2D/Nodes/Graphic";

/**
 * A class that represents a set of behavior for the mines.
 * @author PeteyLumpkins
 */
export default class MineBehavior implements AI {
    private owner: Graphic;

    private speed: number;
    private direction: Vec2;

    /**
     * @see {AI.initializeAI}
     */
    initializeAI(owner: Graphic, options: Record<string, any>): void {
        this.owner = owner;
        this.direction = Vec2.LEFT;
        this.activate(options);
    }
    /**
     * @see {AI.activate}
     */
    activate(options: Record<string, any>): void {
        this.speed = 100;
    }
    /**
     * @see {AI.handleEvent}
     */
    handleEvent(event: GameEvent): void { }
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
    destroy(): void { }
}





