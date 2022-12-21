import LogItem from "../../Wolfie2D/DataTypes/Playback/LogItem";
import GameEvent from "../../Wolfie2D/Events/GameEvent";

export default class HW3LogItem implements LogItem {

	/** The frame this LogItem was logged at */
	protected _frame: number;
	/** The amount of time that has passed since the previous frame */
	protected _deltaT: number;
	/** A game event that occured at during the frame */
	protected _event: GameEvent;

	/** The next LogItem */
	protected _next: HW3LogItem;
	/** The previous LogItem */
	protected _prev: HW3LogItem;

	public constructor(frame: number, deltaT: number, event: GameEvent){
		this.frame = frame;
		this.deltaT = deltaT;
		this.event = event;
	}

	/** @see LogItem.frame */
	public get frame(): number { return this._frame; }
	/** @see LogItem.deltaT */
	public get deltaT(): number { return this._deltaT; }

	protected set frame(value: number) { this._frame = value; }
	protected set deltaT(value: number) { this._deltaT = value; }

	public get event(): GameEvent { return this._event; }
	public set event(value: GameEvent) { this._event = value }

	public get next(): HW3LogItem { return this._next; }
	public set next(next: HW3LogItem) { this._next = next}

	public get prev(): HW3LogItem { return this._prev; }
	public set prev(next: HW3LogItem) { this._prev = next}
}