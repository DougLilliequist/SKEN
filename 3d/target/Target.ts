import { Vector3, Object3D, Mesh, BoxBufferGeometry, MeshBasicMaterial } from 'three';

import eventEmitter from '../../utils/emitter';
const emitter = eventEmitter.emitter;

interface ITargetSteerParams {

    maxSpeed: number;
    maxForce: number;

}

interface ISteerLocation {

    position: Vector3;
    origin: Vector3;
    updateTime: number;
    updateTimeCounter: number;
    maxRadius: number;
    
}

export default class Target extends Object3D {

    private params: ITargetSteerParams;
    private origin: Vector3;
    private prevPosition: Vector3;
    private acc: Vector3;
    private vel: Vector3;

    private steerLocation: ISteerLocation;
    public mode: boolean;

    private debugger: Mesh;

    constructor() {

        super();

        this.init();
        this.initOriginDebugger();
        this.initEvents();

    }

    private init(): void {

        this.params = {

            maxSpeed: 20,
            maxForce: 0.4

        }

        this.prevPosition = new Vector3(0.0, 0.0, 0.0);

        this.acc = new Vector3(0.0, 0.0, 0.0);
        this.vel = new Vector3(0.0, 0.0, 0.0);

        this.steerLocation = {

            position: new Vector3(0.0, 0.0, 0.0),
            origin: new Vector3(0.0, 0.0, 0.0),
            updateTime: 5.0,
            updateTimeCounter: 0.0,
            maxRadius: window.innerWidth * 0.35

        }

        this.steerLocation.position.copy(this.generateNewSteerTarget());

        this.mode = false;

    }

    private initOriginDebugger(): void {

        this.debugger = new Mesh(
            new BoxBufferGeometry(10, 10, 10, 1, 1, 1), 
            new MeshBasicMaterial({color: 0xff0000}));
            this.add(this.debugger);

    }

    private initEvents(): void {

        emitter.on('mouseDown', this.onMouseDown);
        emitter.on('mouseUp', this.onMouseUp);
        emitter.on('updateWorldPos', this.onUpdateWorldPos)
        emitter.on('resizing', this.onResize)

    }

    private onMouseDown = (): void => {

        this.mode = true;
        this.prevPosition.copy(this.position);

    }

    private onMouseUp = (): void => { 

        this.mode = false;

    }

    //rename
    private onUpdateWorldPos = (v: Vector3): void => {

        this.steerLocation.origin.copy(v);
        this.steerLocation.position.copy(this.generateNewSteerTarget());

    }

    private steer(target: Vector3) {

        let desired = target.clone().sub(this.position.clone());
        desired = desired.normalize().multiplyScalar(this.params.maxSpeed);
        let steerForce = desired.sub(this.vel.clone());
        if(steerForce.length() > this.params.maxForce) steerForce = steerForce.normalize().multiplyScalar(this.params.maxForce);
        this.acc.add(steerForce);

    }

    private autoSteer(): void {

        if(this.steerLocation.updateTimeCounter % this.steerLocation.updateTime === 0) {

            this.steerLocation.position.copy(this.generateNewSteerTarget());
            this.steerLocation.updateTimeCounter = 0.0;
        
        } else {

            this.steer(this.steerLocation.position);

        }


        this.steerLocation.updateTimeCounter += 0.5;

    }

    public update(target: Vector3): void {

        if(this.mode) {

            this.steerLocation.updateTimeCounter = 0.0;
            this.steer(target);

        } else {
            
            this.autoSteer();
        
        }

        this.vel.add(this.acc);
        this.position.add(this.vel);
        this.acc.multiplyScalar(0.0);

    }

    private onResize = (): void => {

        this.steerLocation.maxRadius = window.innerWidth * 0.15;

    }

    private generateNewSteerTarget(): Vector3 {

        const t: number = Math.random() * 2.0 * Math.PI;
        const r: number = Math.random() * Math.PI;
        
        const x: number = this.steerLocation.maxRadius * Math.sin(r) * Math.cos(t);
        const y: number = this.steerLocation.maxRadius * Math.cos(t);
        const z: number = this.steerLocation.maxRadius * Math.sin(r) * Math.sin(t);

        return new Vector3(x, y, z).add(this.steerLocation.origin);

    }

}