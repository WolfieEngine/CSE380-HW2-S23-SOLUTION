import RandUtils from "../../../Wolfie2D/Utils/RandUtils";
import { BubbleBehaviorOptions } from "../../AI/bubble/BubbleBehaviorOptions";
import LaserBehaviorOptions from "../../AI/laser/LaserBehaviorOptions";
import MineBehaviorOptions from "../../AI/mine/MineBehaviorOptions";
import PlayerControllerOptions from "../../AI/player/PlayerControllerOptions";

/**
 * A set of options to be passed to a HW3Scene
 * @author PeteyLumpkins
 */
export default class HW3SceneOptions {

    /** A constant set of default HW3SceneOptions */
    public static defaults: HW3SceneOptions = {...new HW3SceneOptions()} as const;

    /** @see PlayerControllerOptions */
    playerControllerOptions: PlayerControllerOptions = new PlayerControllerOptions();

    /** @see BubbleBehaviorOptions */
    bubbleBehaviorOptions: BubbleBehaviorOptions = new BubbleBehaviorOptions();

    /** @see MineBehaviorOptions */
    mineBehaviorOptions: MineBehaviorOptions = new MineBehaviorOptions();

    /** @see LaserBehaviorOptions */
    laserBehaviorOptions: LaserBehaviorOptions = new LaserBehaviorOptions();

    /** The maximum number of mines in the scenes mine object pool @defaultValue 15 */
    maxNumMines: number = 15;

    /** The maximum number of bubbles in the scenes bubble object pool @defaultValue 10 */
    maxNumBubbles: number = 10;

    /** The maximum number of lasers in the scenes laser object pool @defaultValue 4 */
    maxNumLasers: number = 4;

    /** The minimum spawn distance a mine can spawn from the player @defaultValue 100 */
    mineSpawnDist: number = 100;

    /** The spawn rate of mines in the scene (milliseconds) @defaultValue 500 */
    mineSpawnRate: number = 500;

    /** The spawn rate of bubbles in the scene (milliseconds) @defaultValue 2500 */
    bubbleSpawnRate: number = 2500;

    /** The duration of the game-over timer (milliseconds) @defaultValue 3000 */
    gameOverTime: number = 3000;

    /** The center position of the health label @defaultValue {x: 50, y: 50} */
    hpLabelPos: Record<string, number> = {x: 50, y: 50};

    /** The center position of the health bar @defaultValue {x: 225, y: 50} */
    hpBarPos: Record<string, number> = {x: 225, y: 50};

    /** The size of the health bar @defaultValue {x: 300, y: 25} */
    hpBarSize: Record<string, number> = {x: 300, y: 25};

    /** The center position off the air label @defaultValue {x: 50, y: 100}*/
    airLabelPos: Record<string, number> = {x: 50, y: 100};

    /** The center position of the air bar @defaultValue {x: 225, y: 100} */
	airBarPos: Record<string, number> = {x: 225, y: 100};

    /** The size of the air bar @defaultValue {x: 300, y: 25} */
	airBarSize: Record<string, number> = {x: 300, y: 25};

    /** The center position of the laser charge label @defaultValue {x: 500, y: 50} */
    chrgLabelPos: Record<string, number> = {x: 475, y: 50};

    /** The center position of the laser charge bar @defaultValue {x: 500, y: 50} */
    chrgBarPos: Record<string, number> = {x: 500, y: 50};

    /** The size of the charge bar @defaultValue {x: 300, y: 25} */
    chrgBarSize: Record<string, number> = {x: 300, y: 25};

    /** The size of the world padding @defaultValue {x: 64, y: 64} */
    worldPadding: Record<string, number> = {x: 64, y: 64};

    /** The seed @defaultValue {@link RandUtils.randomSeed()} */
    seed: string = RandUtils.randomSeed();

