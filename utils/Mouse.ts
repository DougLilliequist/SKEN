import {Vector2, Vector3, PerspectiveCamera, OrthographicCamera, Ray} from 'three';
import eventEmitter from './emitter';
const emitter = eventEmitter.emitter;

interface iRay {

    ray: Ray;
    distanceScalar: number;

}

class Mouse {

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

    }

    private initEvents(): void {

        emitter.on('mouseMove', this.onMouseMove);
        emitter.on('mouseDown', this.onMouseDown);
        emitter.on('mouseUp', this.onMouseUp);
        emitter.on('resizing', this.updateScalars);

    }

    private onMouseDown = (event): void => {

        this.isDown = true;
        this.isMoving = false;

        this.position2D.x = ((event.clientX / window.innerWidth) * 2.0 - 1.0);
        this.position2D.y = (-(event.clientY / window.innerHeight) * 2.0 + 1.0);

        this.getDelta();

    };

    private onMouseMove = (event): void => {

        this.isMoving = true;

        this.position2D.x = ((event.clientX / window.innerWidth) * 2.0 - 1.0);
        this.position2D.y = (-(event.clientY / window.innerHeight) * 2.0 + 1.0);

    };

    private onMouseUp = (): void => {

        this.isDown = false;
        this.isMoving = false;

        this.previousPosition2D.copy(this.position2D);
        this.previousPosition3D.copy(this.position3D);

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

const mouse = new Mouse();
export default mouse;