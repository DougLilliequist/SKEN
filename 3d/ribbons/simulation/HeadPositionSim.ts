import { RawShaderMaterial, WebGLRenderTarget, Texture } from 'three'
import PingPongBuffer from '../../../utils/buffers/PingPongBuffer';
import SimData from '../../../utils/SimData';

const glslify = require('glslify');

interface IHeadPositionSimUniforms {

    uVel: { type: string, value: WebGLRenderTarget | Texture | null }
    uPos: { type: string, value: WebGLRenderTarget | Texture | null }

}

export default class HeadPositionSim extends PingPongBuffer {

    private simData: SimData;
    private simMat: RawShaderMaterial;

    private width: number;
    private height: number;

    constructor(w: number, h: number) {

        super(w, h);

        this.width = w;
        this.height = h;

        this.initSimData();
        this.initSimMaterial();

    }

    private initSimData(): void {

        const headPositionDataCount: number = (this.width * this.height) * 4.0;
        const headPositionData: Float32Array = new Float32Array(headPositionDataCount);

        let headPosIterator: number = 0.0;
        
        for(let v = 0; v < this.height; v++) {

            const x: number = ((Math.random() * 2.0) - 1.0) * 150.0;
            const y: number = ((Math.random() * 2.0) - 1.0) * 150.0;
            const z: number = ((Math.random() * 2.0) - 1.0) * 150.0;


            for(let u = 0; u < this.width; u++) {

                headPositionData[headPosIterator++] = x;
                headPositionData[headPosIterator++] = y;
                headPositionData[headPosIterator++] = z;
                headPositionData[headPosIterator++] = 0.0;

            }

        }

        this.simData = new SimData(headPositionData, this.width, this.height);

    }

    private initSimMaterial(): void {

        const u: IHeadPositionSimUniforms = {

            uVel: {type: 't', value: null},
            uPos: {type: 't', value: null},

        }

        const vShader = glslify('./shaders/simQuad.glsl');
        const fShader = glslify('./shaders/headPosition.glsl');

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

    public update(renderer: any, velocity: WebGLRenderTarget): void {

        const tmp = this.bufferA;
        this.bufferA = this.bufferB;
        this.bufferB = tmp;

        (<RawShaderMaterial>this.renderQuad.material).uniforms['uVel'].value = velocity;
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uPos'].value = this.bufferB;

        renderer.render(this.scene, this.camera, this.bufferA);

    }

    get outPut() {

        return this.bufferA;

    }

}