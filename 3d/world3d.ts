import * as THREE from 'three';
import renderer from './renderer';
import Post from './post/Post';
import mouse from '../utils/Mouse';
import FpsControls from './user/FpControls';
import OrbitControls from '../utils/OrbitControls';

import LightsGPU from './lights/LightsGPU';
import Target from './target/Target';

import eventEmitter from '../utils/emitter';
const emitter = eventEmitter.emitter;

export default class World3D {

    private width: number;
    private height: number;

    private scene: THREE.Scene;
    private renderer: any;

    private orbitControls: any;
    private post: Post;
    private renderToScreen: boolean;


    private fpsControls: FpsControls;
    private interactionState: boolean;

    private lights: LightsGPU;
    private ribbonCount: number;
    private target: Target;

    private cube: THREE.Mesh;

    private time: THREE.Clock;
    private mouse: any; //fix type

    constructor() {

        this.init();
        this.initScene();
        this.initPost();

        this.initLights();
        this.initEvents();

    }

    init() {

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.mouse = mouse;

        this.interactionState = true;

    }

    private initScene = (): void => {

        this.renderer = renderer;
        this.renderer.init();
        this.scene = new THREE.Scene();

        this.fpsControls = new FpsControls();
        emitter.emit('enableFpMode');

        this.scene.add(this.fpsControls);

        this.orbitControls = new OrbitControls(this.fpsControls.camera, this.renderer.domElement);
        this.orbitControls.enabled = false;

        this.time = new THREE.Clock();

        this.cube = new THREE.Mesh(
        new THREE.BoxGeometry(10, 10, 10, 1, 1, 1), 
        new THREE.MeshBasicMaterial({color: 0xff0000}));
        // this.scene.add(this.cube);

    };

    private initLights(): void {

        // this.ribbonCount = 10.0;    
        // this.lights = new Lights(this.ribbonCount); 
        // this.target = new Target();
       
        // this.scene.add(this.lights);

        // this.ribbonCount = 15.0;    
        this.ribbonCount = 128.0;    
        this.lights = new LightsGPU(this.renderer, this.ribbonCount); 
        this.target = new Target();
       
        this.scene.add(this.lights);

    }

    private initPost(): void {

        this.renderToScreen = false;
        this.post = new Post(this.width, this.height);

    }

    private initEvents(): void {

        emitter.on('update', this.animate);
        emitter.on('resizing', this.onResize);
        emitter.on('keyDown', this.updateCameraState);

    }

    private updateCameraState = (event): void => {

        if(event.code === 'Space') {

            this.interactionState = !this.interactionState;
            this.orbitControls.enabled = !this.interactionState;

            if(this.interactionState === true) {
                
                emitter.emit('restorefpCamera', this.orbitControls.getCamera());
                emitter.emit('enableFpMode');

            } else {

                emitter.emit('disableFpMode');

            }

        }

    }

    private render(): void {

        if(!this.renderToScreen) {
            this.post.render(this.renderer, this.scene, this.fpsControls.camera)
        } else {
            this.renderer.render(this.scene, this.fpsControls.camera);
        }

    }

    private animate = (): void => {

        const t: number = this.time.getElapsedTime();
        const dt: number = this.time.getDelta();

        this.mouse.updatePosition3D(this.fpsControls.camera);
        if(this.interactionState) this.fpsControls.update(dt, this.mouse);
        this.target.update(this.fpsControls.steerTargetWorldPos);

        // this.lights.update(this.renderer, this.fpsControls.steerTargetWorldPos, dt);
        this.lights.update(this.renderer, this.mouse.position3D, dt);
        // this.lights.update(this.renderer, this.target.position, dt);
        // this.lights.update(this.renderer, this.target.position, dt);

        // this.lights.update(this.renderer, this.target.position, dt);

        // this.target.update(this.fpsControls.position);
        // this.lights.updateHeadPositions(this.fpsControls.steerTargetWorldPos);
        // this.lights.updateHeadPositions(this.target.position);
        
        // this.cube.position.copy(this.target.position);
        
        this.render();

    };

    private onResize = (): void => {

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.renderer.setSize(this.width, this.height);

    }

}