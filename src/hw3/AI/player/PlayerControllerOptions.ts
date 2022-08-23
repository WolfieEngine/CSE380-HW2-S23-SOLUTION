import MathUtils from "../../../Wolfie2D/Utils/MathUtils";

/**
 * A class defining a set of options that can be passed to a PlayerController.
 * @author PeteyLumpkins
 */
export default class PlayerControllerOptions {

    /** A constant set of default PlayerControllerOptions */
    public static readonly defaults: PlayerControllerOptions = {...new PlayerControllerOptions()} as const;

	/** The current amount of health the player has @defaultValue 10 */
	public curhp: number = 10;
	/** The minimum amount of health a player can have @defaultValue 0 */
	public minhp: number = 0;
	/** The maximum amount of health a player can have @defaultValue 10 */
	public maxhp: number = 10;

	/** The current amount of air a player has @defaultValue 20 */
	public curair: number = 20;
	/** The minimum amount of air a player can have @defaultValue 0 */
	public minair: number = 0;
	/** The maximum amount of air a player can have @defaultValue 20 */
	public maxair: number = 20;

	/** The current movement speed of the player @defaultValue 300*/
	public curspd: number = 300;
	/** The minimum movement speed of the player @defaultValue 300*/
	public minspd: number = 300;
	/** The maximum movement speed of the player @defaultValue 500 */
	public maxspd: number = 500;

	/** The current charge of the player's laser @defaultValue 4 */
	public curchrg: number = 4;
	/** The minimum charge of the player's laser @defaultValue 0 */
	public minchrg: number = 0;
	/** The maximum charge of the player's laser @defaultValue 4 */
	public maxchrg: number = 4;

	/**
	 * Parses a set of options that can be passed to the PlayerController.
     * @param opt the set options to be parsed
	 * @param def a set of default PlayerControllerOptions
	 * @returns a set of PlayerControllerOptions
	 * 
	 * @remarks
	 * 
	 * - If options is null or undefined, then a default set of options are returned
	 * 
	 * - If an option in the options is missing, is of the incorrect type, or there is 
	 * something wrong with the provided option, then the corresponding default option 
	 * is used. Default option values are defined in the PlayerControllerOptions class.
	 * 
	 * - For min and max values, if the min > max then the corresponding default 
	 * values are used. Starting values should be clamped within the min and max values.
	 */
	public static parseOptions(opt: Record<string, any>, def: PlayerControllerOptions): PlayerControllerOptions {
		let res: PlayerControllerOptions = {...def};
		if (!opt) return res;

		res.minhp = opt.minhp && typeof opt.minhp === typeof def.minhp ? opt.minhp : def.minhp,
		res.maxhp = opt.maxhp && typeof opt.maxhp === typeof def.maxhp ? opt.maxhp : def.maxhp,
		res.minhp, res.maxhp = res.minhp <= res.maxhp ? (res.minhp, res.maxhp) : (def.minhp, def.maxhp);
		res.curhp = opt.curhp && typeof opt.curhp === typeof def.curhp ? MathUtils.clamp(opt.curhp, res.minhp, res.maxhp) : MathUtils.clamp(def.curhp, res.minhp, res.maxhp);

		res.minair = opt.minair && typeof opt.minair === typeof def.minair ? opt.minair : def.minair;
		res.maxair = opt.maxair && typeof opt.maxair === typeof def.maxair ? opt.maxair : def.maxair;
		res.minair, res.maxair = res.minair <= res.maxair ? (res.minair, res.maxair) : (def.minair, def.maxair);
		res.curair = opt.curair && typeof opt.curair === typeof def.curair ? MathUtils.clamp(opt.curair, res.minair, res.maxair) : MathUtils.clamp(def.curair, res.minair, res.maxair);

		res.minspd = opt.minspd && typeof opt.minspd === typeof def.minspd ? opt.minspd : def.minspd;
		res.maxspd = opt.maxspd && typeof opt.maxspd === typeof def.maxspd ? opt.maxspd : def.maxspd;
		res.minspd, res.maxspd = res.minspd <= res.maxspd ? (res.minspd, res.maxspd) : (def.minspd, def.maxspd); 
		res.curspd = opt.curspd && typeof opt.curspd === typeof def.curspd ? MathUtils.clamp(opt.curspd, res.minspd, res.maxspd) : MathUtils.clamp(def.curspd, res.minspd, res.maxspd);

		return res;
	}
}