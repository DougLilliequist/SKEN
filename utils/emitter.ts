const ee = require('event-emitter');
import renderer from '../3d/renderer';

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

        this.initDesktopEvents();
        this.initMobileEvents();
        this.update();

    }

    private initDesktopEvents(): void {

        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('resize', this.onResize);

    }

    private initMobileEvents(): void {

        renderer.domElement.addEventListener('touchstart', this.onTouchStart);
        window.addEventListener('orientationchange', this.onOrientationChange);

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

    };

    private onResize = (event): void => {

        this.emitter.emit('resizing', event)

    };

    private onTouchStart = (event): void => {

        event.preventDefault();
        this.emitter.emit('touchStart', event);
        renderer.domElement.addEventListener('touchmove', this.onTouchMove);
        renderer.domElement.addEventListener('touchend', this.onTouchEnd);
        renderer.domElement.addEventListener('touchcancel', this.onTouchEnd);

    }

    private onTouchMove = (event): void => {

        event.preventDefault();
        this.emitter.emit('touchMove', event);

    }

    private onTouchEnd = (event): void => {

        // event.preventDefault();
        this.emitter.emit('touchEnd', event);
        renderer.domElement.removeEventListener('touchmove', this.onTouchMove);
        renderer.domElement.removeEventListener('touchend', this.onTouchEnd);

    }

    private onOrientationChange = (event): void => {

        //https://stackoverflow.com/questions/12452349/mobile-viewport-height-after-orientation-change
        setTimeout(() => this.emitter.emit('orientationChanged', event) , 500.0);

    };

}

const eventEmitter = new EventEmitter()
export default eventEmitter