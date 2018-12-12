import * as THREE from 'three';
import renderer from './renderer';
import Post from './post/Post';
import mouse from '../utils/Mouse';
import Touch from '../utils/Touch';
import OrbitControls from '../utils/OrbitControls';

import Ribbons from './ribbons/Ribbons';
import Target from './target/Target';

import RenderQuad from '../utils/renderQuad/RenderQuad';

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

    private testQuad: THREE.Mesh;

    private time: THREE.Clock;
    private mouse: any;
    private touch: Touch;

    constructor() {

        this.init();
        this.initScene();
        this.initribbons();
        this.initTest();
        this.initPost();
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
            this.mouse = mouse;

        }

    }

    private initScene = (): void => {

        this.renderer = renderer;
        this.renderer.init();

        var gl = this.renderer.getContext();

        // var floatTextures = gl.getExtension('OES_texture_float');
        // if (!floatTextures) {
        // alert('no floating point texture support');
        // return;
        // }


        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, 0.1, 20000);
        
        const cameraPos: THREE.Vector3 = this.isMobile == false ? new THREE.Vector3(0.0, 0.0, 5000.0) : new THREE.Vector3(0.0, 0.0, 5000.0);
        this.camera.position.copy(cameraPos);

        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enabled = true;

        this.time = new THREE.Clock();

    };

    private initribbons(): void {

        this.ribbonCount = this.isMobile == false ? 128.0 : 64.0;    
        this.ribbons = new Ribbons(this.renderer, this.ribbonCount, this.isMobile); 

        this.target = new Target(this.isMobile);
       
        this.scene.add(this.ribbons);

    }

    private initTest(): void {

        // this.testQuad = new RenderQuad(20, 20);

        const geo: THREE.PlaneBufferGeometry = new THREE.PlaneBufferGeometry(20, 20, 1.0, 1.0);

        const u = {

            uTex: {type: 't', value: null},
            uAspectRatio: {type: 'f', value: this.width / this.height}

        }

        const vShader: string = `
        
        uniform float uAspectRatio;

        varying vec2 vUV;

        void main() {

            vec2 pos = position.xy;

            pos.x /= uAspectRatio;

            pos.x -= 30.0;
            pos.y -= 20.0;
            pos *= 0.025;

            gl_Position = vec4(vec3(pos, 0.0), 1.0);
            vUV = uv;

        }
        
        `;

        const fShader: string = `

            precision mediump float;
        
            uniform sampler2D uTex;
            
            varying vec2 vUV;

            void main() {

                vec3 outPut = texture2D(uTex, vUV).xyz;
                gl_FragColor = vec4(outPut, 1.0);

            }

        `
        
        const mat: THREE.ShaderMaterial = new THREE.ShaderMaterial({uniforms: u, vertexShader: vShader, fragmentShader: fShader})
        mat.transparent = false;
        mat.depthTest = false;
        mat.depthWrite = false;

        this.testQuad = new THREE.Mesh(geo, mat);

        (<THREE.ShaderMaterial>this.testQuad.material).uniforms['uTex'].value = this.ribbons.headPositions;

        this.scene.add(this.testQuad);

    }

    private initPost(): void {

        this.renderToScreen = true;
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

        this.ribbons.update(this.renderer, this.target.position, t);
        (<THREE.ShaderMaterial>this.testQuad.material).uniforms['uTex'].value = this.ribbons.headPositions;
                
        this.render();

    };

    private onResize = (event): void => {

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        (<THREE.ShaderMaterial>this.testQuad.material).uniforms['uAspectRatio'].value = this.width / this.height;

        this.renderer.setSize(this.width, this.height);

    }

    private onOrientationChange = (event): void => {
            
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();

            (<THREE.ShaderMaterial>this.testQuad.material).uniforms['uAspectRatio'].value = this.width / this.height;
    
            this.renderer.setSize(this.width, this.height);
            
    }

}