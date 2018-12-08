import * as THREE from 'three'

import mouse from '../../utils/Mouse';
import eventEmitter from '../../utils/emitter';
const emitter = eventEmitter.emitter;

interface IPath {

    resolution: number;
    points: THREE.Vector3[];
    index: number;
    isComplete: boolean;

}

interface IRayCaster {

    ray: THREE.Raycaster;
    intersections: THREE.Intersection[];
    intersecting: boolean;
    point: THREE.Vector3;

}

interface ITarget {

    position: THREE.Vector3;
    prevPosition: THREE.Vector3;
    isActive: boolean;
    index: number;
    indexNext: number;

}

export default class TargetPath extends THREE.Object3D {


    //path params
    private path: IPath;
    private target: ITarget;

    private pathPlane: THREE.Mesh;
    private pathMesh: THREE.Points;

    private mouse: any;
    private rayCaster: IRayCaster;

    public enablePathDrawing: boolean;

    private testN;

    private t: number;

    private testTarget: THREE.Vector3;
    private testStart: THREE.Vector3;

    constructor() {

        super();

        this.init();
        this.initPathPlane();
        this.initPath();
        this.initEvents();

    }

    private init(): void {

        this.mouse = mouse;
        
        this.rayCaster = {

            ray: new THREE.Raycaster,
            intersections: null,
            intersecting: false,
            point: new THREE.Vector3(0.0, 0.0, 0.0)

        }

        this.target = {

            position: new THREE.Vector3(0.0, 0.0, 0.0),
            prevPosition: new THREE.Vector3(0.0, 0.0, 0.0),
            isActive: false,
            index: 0.0,
            indexNext: 0.0

        }

        this.enablePathDrawing = false;
        this.t = 0.0;
        this.testN = 0.0;

        this.testStart = new THREE.Vector3(0.0, 0.0, -10.0);
        this.testTarget = new THREE.Vector3(0.0, 0.0, 10.0);

    }

    private initPathPlane(): void {

        const geo: THREE.PlaneBufferGeometry = new THREE.PlaneBufferGeometry(10000, 10000, 1, 1);
        const mat: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({wireframe: true, color: 0xfffff, side: THREE.BackSide});
        this.pathPlane = new THREE.Mesh(geo, mat);
        this.pathPlane.rotateX(Math.PI * 0.5);
        this.add(this.pathPlane);

    }

    private initPath(): void {

        this.path = {

            resolution: 300,
            points: [],
            index: 0.0,
            isComplete: false

        }

        let i: number = 0.0;
        while(i < this.path.resolution) {

            this.path.points[i] = new THREE.Vector3(0.0, 0.0, 0.0);
            i++;

        }

    }

    private initEvents(): void {

        emitter.on('keyDown', this.onKeyDown);
        emitter.on('mouseDown', this.onMouseDown);
        emitter.on('mouseMove', this.onMouseMove);
        emitter.on('mouseUp', this.onMouseUp);

    }

    private onKeyDown = (event): void => {

        if(event.code === 'Space') {

            this.enablePathDrawing = true;
            emitter.emit('enableCameraControl', false);
            this.resetPath();

        }


    }

    private onMouseDown = (event): void => {

        if(this.rayCaster.point) this.path.points[this.path.index].copy(this.rayCaster.point);
    
    }

    private onMouseMove = (event): void => {

        if(this.mouse.isDown && this.rayCaster.intersecting) {

            this.path.index++;
            
            if(this.path.index > this.path.resolution - 1) {

                if(!this.path.isComplete) this.path.isComplete = true;
                this.path.index = 0.0;

            }
            
            if(this.rayCaster.point) this.path.points[this.path.index].copy(this.rayCaster.point);

        }
    
    }

    private onMouseUp = (event): void => {

        this.enablePathDrawing = false;
        emitter.emit('enableCameraControl', true);
        this.t = 0.0;
        this.testN = 0.0;

    }

    public update(camera: THREE.PerspectiveCamera, t: number): void {

        if(this.enablePathDrawing) {

            this.updatePathPoints(camera);

    } else if(this.enablePathDrawing === false && this.path.index > 0.0) {

        this.updateTarget(t);

        }

    }

    private updatePathPoints(camera: THREE.PerspectiveCamera): void {

        this.rayCaster.ray.setFromCamera(this.mouse.position2D, camera);
        this.rayCaster.intersections = this.rayCaster.ray.intersectObject(this.pathPlane);
        
        if(this.rayCaster.intersections.length > 0.0) {

            this.rayCaster.intersecting = true;
            this.rayCaster.point.copy(this.rayCaster.intersections[0].point);

        } else {

            this.rayCaster.intersecting = false;
        }

    }


    //make the target lerp
    private updateTarget(t: number): void {

        this.t = t;

        this.target.index = Math.round(this.t);
        const mod: number = this.path.isComplete ? this.path.resolution - 1 : this.path.index;
        this.target.index %= mod;

        console.log(this.target.index);

        this.target.indexNext = this.target.index + 1;

        const currentPoint: THREE.Vector3 = this.path.points[this.target.index];
        const targetPoint: THREE.Vector3 = this.path.points[this.target.indexNext];

        // this.target.position = this.targetPosition.lerpVectors(currentPoint, targetPoint, this.position.length() / currentPoint.distanceTo(targetPoint));
    
    }

    private resetPath(): void {

        this.path.index = 0.0;
        this.path.isComplete = false;

        this.target.index = 0.0;
        this.target.indexNext = 0.0;
        this.target.isActive = false;

    }

    get targetPosition() {

        return this.target.position;

    }

}