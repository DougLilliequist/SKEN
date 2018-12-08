import { Object3D, PerspectiveCamera, Vector3, Mesh, BoxBufferGeometry, MeshBasicMaterial, Quaternion } from 'three'

import Cursor from './cursor/Cursor';

import {TweenLite, Sine, Circ, Power3} from 'gsap';

import eventEmitter from '../../utils/emitter';
const emitter = eventEmitter.emitter;

interface ICameraParams {

    fov: number;
    aspect: number;
    near: number;
    far: number;
    defaultPos: Vector3 | null;
    defaultRotation: Quaternion | null;

}

interface IMovementParams {

    speed: number;
    max: number;
    min: number;
    
}

interface IForceParams {

    inertia: number;
    inertiaK: number;
    forceK: number;

}

//RENAME CLASS
export default class FpsControls extends Object3D {

    private cameraParams: ICameraParams;
    public camera: PerspectiveCamera;

    private forceParams: IForceParams;
    private forward: Vector3;
    private vel: Vector3;
    private acc: Vector3;

    private movementParams: IMovementParams;

    private state: boolean;

    private steerTarget: Object3D;
    public steerTargetWorldPos: Vector3;
    public steerTargetWorldDir: Vector3;

    private positionTransition: TweenLite;
    private rotationTransition: TweenLite;
    private maxSpeedTransition: TweenLite;

    private cursor: Cursor;

    constructor() {

        super();

        this.init();
        this.initCamera();
        this.initSteerTarget();
        this.initCursor();
        this.initEvents();

    }

    private init(): void {


        this.movementParams = {

            speed: 15.0,
            max: 15,
            min: 5.0

        }

        this.forward = new Vector3(0.0, 0.0, -1.2);
        this.vel = new Vector3(0.0, 0.0, 0.0);
        this.acc = new Vector3(0.0, 0.0, 0.0);

        this.forceParams = {

            inertia: 0.0,
            inertiaK: 0.8,
            forceK: 0.9

        }

    }

    private initCamera(): void {

        this.cameraParams = {

            fov: 35.0,
            aspect: window.innerWidth / window.innerHeight,
            near: 0.1,
            far: 10000,
            defaultPos: new Vector3(0.0, 0.0, 1250),
            defaultRotation: new Quaternion(0.0, 0.0, 0.0, 1.0),

        };

        //NOTE: orbit controls is adding a slight offset on the y axis and rotation on the x axis
        this.camera = new PerspectiveCamera(this.cameraParams.fov, this.cameraParams.aspect, this.cameraParams.near, this.cameraParams.far);
        this.camera.position.copy(this.cameraParams.defaultPos);

        this.add(this.camera);

    }

    private initSteerTarget(): void {

        this.steerTarget = new Object3D();
        this.steerTarget.position.z = -750;
        this.steerTargetWorldPos = new Vector3(0.0, 0.0, 0.0);
        this.steerTargetWorldDir = new Vector3(0.0, 0.0, 0.0);
        
        this.add(this.steerTarget);

        const carrot = new Mesh(new BoxBufferGeometry(10, 10, 10, 1, 1, 1), new MeshBasicMaterial({color: 0xff0000}));
        // this.steerTarget.add(carrot);

    }

    private initCursor(): void {

        this.cursor = new Cursor();
        // this.add(this.cursor);

    }

    private initEvents(): void {

        emitter.on('enableFpMode', this.enable);
        emitter.on('disableFpMode', this.disable);
        emitter.on('restorefpCamera', this.restoreCamera);
        emitter.on('resizing', this.onResize);

    }

    private enable = () : void => {

        emitter.on('mouseDown', this.onMouseDown);
        emitter.on('mouseUp', this.onMouseUp);

    }

    private disable = (): void => {

        emitter.off('mouseDown', this.onMouseDown);
        emitter.off('mouseUp', this.onMouseUp);

    }

    private onMouseDown = (): void => {

        this.state = true;
        
        this.forceParams.inertia = this.forceParams.inertiaK;
        
        this.updateMaxSpeed(this.movementParams.max);

        emitter.emit('revealCursor');

    }

    private onMouseUp = (): void => {

        this.state = false;
        
        this.updateMaxSpeed(this.movementParams.min).then(() => emitter.emit('updateWorldPos', this.position.clone()));

        emitter.emit('hideCursor');
        
    }

    public update(t: number, mouse: any): void {

        this.cursor.update(mouse.position2D);

        if(this.state) {
            
            this.steerTarget.position.x = mouse.position2D.x * (window.innerWidth * 0.5);
            this.steerTarget.position.y = mouse.position2D.y * (window.innerHeight * 0.5);

            this.acc.add(this.forward.clone().multiplyScalar(this.forceParams.forceK));

            this.steerTarget.getWorldPosition(this.steerTargetWorldPos);

        } else {

            this.vel.multiplyScalar(Math.max(0.0, Math.min(this.forceParams.inertia - t, this.forceParams.inertiaK)));
            if(this.vel.length() < 0.01) this.vel.multiplyScalar(0.0);
       
        }

        this.vel.add(this.acc);
        if(this.vel.length() > this.movementParams.speed) this.vel.normalize().multiplyScalar(this.movementParams.speed);
        this.position.add(this.vel);
        this.acc.multiplyScalar(0.0);

    }

    private updateMaxSpeed(val: number): Promise<any> {

        const promise = new Promise((resolve) => {

            if(this.maxSpeedTransition) this.maxSpeedTransition.kill();

            this.maxSpeedTransition = TweenLite.to(this.movementParams, 0.25, {
                
                ease: Sine.easeIn,
                speed: val,
                onComplete: () => resolve()
            
            });   

        });

        return promise;

    }

    private restoreCamera = (): void => {

        if(this.positionTransition) this.positionTransition.kill();
        if(this.rotationTransition) this.rotationTransition.kill();

        this.positionTransition = TweenLite.to(this.camera.position, 1.25, ({
            
            ease: Power3.easeOut,
            x: this.cameraParams.defaultPos.x,
            y: this.cameraParams.defaultPos.y,
            z: this.cameraParams.defaultPos.z,

        }));

        this.rotationTransition = TweenLite.to(this.camera.quaternion, 1.25, ({

            ease: Power3.easeOut,
            x: this.cameraParams.defaultRotation.x,
            y: this.cameraParams.defaultRotation.y,
            z: this.cameraParams.defaultRotation.z,
            w: this.cameraParams.defaultRotation.w,

        }));

    }

    private onResize = (): void => {

        const a: number = window.innerWidth / window.innerHeight;

        this.camera.aspect = a;
        this.camera.updateProjectionMatrix();

        this.cursor.aspectRatio = a;

    }

    get currentWorldPos() {

        return this.position.clone();

    }

}