import Receiver from "../../Wolfie2D/Events/Receiver";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Recorder from "../../Wolfie2D/DataTypes/Playback/Recorder";
import EventRecording from "./EventRecording";
import EventLogItem from "./EventLogItem";


// @ignorePage

export default class EventRecorder implements Recorder<EventRecording, EventLogItem> {
	private _active: boolean;
	private _receiver: Receiver;
	private _frame: number;
	private _recording: EventRecording;

	constructor(){
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

	public update(deltaT: number): void {

		if (!this._active) { this._receiver.ignoreEvents(); }
		else {
			this._frame += 1;
			while(this._receiver.hasNextEvent()){
				this._recording.enqueue(new EventLogItem(this._frame, deltaT, this._receiver.getNextEvent()));
			}
		}
	}

	public start(recording: EventRecording): void {
		this._active = true;
		this._frame = 0;
		this._recording = recording;
	}

	public stop(): void {
		this._active = false;
	}

	public active(): boolean {
		return this._active;
	}
}