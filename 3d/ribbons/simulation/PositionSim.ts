import { RawShaderMaterial, WebGLRenderTarget, Texture, Vector2 } from 'three'
import PingPongBuffer from '../../../utils/buffers/PingPongBuffer';
import SimData from '../../../utils/SimData';

const glslify = require('glslify');

interface IPositionSimUniforms {

    uHeadPos: { type: string, value: WebGLRenderTarget | Texture | null }
    uPos: { type: string, value: WebGLRenderTarget | Texture | null }
    uTexelSize: { type: string, value: Vector2 }
    uResolution: {type: string, value: Vector2}

}

export default class PositionSim extends PingPongBuffer {

    private simData: SimData;
    private simMat: RawShaderMaterial;

    private width: number;
    private height: number;

    constructor(w: number, h: number, isMobile: boolean) {

        super(w, h, isMobile);

        this.width = w;
        this.height = h;

        this.initSimData();
        this.initSimMaterial();

    }

    private initSimData(): void {

        const positionDataCount: number = (this.width * this.height) * 4.0;
        const positionData: Float32Array = new Float32Array(positionDataCount);
        // const positionData: Uint16Array = new Uint16Array(positionDataCount);
        this.simData = new SimData(positionData, this.width, this.height);

    }

    private initSimMaterial(): void {

        const u: IPositionSimUniforms = {

            uHeadPos: {type: 't', value: null},
            uPos: {type: 't', value: null},
            uTexelSize: {type: 'v2', value: new Vector2(1.0 / this.width, 1.0 / this.height)},
            uResolution: {type: 'v2', value: new Vector2(window.innerWidth, window.innerHeight)}

        }

        const vShader = glslify('./shaders/simQuad.glsl');
        const fShader = glslify('./shaders/position.glsl');

        this.simMat = new RawShaderMaterial({uniforms: u, vertexShader: vShader, fragmentShader: fShader});

    }

    public initSim(renderer: any): void {

        this.renderQuad.texture = this.simData;
        renderer.render(this.scene, this.camera, this.bufferA);
        this.renderQuad.texture = this.bufferA;
        renderer.render(this.scene, this.camera, this.bufferB);

        this.renderQuad.material = this.simMat;
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uPos'].value = this.bufferA;

    }

    public update(renderer: any, headPos: WebGLRenderTarget): void {

        const tmp = this.bufferA;
        this.bufferA = this.bufferB;
        this.bufferB = tmp;

        (<RawShaderMaterial>this.renderQuad.material).uniforms['uHeadPos'].value = headPos;
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uPos'].value = this.bufferB;

        renderer.render(this.scene, this.camera, this.bufferA);

    }

    get outPut() {

        return this.bufferA;

    }

}