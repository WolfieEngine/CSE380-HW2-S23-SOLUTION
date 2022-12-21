import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import MathUtils from "../../../Wolfie2D/Utils/MathUtils";

/**
 * A class that defines a set of options to be passed to a LaserBehavior
 * @author PeteyLumpkins
 */
export default class LaserBehaviorOptions {

    /** A constant set of readonly default LaserBehaviorOptions */
    public static readonly defaults = {...new LaserBehaviorOptions()} as const;

    /** The position the laser should be fired from */
    public src: Vec2 = Vec2.ZERO;
    /** The position the laser should be fired to */
    public dst: Vec2 = Vec2.ZERO;

    /** The minimum charge of the laser */
    public minchrg: number = 0;
    /** The maximum charge of the laser */
    public maxchrg: number = 100;
    /** The current charge of the laser */
    public curchrg: number = 100;

    /** The minimum size of the laser */
    public minsize: Vec2 = new Vec2(Number.NEGATIVE_INFINITY, 10);
    /** The maximum size of the laser */
    public maxsize: Vec2 = new Vec2(Number.POSITIVE_INFINITY, 40);

    /**
     * Parses a set of options that can be passed to the LaserBehavior class
     * @param opt the set of options to parse
     * @param def a default set of LaserBeahviorOptions
     * @returns a set of LaserBehaviorOptions
     */
    public static parseOptions(opt: Record<string, any>, def: LaserBehaviorOptions): LaserBehaviorOptions {
        let res = new LaserBehaviorOptions();
        if (!opt) return res;

        res.src = opt.src ? opt.src : def.src;
        res.src.x = opt.src ? opt.src.x ? opt.src.x : def.src.x : def.src.x;
        res.src.y = opt.src ? opt.src.y ? opt.src.y : def.src.y : def.src.y;

        res.dst = opt.dst ? opt.dst : def.dst;
        res.dst.x = opt.dst ? opt.dst.x ? opt.dst.x : def.dst.x : def.dst.x;
        res.dst.y = opt.dst ? opt.dst.y ? opt.dst.y : def.dst.y : def.dst.y;

        res.minchrg = opt.minchrg ? opt.minchrg : def.minchrg;
        res.maxchrg = opt.maxchrg ? opt.maxchrg : def.maxchrg;
        res.minchrg, res.maxchrg = res.minchrg <= res.maxchrg ? (res.minchrg, res.maxchrg) : (def.minchrg, def.maxchrg);
        res.curchrg = opt.curchrg ? MathUtils.clamp(opt.curchrg, res.minchrg, res.maxchrg) : MathUtils.clamp(def.curchrg, res.minchrg, res.maxchrg);

        res.minsize.x = opt.minsize ? opt.minsize.x ? opt.minsize.x : def.minsize.x : def.minsize.x;
        res.minsize.y = opt.minsize ? opt.minsize.y ? opt.minsize.y : def.minsize.y : def.minsize.y;

        res.maxsize.x = opt.maxsize ? opt.maxsize.x ? opt.maxsize.x : def.maxsize.x : def.maxsize.x;
        res.maxsize.y = opt.maxsize ? opt.maxsize.y ? opt.maxsize.y : def.maxsize.y : def.maxsize.y;

        res.minsize.x, res.maxsize.x = res.minsize.x <= res.maxsize.x ? (res.minsize.x, res.maxsize.x) : (def.minsize.x, def.maxsize.x);
        res.minsize.y, res.maxsize.y = res.minsize.y <= res.maxsize.y ? (res.minsize.y, res.maxsize.y) : (def.minsize.y, def.maxsize.y);

        return res;
    }
}