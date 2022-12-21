import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";

/**
 * A class that defines a set of options that can be passed to the MineBehavior class
 * @author PeteyLumpkins
 */
export default class MineBehaviorOptions {

    /** A constant set of readonly default MineBehaviorOptions */
    public static readonly defaults = {...new MineBehaviorOptions()} as const;

    /** The direction the mines should move @defaultValue Vec2.LEFT */
    public dir : Vec2 = Vec2.LEFT;

    /** The speed the mines should move at @defaultValue 100 */
    public speed : number = 100;

    /**
     * Parses a set of options that can be passed to the MineBehavior class
     * @param opt - the options to be parsed.
     * @param def - a set of default MineBehaviorOptions.
     * @return - a valid set of MineBehaviorOptions.
     * 
     * @remarks 
     * 
     * If options is null or undefined, then a default set of options is returned.
	 * 
	 * If an option in the options is missing, is of the incorrect type, or there is 
	 * something wrong with the provided option, then the corresponding default option 
	 * is used. Default option values and types are defined above.
     */
    public static parseOptions(opt: Record<string, any>, def: MineBehaviorOptions): MineBehaviorOptions {
        let res: MineBehaviorOptions = {...new MineBehaviorOptions()}
        if (!opt) return res;
        res.dir = opt.dir && typeof opt.dir === typeof opt.dir ? opt.dir : def.dir;
        res.speed = opt.speed && typeof opt.speed === typeof opt.speed ? opt.speed : def.speed;
        return res;
    }
}