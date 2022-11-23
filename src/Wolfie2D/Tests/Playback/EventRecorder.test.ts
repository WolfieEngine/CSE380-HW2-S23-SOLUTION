import EventRecorder from "../../../hw3/Recording/EventRecorder"

describe('EventRecorder', () => {

    describe('constructor', () => {
        it("Should create a new, inactive EventRecorder", () => {
            let recorder: EventRecorder = new EventRecorder();
            expect(recorder.active()).toBe(false);
        });
    });
})