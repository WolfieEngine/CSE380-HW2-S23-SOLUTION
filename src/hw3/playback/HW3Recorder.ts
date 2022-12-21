import Receiver from "../../Wolfie2D/Events/Receiver";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Recorder from "../../Wolfie2D/DataTypes/Playback/Recorder";
import Updateable from "../../Wolfie2D/DataTypes/Interfaces/Updateable";
import HW3Recording from "./HW3Recording";
import HW3LogItem from "./HW3LogItem";


/**
 * A recorder for the HW3Recording. 
 * @see Recorder
 */
export default class HW3Recorder implements Recorder<HW3Recording, HW3LogItem> {
	private _active: boolean;
	private _receiver: Receiver;
	private _frame: number;
	private _recording: HW3Recording;

	public constructor(){
		this._receiver = new Receiver();
		this._frame = 0;
		this._recording = null;
		this._active = false;

		this._receiver.subscribe(
			[GameEventType.MOUSE_DOWN, GameEventType.MOUSE_UP, GameEventType.MOUSE_MOVE, 
			GameEventType.KEY_DOWN, GameEventType.KEY_UP, GameEventType.CANVAS_BLUR,
			GameEventType.WHEEL_DOWN, GameEventType.WHEEL_UP]
		);
	}

    /**
     * @see Updateable.update
     */
	public update(deltaT: number): void {

		if (!this._active) { this._receiver.ignoreEvents(); }
		else {
			this._frame += 1;
			while(this._receiver.hasNextEvent()){
				this._recording.enqueue(new HW3LogItem(this._frame, deltaT, this._receiver.getNextEvent()));
			}
		}
	}
    /**
     * @see Recorder.start
     */
	public start(recording: HW3Recording): void {
		this._active = true;
		this._frame = 0;
		this._recording = recording;
	}
    /**
     * @see Recorder.stop
     */
	public stop(): void {
		this._active = false;
	}
    /**
     * @see Recorder.active
     */
	public active(): boolean {
		return this._active;
	}
    /**
     * Destroy the HW3Recorder
     */
    public destroy(): void {
        this._receiver.destroy();
    }
}