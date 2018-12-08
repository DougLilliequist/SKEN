import * as THREE from 'three'
import Pass from '../../utils/Pass';

const glslify = require('glslify');

import eventEmitter from '../../utils/emitter';
const emitter = eventEmitter.emitter;

interface IFxaaUniforms {

    uTex: {type: string, value: THREE.WebGLRenderTarget | THREE.Texture | null},
    uResolution: {type: string, value: THREE.Vector2}

}

export default class FXAA extends Pass {

    private fxaaMaterial: THREE.ShaderMaterial;

    constructor(w: number, h: number) {

        super(w, h);
        this.initFxaaMaterial();
        this.initEvents();

    }

    private initFxaaMaterial(): void {

        const u: IFxaaUniforms = {

            uTex: {type: 't', value: null},
            uResolution: {type: 'v2', value: new THREE.Vector2(this.renderWidth, this.renderHeight)}

        }

        const vShader = glslify('./shaders/pass.vs.glsl');
        const fShader = glslify('./shaders/fxaa.fs.glsl');

        this.fxaaMaterial = new THREE.ShaderMaterial({uniforms: u, vertexShader: vShader, fragmentShader: fShader});
        this.fxaaMaterial.transparent = false;
        this.fxaaMaterial.depthTest = false;
        this.fxaaMaterial.depthWrite = false;

    }

    private initEvents(): void {

        emitter.on('resizing', this.updateResolution);

    }

    public render(renderer: any, rtt: THREE.WebGLRenderTarget | THREE.Texture) {        
        
        this.renderQuad.material = this.fxaaMaterial;
        this.fxaaMaterial.uniforms['uTex'].value = rtt;
        renderer.render(this.scene, this.camera, this.rtt);

    }

    private updateResolution = (): void => {

        this.fxaaMaterial.uniforms['uResolution'].value.set(this.renderWidth, this.renderHeight);

    }

}