    /**
     * Attempts to parse a set of options to be passed to the HW3Scene.
     * 
     * @param opt the set of options to be parsed
     * @param def a set of default HW3SceneOptions
     * @returns a valid set of HW3SceneOptions
     */
    public static parseOptions(opt: Record<string, any>, res: HW3SceneOptions, def: HW3SceneOptions): HW3SceneOptions {
        if (!opt) return res;

        res.playerControllerOptions = PlayerControllerOptions.parseOptions(opt.playerControllerOptions, def.playerControllerOptions);
        res.bubbleBehaviorOptions = BubbleBehaviorOptions.parseOptions(opt.bubbleBehaviorOptions);
        res.mineBehaviorOptions = MineBehaviorOptions.parseOptions(opt.mineBehaviorOptions, def.mineBehaviorOptions);
        res.laserBehaviorOptions = LaserBehaviorOptions.parseOptions(opt.laserBehaviorOptions, def.laserBehaviorOptions);

        res.maxNumMines ? opt.maxNumMines : def.maxNumMines;
        res.maxNumBubbles ? opt.maxNumBubbles : def.maxNumBubbles;
        res.maxNumLasers ? opt.maxNumLasers : def.maxNumLasers;

        res.mineSpawnRate ? opt.mineSpawnRate : def.mineSpawnRate;
        res.bubbleSpawnRate ? opt.bubbleSpawnRate : def.bubbleSpawnRate;
        res.gameOverTime ? opt.gameOverTime : def.gameOverTime;

        // HP label position
        res.hpLabelPos = opt.hpLabelPos ? opt.hpLabelPos : def.hpLabelPos;
        res.hpLabelPos.x = res.hpLabelPos.x ? res.hpLabelPos.x : def.hpLabelPos.x;
        res.hpLabelPos.y = res.hpLabelPos.y ? res.hpLabelPos.y : def.hpLabelPos.y;
        // HP bar position
        res.hpBarPos = opt.hpBarPos ? opt.hpBarPos : def.hpBarPos;
        res.hpBarPos.x = res.hpBarPos.x ? res.hpBarPos.x : def.hpBarPos.x;
        res.hpBarPos.y = res.hpBarPos.y ? res.hpBarPos.y : def.hpBarPos.y;
        // HP bar size
        res.hpBarSize = res.hpBarSize ? res.hpBarSize : def.hpBarSize;
        res.hpBarSize.x = res.hpBarSize.x ? res.hpBarSize.x : def.hpBarSize.x;
        res.hpBarSize.y = res.hpBarSize.y ? res.hpBarSize.y : def.hpBarSize.y;

        // Air label position
        res.airLabelPos = res.airLabelPos ? res.airLabelPos : def.airLabelPos;
        res.airLabelPos.x = res.airLabelPos.x ? res.airLabelPos.x : def.airLabelPos.x;
        res.airLabelPos.y = res.airLabelPos.y ? res.airLabelPos.y : def.airLabelPos.y;
        // Air bar position
        res.airBarPos = res.airBarPos ? res.airBarPos : def.airBarPos;
        res.airBarPos.x = res.airBarPos.x ? res.airBarPos.x : def.airBarPos.x;
        res.airBarPos.y = res.airBarPos.y ? res.airBarPos.y : def.airBarPos.y;
        // Air bar size
        res.airBarSize = res.airBarSize ? res.airBarSize : def.airBarSize;
        res.airBarSize.x = res.airBarSize.x ? res.airBarSize.x : def.airBarSize.x;
        res.airBarSize.y = res.airBarSize.y ? res.airBarSize.y : def.airBarSize.y

        // Charge label position
        res.chrgLabelPos = res.chrgLabelPos ? res.chrgLabelPos : def.chrgLabelPos;
        res.chrgLabelPos.x = res.chrgLabelPos.x ? res.chrgLabelPos.x : def.chrgLabelPos.x;
        res.chrgLabelPos.y = res.chrgLabelPos.y ? res.chrgLabelPos.y : def.chrgLabelPos.y
        // Charge bar position
        res.chrgBarPos = res.chrgBarPos ? res.chrgBarPos : def.chrgBarPos;
        res.chrgBarPos.x = res.chrgBarPos.x ? res.chrgBarPos.x : def.chrgBarPos.x;
        res.chrgBarPos.y = res.chrgBarPos.y ? res.chrgBarPos.y : def.chrgBarPos.y;
        // Charge bar size
        res.chrgBarSize = res.chrgBarSize ? res.chrgBarSize : def.chrgBarSize;
        res.chrgBarSize.x = res.chrgBarSize.x ? res.chrgBarSize.x : def.chrgBarSize.x;
        res.chrgBarSize.y = res.chrgBarSize.y ? res.chrgBarSize.y : def.chrgBarSize.y;

        // World Padding
        res.worldPadding = opt.worldPadding ? opt.worldPadding : def.worldPadding;
        res.worldPadding.x = res.worldPadding.x ? res.worldPadding.x : def.worldPadding.x;
        res.worldPadding.y = res.worldPadding.y ? res.worldPadding.y : def.worldPadding.y;

        // Seed
        res.seed = opt.seed ? opt.seed : def.seed;

        return res;
    }

}