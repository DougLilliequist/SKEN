import * as THREE from 'three';
import renderer from './renderer';
import Post from './post/Post';
import mouse from '../utils/Mouse';
import Touch from '../utils/Touch';
import OrbitControls from '../utils/OrbitControls';

import Ribbons from './ribbons/Ribbons';
import Target from './target/Target';

const bowser = require('bowser');
import eventEmitter from '../utils/emitter';
const emitter = eventEmitter.emitter;

export default class World3D {

    private width: number;
    private height: number;
    private isMobile: boolean;

    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private orbitControls: any;
    private renderer: any;

    private post: Post;
    private renderToScreen: boolean;

    private ribbons: Ribbons;
    private ribbonCount: number;
    private target: Target;

    private cube: THREE.Mesh;

    private time: THREE.Clock;
    private mouse: any; //fix type
    private touch: Touch;

    constructor() {

        this.init();
        this.initScene();
        this.initPost();

        this.initribbons();
        this.initEvents();

    }

    init() {

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        const browser = bowser.getParser(window.navigator.userAgent);
        const result = browser.parsedResult;
        const device = result.platform.type;

        const isMobile: boolean = (device == "mobile");
        const isTablet: boolean = (device == "tablet");
        const isDesktop: boolean = (device == "desktop");

        if(isMobile || isTablet) {
            
            this.isMobile = true;
            this.touch = new Touch();


        } else if(isDesktop) {

            this.isMobile = false;

        }

        this.mouse = mouse;

        // this.interactionState = true;

    }

    private initScene = (): void => {

        this.renderer = renderer;
        this.renderer.init();
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, 0.1, 20000);
        
        const cameraPos: THREE.Vector3 = this.isMobile == false ? new THREE.Vector3(0.0, 0.0, 1000.0) : new THREE.Vector3(0.0, 0.0, 2000.0);
        this.camera.position.copy(cameraPos);

        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enabled = true;

        this.time = new THREE.Clock();

        this.cube = new THREE.Mesh(
        new THREE.BoxGeometry(10, 10, 10, 1, 1, 1), 
        new THREE.MeshBasicMaterial({color: 0xff0000}));
        // this.scene.add(this.cube);

    };

    private initribbons(): void {

        this.ribbonCount = this.isMobile == false ? 128.0 : 64.0;    
        this.ribbons = new Ribbons(this.renderer, this.ribbonCount, this.isMobile); 
        this.target = new Target(this.isMobile);
       
        this.scene.add(this.ribbons);

    }

    private initPost(): void {

        this.renderToScreen = false;
        this.post = new Post(this.width, this.height);

    }

    private initEvents(): void {

        emitter.on('update', this.animate);

        if(this.isMobile) {

            emitter.on('orientationChanged', this.onOrientationChange);
            
        } else {

            emitter.on('resizing', this.onResize);

        }

    }

    private render(): void {

        if(!this.renderToScreen) {
            this.post.render(this.renderer, this.scene, this.camera)
        } else {
            this.renderer.render(this.scene, this.camera);
        }

    }

    private animate = (): void => {

        const t: number = this.time.getElapsedTime();
        const dt: number = this.time.getDelta();

        if(this.isMobile === false) {
            
            this.mouse.updatePosition3D(this.orbitControls.getCamera());
            this.target.update(this.mouse.position3D);
        
        } else {

            this.touch.updatePosition3D(this.orbitControls.getCamera());
            this.target.update(this.touch.position3D);
        
        }

        this.ribbons.update(this.renderer, this.target.position, dt);
        
        
        // this.cube.position.copy(this.target.position);
        
        this.render();

    };

    private onResize = (event): void => {

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        console.log(this.width);

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);

    }

    private onOrientationChange = (event): void => {

        //https://stackoverflow.com/questions/12452349/mobile-viewport-height-after-orientation-change
        setTimeout(() => {

            this.width = window.innerWidth;
            this.height = window.innerHeight;

            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
    
            this.renderer.setSize(this.width, this.height);
            
        }, 1.0)

    }

}