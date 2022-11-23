import Scene from "../../Wolfie2D/Scene/Scene";
import EventLogItem from "./EventLogItem";
import EventRecorder from "./EventRecorder";
import EventReplayer from "./EventReplayer";
import Recording from "../../Wolfie2D/DataTypes/Playback/Recording";
import Queue from "../../Wolfie2D/DataTypes/Interfaces/Queue";

/**
 * A class representing a recording of a slice of a game.
 */
export default class EventRecording implements Recording<EventLogItem>, Queue<EventLogItem> {

    /** The initial scene that the recording starts from. */
    private _scene: new (...args: any) => Scene;
    /** The state of the initial scene that the recording starts from. */
    private _init: Record<string, any>;
    /** The sentinal node */
    private _sent: EventLogItem;
    /** The number of items in the recording */
    private _size: number;


    public constructor(scene: new (...args: any) => Scene, init: Record<string, any> = {}) {
        this._scene = scene;
        this._init = init;

        this._sent = new EventLogItem(-1, -1, null);
        this.sent.next = this.sent;
        this.sent.prev = this.sent;

        this.size = 0;
    }

    /**
     * Adds an item to the back of the queue
     * @param item The item to add to the back of the queue
     */
    enqueue(item: EventLogItem): void {
        item.next = this.sent;
        item.prev = this.sent.prev;
        this.sent.prev.next = item;
        this.sent.prev = item;
        this.size += 1;
    }

    /**
     * Retrieves an item from the front of the queue
     * @returns The item at the front of the queue
     */
    dequeue(): EventLogItem | null { 
        if (!this.hasItems()) {
            return null;
        }

        let item: EventLogItem = this.sent.next;
        this.sent.next = this.sent.next.next;
        this.sent.next.prev = this.sent;
        this.size -= 1;
        return item;
    }

    /**
     * Returns the item at the front of the queue, but does not remove it
     * @returns The item at the front of the queue; if the list is empty returns null.
     */
    peekNext(): EventLogItem | null { 
        if (!this.hasItems()) {
            return null;
        }
        return this.sent.next;
    }

    /**
     * Returns true if the queue has items in it, false otherwise
     * @returns A boolean representing whether or not this queue has items
     */
    hasItems(): boolean { 
        return this.size > 0;
     }

    /**
     * Returns the number of elements in the queue.
     * @returns The size of the queue
     */
    getSize(): number { return this.size; }

    /**
     * Iterates through all of the items in this data structure.
     * @param func The function to evaluate of every item in the collection
     */
    forEach(func: (item: EventLogItem, index?: number) => void): void {
        let next = this.sent.next;
        let index = 0;
        while(next !== this.sent) {
            func(next, index);
            next = next.next;
        }
    }

    /**
     * Clears the contents of the data structure
     */
    clear(): void {
        this.sent.next = this.sent;
        this.sent.prev = this.sent;
        this.size = 0;
    }

    public recorder(): new (...args: any[]) => EventRecorder { return EventRecorder; }
    public replayer(): new (...args: any[]) => EventReplayer { return EventReplayer; }
    
    public scene(): new (...args: any) => Scene { return this._scene; }
    public init(): Record<string, any> { return this._init; }

    protected get sent(): EventLogItem { return this._sent; }
    protected get size(): number { return this._size; }
    protected set size(size: number) { this._size = size; }

}