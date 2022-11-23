import Scene from "../../Scene/Scene";
import Collection from "../Interfaces/Collection";
import Queue from "../Interfaces/Queue";
import Unique from "../Interfaces/Unique";
import LogItem from "./LogItem";
import Recorder from "./Recorder";
import Replayer from "./Replayer";

/**
 * An interface that defines a set of methods to be exposed by all Recording types. 
 * @author Peter Walsh
 */
export default interface Recording<T extends LogItem> {
    /** 
     * @return the type of Recorder used to record this type of Recording
     */
    recorder(): new (...args: any) => Recorder<Recording<T>, T>

    /** 
     * @return the type of Replayer used to replay this type of Recording 
     */
    replayer(): new (...args: any) => Replayer<Recording<T>, T>;
}