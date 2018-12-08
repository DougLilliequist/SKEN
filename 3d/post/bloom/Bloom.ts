/**
 * @author Douglas Lilliequist / http://www.douglaslilliequist.xyz/
 *
 * inspired from mrdoob's (https://github.com/mrdoob) unrealbloom pass
 * source by : https://github.com/mrdoob/three.js/blob/master/examples/js/postprocessing/UnrealBloomPass.js
 */

import * as THREE from 'three';
const glslify = require('glslify');
import Pass from '../../../utils/Pass';

import Luma from './Luma';
import Blur from './Blur';
import Composite from './Composite';

import eventEmitter from '../../../utils/emitter';
const emitter = eventEmitter.emitter;

export default class UnrealBloom extends Pass {

    //params
    private oldClearColor: THREE.Color;
    private oldClearAlpha: number;
    private clearColor: THREE.Color;
    private strength: number;
    private rad: number;
    private threshold: number;
    private nMips: number;

    //luma
    public lumaMaterial: Luma;
    public lumaRtt: THREE.WebGLRenderTarget;
    
    //blur
    private horizontalBlurTextures: THREE.WebGLRenderTarget[];
    private verticalBlurTextures: THREE.WebGLRenderTarget[];
    private blurMaterials: Blur[];
    private blurDirectionX: THREE.Vector2;
    private blurDirectionY: THREE.Vector2;
    private deResAmount: number;
    private kernelSizes: number[];
    private blitTexture: THREE.WebGLRenderTarget;

    //blur composote
    private compositeMaterial: Composite;
    private bloomTintColors: THREE.Vector3[];

    constructor(w: number, h: number) {
        
        super(w, h);
        this.init();
        this.initLumaPass();
        this.initBlurPasses();
        this.initCompositePass();
        this.initEvents();

    }

    private init(): void {

        this.oldClearColor = new THREE.Color();
        this.oldClearAlpha = 1.0;
        this.clearColor = new THREE.Color(0.0, 0.0, 0.0);
        this.strength = 1.2;
        this.rad = 0.1;
        this.threshold = 0.1;
        this.nMips = 5.0;

    }

    private initLumaPass(): void {

        this.lumaRtt = this.createRenderTexture(this.renderWidth, this.renderHeight);

        this.lumaMaterial = new Luma();
        this.lumaMaterial.uniforms['uLumaThreshold'].value = this.threshold;
        this.lumaMaterial.uniforms['uSmoothWidth'].value = 0.35;

    }

    private initBlurPasses(): void {

        this.horizontalBlurTextures = [];
        this.verticalBlurTextures = [];

        this.blurDirectionX = new THREE.Vector2(1.0, 0.0);
        this.blurDirectionY = new THREE.Vector2(0.0, 1.0);

        this.deResAmount = 1.0 / 2.0;

        let blurResX: number = Math.round(this.renderWidth * this.deResAmount);
        let blurResY: number = Math.round(this.renderHeight * this.deResAmount);

        for (let i = 0; i < this.nMips; i++) {

            const blurRttH: THREE.WebGLRenderTarget = this.createRenderTexture(blurResX, blurResY);
            this.horizontalBlurTextures.push(blurRttH);

            const blurRttV: THREE.WebGLRenderTarget = this.createRenderTexture(blurResX, blurResY);
            this.verticalBlurTextures.push(blurRttV);

            blurResX = Math.round(blurResX * this.deResAmount);
            blurResY = Math.round(blurResY * this.deResAmount);

        }

        this.blurMaterials = [];
        this.kernelSizes = [3, 5, 7, 9, 11];

        blurResX = Math.round(this.renderWidth * this.deResAmount);
        blurResY = Math.round(this.renderHeight * this.deResAmount);

        for (let i = 0; i < this.nMips; i++) {

            const blurMaterial: Blur = new Blur(this.kernelSizes[i]);
            blurMaterial.uniforms['uTexSize'].value = new THREE.Vector2(blurResX, blurResY);
            this.blurMaterials.push(blurMaterial)

            blurResX = Math.round(blurResX * this.deResAmount)
            blurResY = Math.round(blurResY * this.deResAmount)

        }

    }

