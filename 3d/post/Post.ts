import * as THREE from 'three';
import Pass from '../../utils/Pass';
import UnrealBloom from '../post/bloom/Bloom';
import FXAA from '../post/Fxaa';

const glslify = require('glslify');

import eventEmitter from '../../utils/emitter';
const emitter = eventEmitter.emitter;

interface IOutputUniforms {

    uBloom: {type: string, value: THREE.WebGLRenderTarget | null},
    uMain: {type: string, value: THREE.WebGLRenderTarget | null}

}

export default class Post extends Pass {

    private bloomPass: UnrealBloom;
    private fxaaPass: FXAA;
    private outputMaterial: THREE.ShaderMaterial;
    private mainRtt: THREE.WebGLRenderTarget;

    constructor(w: number, h: number) {
        super(w, h);

        this.initPasses();
        this.initOutputPass();
        this.initEvents();
    }

    private initPasses(): void {

        this.bloomPass = new UnrealBloom(this.renderWidth, this.renderHeight);
        this.fxaaPass = new FXAA(this.renderWidth, this.renderHeight);

    }

    private initOutputPass(): void {

        const u: IOutputUniforms = {

            uBloom: {type: 't', value: null},
            uMain: {type: 't', value: null}

        }

        const vShader = glslify('./shaders/pass.vs.glsl');
        const fShader = glslify('./shaders/output.fs.glsl');

        this.outputMaterial = new THREE.ShaderMaterial({uniforms: u, vertexShader: vShader, fragmentShader: fShader});
        this.mainRtt = this.createRenderTexture(this.renderWidth, this.renderHeight);

    }

    private initEvents(): void {

        emitter.on('resizing', this.updateBufferSizes);
        emitter.on('orientationChanged', this.updateBufferSizes);

    }

    public render(renderer: any, scene: THREE.Scene, camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) : void {

        renderer.render(scene, camera, this.rtt);
        this.bloomPass.render(renderer, this.rtt);

        this.outputMaterial.uniforms['uBloom'].value = this.bloomPass.rtt;

        renderer.render(scene, camera, this.mainRtt);
        this.outputMaterial.uniforms['uMain'].value = this.mainRtt;

        this.renderQuad.material = this.outputMaterial;
        renderer.render(this.scene, this.camera, this.rtt);

        this.fxaaPass.render(renderer, this.rtt);

        this.blitMaterial.uniforms['uTex'].value = this.fxaaPass.rtt;
        this.renderQuad.material = this.blitMaterial;

        renderer.render(this.scene, this.camera);

    }

    private updateBufferSizes = (): void => {

        this.rtt.setSize(this.renderWidth, this.renderHeight);
        this.mainRtt.setSize(this.renderWidth, this.renderHeight);
        this.bloomPass.rtt.setSize(this.renderWidth, this.renderHeight);
        this.fxaaPass.rtt.setSize(this.renderWidth, this.renderHeight);

    }

}