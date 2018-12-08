const ee = require('event-emitter');

class EventEmitter {
    public emitter: any;
    constructor() {
        this.initEmitter();
        this.initEvents();
    }

    private initEmitter(): void {
        this.emitter = ee({});
    }

    initEvents() {

        this.update();
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('resize', this.onResize);

    }

    private update = (): void => {

        this.emitter.emit('update');
        window.requestAnimationFrame(()=> this.update());

    };

    private onMouseMove = (event): void => {

        this.emitter.emit('mouseMove', event)

    };

    private onMouseDown = (event): void => {

        this.emitter.emit('mouseDown', event)

    };

    private onMouseUp = (event): void => {

        this.emitter.emit('mouseUp', event)

    };

    private onKeyDown = (event): void => {

        this.emitter.emit('keyDown', event)

    }

    private onResize = () => {

        this.emitter.emit('resizing')

    };

}

const eventEmitter = new EventEmitter()
export default eventEmitter