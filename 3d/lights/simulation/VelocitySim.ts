import { RawShaderMaterial, WebGLRenderTarget, Texture, Vector2, Vector3 } from 'three'
import PingPongBuffer from '../../../utils/buffers/PingPongBuffer';
import SimData from '../../../utils/SimData';

const glslify = require('glslify');

interface IVelocitySimDefines {

    "WIDTH": number;
    "HEIGHT": number;

}

interface IVelocitySimUniforms {

    uVel: { type: string, value: WebGLRenderTarget | Texture | null }
    uPos: { type: string, value: WebGLRenderTarget | Texture | null }

    uTarget: { type: string, value: Vector3}    
    uMaxSpeed: {type: string, value: number}
    uMaxForce: {type: string, value: number}
    uAvoidSpeed: {type: string, value: number}
    uAvoidForce: {type: string, value: number}

    uMinDist: {type: string, value: number}
    uMaxDist: {type: string, value: number}

    uSteerK: {type: string, value: number}
    uSeparateK: {type: string, value: number}
    uAlignK: {type: string, value: number}
    uCohesionK: {type: string, value: number}

    uTexelSize: { type: string, value: Vector2 }
    uTime: {type: string, value: number}

}

export default class VelocitySim extends PingPongBuffer {

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

        const velocityDataCount: number = (this.width * this.height) * 4.0;
        const velocityData: Float32Array = new Float32Array(velocityDataCount);
        this.simData = new SimData(velocityData, this.width, this.height);

    }

    private initSimMaterial(): void {

        const d: IVelocitySimDefines = {

            "WIDTH": this.width,
            "HEIGHT": this.height

        }

        const u: IVelocitySimUniforms = {

            uVel: { type: 't', value: null },
            uPos: {type: 't', value: null},
            
            uTarget: { type: 'v3', value: new Vector3(0.0, 0.0, 0.0)},
    
            uMaxSpeed: {type: 'f', value: 35.0},
            uMaxForce: {type: 'f', value: 1.2},
            uAvoidSpeed: {type: 'f', value: 35.0},
            uAvoidForce: {type: 'f', value: 1.2},

            uMinDist: {type: 'f', value: 120.0},
            uMaxDist: {type: 'f', value: 150.0},
        
            uSteerK: {type: 'f', value: 0.8},
            uSeparateK: {type: 'f', value: 1.5},
            uAlignK: {type: 'f', value: 1.0},
            uCohesionK: {type: 'f', value: 1.0},

            uTexelSize: {type: 'v2', value: new Vector2(1.0 / this.width, 1.0 / this.height)},
            uTime: {type: 'f', value: 0.0},

        }

        const vShader = glslify('./shaders/simQuad.glsl');
        const fShader = glslify('./shaders/velocity.glsl');

        this.simMat = new RawShaderMaterial({defines: d, uniforms: u, vertexShader: vShader, fragmentShader: fShader});

    }

    public initSim(renderer: any): void {

        this.renderQuad.texture = this.simData;
        renderer.render(this.scene, this.camera, this.bufferA);
        this.renderQuad.texture = this.bufferA;
        renderer.render(this.scene, this.camera, this.bufferB);

        this.renderQuad.material = this.simMat;
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uVel'].value = this.bufferA;

    }

    public update(renderer: any, headPos: WebGLRenderTarget, target: Vector3, t: number): void {

        const tmp = this.bufferA;
        this.bufferA = this.bufferB;
        this.bufferB = tmp;

        (<RawShaderMaterial>this.renderQuad.material).uniforms['uPos'].value = headPos;
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uVel'].value = this.bufferB;
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uTarget'].value.copy(target);
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uTime'].value += t;

        renderer.render(this.scene, this.camera, this.bufferA);

    }

    get outPut() {

        return this.bufferA;

    }

}