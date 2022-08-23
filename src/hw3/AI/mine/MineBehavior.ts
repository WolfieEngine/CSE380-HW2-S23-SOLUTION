import AI from "../../../Wolfie2D/DataTypes/Interfaces/AI";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import Graphic from "../../../Wolfie2D/Nodes/Graphic";
import MineBehaviorOptions from "./MineBehaviorOptions";

/**
 * A class that represents a set of behavior for the mines.
 * @author PeteyLumpkins
 */
export default class MineBehavior implements AI {
    private owner: Graphic;
    private opt: MineBehaviorOptions;

    /**
     * @see {AI.initializeAI}
     */
    initializeAI(owner: Graphic, options: Record<string, any>): void {
        this.owner = owner;
        this.activate(options);
    }
    /**
     * @see {AI.activate}
     */
    activate(options: Record<string, any>): void {
        this.opt = MineBehaviorOptions.parseOptions(options, MineBehaviorOptions.defaults);
    }
    /**
     * @see {AI.handleEvent}
     */
    handleEvent(event: GameEvent): void {
    }
    /**
     * @see {Updatable.update}
     */
    update(deltaT: number): void {
        if (this.owner.visible)
            this.owner.position.add(this.opt.dir.scaled(this.opt.speed * deltaT));
    }
    /**
     * @see {AI.destroy}
     */
    destroy(): void {
    }
}





