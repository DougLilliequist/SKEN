import {Vector2, Vector3, PerspectiveCamera, OrthographicCamera, Ray} from 'three';
import eventEmitter from './emitter';
const emitter = eventEmitter.emitter;

interface iRay {

    ray: Ray;
    distanceScalar: number;

}

export default class Touch {

    private width: number;
    private height: number;

    public position2D: Vector2;
    public position3D: Vector3;
    public previousPosition2D: Vector2;
    public previousPosition3D: Vector3;
    public velocity: Vector2;
    public delta: Vector2;
    public isActive: boolean;
    public isDown: boolean;
    public isMoving: boolean;

    private touchCount: number;
    private touches: any[];

    private _ray: iRay;

    constructor() {

        this.init();
        this.initEvents();

    }

    private init(): void {

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.position2D = new Vector2(0.0, 0.0);
        this.position3D = new Vector3(0.0, 0.0, 0.0);
        this.previousPosition2D = new Vector2(0.0, 0.0);
        this.previousPosition3D = new Vector3(0.0, 0.0, 0.0);
        this.velocity = new Vector2(0.0, 0.0);
        this.delta = new Vector2(0.0, 0.0);
        this.isActive = false;
        this.isDown = false;
        this.isMoving = false;

        this._ray = {
            ray: new Ray(),
            distanceScalar: 1
        };

        this.touchCount = 0.0;
        this.touches = [];

    }

    private initEvents(): void {

        emitter.on('touchStart', this.onTouchStart);
        emitter.on('touchMove', this.onTouchMove);
        emitter.on('touchEnd', this.onTouchEnd);
        emitter.on('orientationChanged', this.updateScalars);

    }

    private onTouchStart = (event): void => {

        this.touchCount++;

        this.isDown = true;
        this.isMoving = false;

        const currentTouch: any = event.touches[0];
        this.position2D.x = ((currentTouch.clientX / this.width) * 2.0 - 1.0);
        this.position2D.y = (-(currentTouch.clientY  / this.height) * 2.0 + 1.0);

        this.getDelta();

    };

    private onTouchMove = (event): void => {

        this.isMoving = true;
        const currentTouch = event.touches[0];
        
        this.position2D.x = ((currentTouch.clientX / this.width) * 2.0 - 1.0);
        this.position2D.y = (-(currentTouch.clientY / this.height) * 2.0 + 1.0);

    };

    private onTouchEnd = (): void => {

        this.isDown = false;
        this.isMoving = false;

        this.previousPosition2D.copy(this.position2D);
        this.previousPosition3D.copy(this.position3D);

        this.touchCount = 0.0;
        this.touches = [];

    };

    public updatePosition3D(camera: PerspectiveCamera | OrthographicCamera) {

        camera.updateMatrixWorld(false);
        this._ray.ray.origin.setFromMatrixPosition(camera.matrixWorld);
        this._ray.ray.direction.set(this.position2D.x, this.position2D.y, 0.5).unproject(camera).sub(this._ray.ray.origin).normalize();
        const dist = this._ray.ray.origin.length() / Math.cos(Math.PI - this._ray.ray.direction.angleTo(this._ray.ray.origin));
        this._ray.ray.origin.add(this._ray.ray.direction.multiplyScalar(dist * this._ray.distanceScalar));
        this.position3D.copy(this._ray.ray.origin);
        this.previousPosition3D.copy(this.position3D);

    }

    public getVelocity(deltaTime: number): Vector2 {

        this.velocity.x = (this.position2D.x - this.previousPosition2D.y);
        this.velocity.y = (this.position2D.y - this.previousPosition2D.y);
        this.previousPosition2D.copy(this.position2D);
        return this.velocity;

    }

    //TODO add mouse force

    private updateScalars(): void {

        this.width = window.innerWidth;
        this.height = window.innerHeight;

    }

    public getDelta(): Vector2 {

        if(this.isDown) {
    
            this.delta.x = this.position2D.x - this.previousPosition2D.x;
            this.delta.y = this.position2D.y - this.previousPosition2D.y;
            this.previousPosition2D.copy(this.position2D);

            return this.delta;

        }

    }

}

// const touch = new Mouse();
// export default mouse;