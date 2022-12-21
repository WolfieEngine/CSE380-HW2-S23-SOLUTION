import AI from "../../../Wolfie2D/DataTypes/Interfaces/AI";
import AABB from "../../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../Wolfie2D/Events/Emitter";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import Graphic from "../../../Wolfie2D/Nodes/Graphic";
import MathUtils from "../../../Wolfie2D/Utils/MathUtils";

import LaserBehaviorOptions from "./LaserBehaviorOptions";

/**
 * Events that can be fired by a laser
 */
export enum LaserEvents {
    FIRING = "LASER_FIRING"
}

/**
 * A class representing the behavior for a laser beam
 * @author PeteyLumpkins
 */
export default class LaserBehavior implements AI {

    private owner: Graphic;
    private opts: LaserBehaviorOptions;
    private emitter: Emitter;

    /**
     * @see AI.initializeAI
     */
    public initializeAI(owner: Graphic, options: Record<string, any>): void {
        this.owner = owner;
        this.emitter = new Emitter();
        this.activate(options);
    }
    /**
     * @see AI.activate
     */
    public activate(options: Record<string, any>): void {
        this.opts = LaserBehaviorOptions.parseOptions(options, LaserBehaviorOptions.defaults);
        this.opts.curchrg = this.opts.maxchrg;
        // Set position of the laser
        this.owner.position.x = (this.opts.dst.x + this.opts.src.x) / 2
        this.owner.position.y = this.opts.src.y;
        // Set size of the laser
        this.owner.size.x = this.opts.dst.x - this.opts.src.x;
        this.owner.size.y = MathUtils.changeRange(this.opts.curchrg, this.opts.minchrg, this.opts.maxchrg, this.opts.minsize.y, this.opts.maxsize.y);
        // Set the collision shape of the laser - it will be different each time the laser is fired
        this.owner.collisionShape = new AABB(this.owner.position.clone(), this.owner.size.clone().div(new Vec2(2, 2)));
    }
    /**
     * @see AI.update 
     */
    public update(deltaT: number): void {
        if (this.owner.visible) {
            // Update the owner's position and size based on laser src
            this.owner.position.x = (this.opts.dst.x + this.opts.src.x) / 2
            this.owner.position.y = this.opts.src.y;
            this.owner.size.x = this.opts.dst.x - this.opts.src.x;

            // Change laser's size based on the current charge
            // this.owner.size.y = MathUtils.changeRange(this.opts.curchrg, this.opts.minchrg, this.opts.maxchrg, this.opts.minsize.y, this.opts.maxsize.y);
            console.log(this.owner.size.y);
            // Set alpha of the laser 
            this.owner.alpha = MathUtils.changeRange(this.opts.curchrg, this.opts.minchrg, this.opts.maxchrg, 0, 1);
            // If this is the first time the laser is fired - send the firing event.
            if (this.opts.curchrg === this.opts.maxchrg) this.emitter.fireEvent(LaserEvents.FIRING, {laser: this.owner});
            // Update the value of the charge on the laser
            this.opts.curchrg = MathUtils.clamp(this.opts.curchrg - 1, this.opts.minchrg, this.opts.maxchrg);
            // If the laser is all out of juice - make it invisible
            if (this.opts.curchrg <= this.opts.minchrg) this.owner.visible = false;
        }
    }   
    /**
     * @see AI.handleEvent
     */
    public handleEvent(event: GameEvent): void {

    }
    /**
     * @see AI.destroy
     */
    public destroy(): void {
        
    }
}