    private initCompositePass(): void {

        this.compositeMaterial = new Composite( this.nMips, this.renderWidth, this.renderHeight );
        this.compositeMaterial.uniforms[ 'uBlurTexture1' ].value = this.verticalBlurTextures[ 0 ].texture;
        this.compositeMaterial.uniforms[ 'uBlurTexture2' ].value = this.verticalBlurTextures[ 1 ].texture;
        this.compositeMaterial.uniforms[ 'uBlurTexture3' ].value = this.verticalBlurTextures[ 2 ].texture;
        this.compositeMaterial.uniforms[ 'uBlurTexture4' ].value = this.verticalBlurTextures[ 3 ].texture;
        this.compositeMaterial.uniforms[ 'uBlurTexture5' ].value = this.verticalBlurTextures[ 4 ].texture;
        this.compositeMaterial.uniforms[ 'uBloomStrength' ].value = this.strength;
        this.compositeMaterial.uniforms[ 'uBloomRadius' ].value = 0.1;
        this.compositeMaterial.needsUpdate = true;

        this.compositeMaterial.depthTest = false;
        this.compositeMaterial.depthWrite = false;
        const bloomFactors: number[] = [1.0, 0.8, 0.6, 0.4, 0.2];
        this.compositeMaterial.uniforms['uBloomFactors'].value = bloomFactors;

        this.bloomTintColors = [new THREE.Vector3(1.0, 1.0, 1.0), new THREE.Vector3(1.0, 1.0, 1.0), new THREE.Vector3(1.0, 1.0, 1.0),
            new THREE.Vector3(1.0, 1.0, 1.0), new THREE.Vector3(1.0, 1.0, 1.0)];

        this.compositeMaterial.uniforms['uBloomTintColors'].value = this.bloomTintColors;

    }

    private initEvents(): void {

        emitter.on('resizing', this.updateBlurResolution);

    }

    public render(renderer: any, rtt: THREE.WebGLRenderTarget): void {

        if(rtt === undefined || rtt === null) {

            console.error('no rendertarget found');

            renderer.render(this.scene, this.camera, null, false);

        }

        let autoClearCol: boolean = renderer.autoClearColor;
        let clearCol: THREE.Color = renderer.getClearColor().getHex();
        let clearAlpha: number = renderer.getClearAlpha();
        renderer.autoClearColor = false;

        renderer.setClearColor(this.clearColor, 1.0);

        this.lumaMaterial.uniforms['uLumaThreshold'].value = this.threshold;
        this.lumaMaterial.uniforms['uTexture'].value = rtt;
        this.renderQuad.material = this.lumaMaterial;

        renderer.render(this.scene, this.camera, this.lumaRtt, true);

        let blitTexture: THREE.WebGLRenderTarget = this.lumaRtt;

        for (let i = 0; i < this.nMips; i++) {
            
            this.blurMaterials[i].uniforms['uColorTexture'].value = blitTexture;
            this.blurMaterials[i].uniforms['uDirection'].value.copy(this.blurDirectionX);
            this.renderQuad.material = this.blurMaterials[i];

            renderer.render(this.scene, this.camera, this.horizontalBlurTextures[i], true);

            this.blurMaterials[i].uniforms['uColorTexture'].value = this.horizontalBlurTextures[i];
            this.blurMaterials[i].uniforms['uDirection'].value.copy(this.blurDirectionY);
            this.renderQuad.material = this.blurMaterials[i];

            renderer.render(this.scene, this.camera, this.verticalBlurTextures[i], true);

            blitTexture = this.verticalBlurTextures[i];

        }

        this.compositeMaterial.uniforms['uBloomStrength'].value = this.strength;
        this.compositeMaterial.uniforms['uBloomRadius'].value = this.rad;
        this.compositeMaterial.uniforms['uBloomTintColors'].value = this.bloomTintColors;
        this.renderQuad.material = this.compositeMaterial;

        renderer.render(this.scene, this.camera, this.horizontalBlurTextures[0], true);
        
        this.blitMaterial.uniforms['uTex'].value = this.horizontalBlurTextures[0];
        this.renderQuad.material = this.blitMaterial;
        
        renderer.render(this.scene, this.camera, this.rtt, false);

        renderer.setClearColor(clearCol, clearAlpha);
        renderer.autoClearColor = autoClearCol;

    }

    private updateBlurResolution = (): void => {

        let blurResX: number = Math.round(this.renderWidth * this.deResAmount);
        let blurResY: number = Math.round(this.renderHeight * this.deResAmount);

        this.lumaRtt.setSize(blurResX, blurResY);

        for(let i = 0; i < this.nMips; i++) {

            this.horizontalBlurTextures[i].setSize(blurResX, blurResY);
            this.verticalBlurTextures[i].setSize(blurResX, blurResY);

            this.blurMaterials[i].uniforms['uTexSize'].value.set(blurResX, blurResY);

            blurResX = Math.round(blurResX * this.deResAmount);
            blurResY = Math.round(blurResY * this.deResAmount);

        }

    }

}