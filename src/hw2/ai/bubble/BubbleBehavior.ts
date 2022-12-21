import AI from "../../../Wolfie2D/DataTypes/Interfaces/AI";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import Graphic from "../../../Wolfie2D/Nodes/Graphic";
import MathUtils from "../../../Wolfie2D/Utils/MathUtils";
import { BubbleBehaviorOptions } from "./BubbleBehaviorOptions";


export default class BubbleBehavior implements AI {

    private owner: Graphic;
    private opt: BubbleBehaviorOptions;

    initializeAI(owner: Graphic, options: Record<string, any>): void {
        this.owner = owner;
        this.activate(options);
    }
    destroy(): void {}

    activate(options: Record<string, any>): void {
        this.opt = BubbleBehaviorOptions.parseOptions(options);
    }
    handleEvent(event: GameEvent): void {}

    update(deltaT: number): void {
        if (this.owner.visible) {
            // Increment the speeds
            this.opt.xcurspd += this.opt.xincspd * deltaT;
            this.opt.ycurspd += this.opt.yincspd * deltaT;
            // Clamp the speeds if need be
            this.opt.xcurspd = MathUtils.clamp(this.opt.xcurspd, this.opt.xminspd, this.opt.xmaxspd)
            this.opt.ycurspd = MathUtils.clamp(this.opt.ycurspd, this.opt.yminspd, this.opt.ymaxspd);
            // Update position of the bubble
            this.owner.position.add(Vec2.UP.scale(this.opt.ycurspd * deltaT)).add(Vec2.LEFT.scale(this.opt.xcurspd * deltaT));
        }
    }
    
}


