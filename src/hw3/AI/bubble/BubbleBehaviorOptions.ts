import MathUtils from "../../../Wolfie2D/Utils/MathUtils";

/**
 * A set of options to be passed to the BubbleBehavior class
 * @author PeteyLumpkins
 */
 export class BubbleBehaviorOptions {

    /** A constant set of default BubbleBehvior options */
    public static readonly defaults: BubbleBehaviorOptions = {...new BubbleBehaviorOptions()} as const;

    /** The speed of the bubble in the x-direction @defaultValue 50 */
    xcurspd: number = 50;
    /** The amount to increment the speed of the bubble in the x-direction @defaultValue 0 */
    xincspd: number = 0;
    /** The minimum speed of the bubble in the x-direction @defaultValue 50 */
    xminspd: number = 50;
    /** The maximum speed of the bubble in the x-direction @defaultValue 50 */
    xmaxspd: number = 50;
    /** The speed of the bubble in the y-direction @defaultValue 50 */
    ycurspd: number = 50;
    /** The amount to increment the speed of the bubble in the y-direction @defaultValue 0 */
    yincspd: number = 0;
    /** The minimum speed of the bubble in the y-direction @defaultValue 50 */
    yminspd: number = 50;
    /** The maximum speed of the bubble in the y-direction @defaultValue 50 */
    ymaxspd: number = 50;

    /**
     * Parses a set of options that can be passed to the BubbleBehavior class
     *
     * @param options the set of options
     * @returns a set of BubbleBehaviorOptions
     * 
     * @remarks 
     * 
     * If the argument, options, is null or undefined, then a set of default options
     * is returned. Otherwise, each of the options is checked individually. If an 
     * option is invalid, whatever the reason may be, then the option is set to the
     * default option.
     */
    public static parseOptions(options: Record<string, any>): BubbleBehaviorOptions {
        let opt = {...new BubbleBehaviorOptions()};
        let def = BubbleBehaviorOptions.defaults;

        if (!options) return opt;

        opt.xminspd = options.xminspd && typeof options.xminspd === typeof def.xminspd ? options.xminspd : def.xminspd;
        opt.xmaxspd = options.xmaxspd && typeof options.xmaxspd === typeof def.xmaxspd ? options.xmaxspd : def.xmaxspd;
        opt.xminspd, opt.xmaxspd = opt.xminspd <= opt.xmaxspd ? (opt.xminspd, opt.xmaxspd) : (def.xminspd, def.xmaxspd)
        opt.xcurspd = options.xcurspd && typeof options.xcurspd === typeof def.xcurspd ? MathUtils.clamp(options.xcurspd, opt.xminspd, opt.xmaxspd) : MathUtils.clamp(def.xcurspd, opt.xminspd, opt.xmaxspd);
        opt.xincspd = options.xincspd && typeof options.xincspd ? options.xincspd : opt.xincspd;
        
        opt.yminspd = options.yminspd && typeof options.yminspd === typeof def.yminspd ? options.yminspd : def.yminspd;
        opt.ymaxspd = options.ymaxspd && typeof options.ymaxspd === typeof def.ymaxspd ? options.ymaxspd : def.ymaxspd;
        opt.yminspd, opt.ymaxspd = opt.yminspd <= opt.ymaxspd ? (opt.yminspd, opt.ymaxspd) : (def.yminspd, def.ymaxspd);
        opt.ycurspd = options.ycurspd && typeof options.ycurspd === typeof def.ycurspd ? MathUtils.clamp(options.ycurspd, opt.yminspd, opt.ymaxspd) : MathUtils.clamp(def.ycurspd, opt.yminspd, opt.ymaxspd);
        opt.yincspd = options.yincspd && typeof options.yincspd === typeof def.yincspd ? options.yincspd : opt.yincspd;

        return opt;
    }
}