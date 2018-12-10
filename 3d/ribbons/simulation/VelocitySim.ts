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
    
    uSeparationSpeed: {type: string, value: number}
    uSeparationForce: {type: string, value: number}
    
    uAlignSpeed: {type: string, value: number}
    uAlignForce: {type: string, value: number}
    
    uCohesionSpeed: {type: string, value: number}
    uCohesionForce: {type: string, value: number}

    uSteerSpeed: {type: string, value: number}
    uSteerForce: {type: string, value: number}
    uCorrectionSpeed: {type: string, value: number}
    uCorrectionForce: {type: string, value: number}
    uDivergenceSpeed: {type: string, value: number}
    uDivergenceForce: {type: string, value: number}

    uMaxSpeed: {type: string, value: number}

    uSeparationDist: {type: string, value: number}
    uAlignDist: {type: string, value: number}
    uCohesionDist: {type: string, value: number}
    uBounds: {type: string, value: number}

    uSteerK: {type: string, value: number}
    uDivergenceK: {type: string, value: number}
    uCorrectionK: {type: string, value: number}
    uSeparationK: {type: string, value: number}
    uAlignmentK: {type: string, value: number}
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

        const params = (<any>window).params;

        const u: IVelocitySimUniforms = {


            uVel: { type: 't', value: null },
            uPos: {type: 't', value: null},

            uSeparationSpeed: {type: 'f', value: params.separationSpeed},
            uSeparationForce: {type: 'f', value: params.separationForce},
            
            uAlignSpeed: {type: 'f', value: params.alignSpeed},
            uAlignForce: {type: 'f', value: params.alignForce},
            
            uCohesionSpeed: {type: 'f', value: params.cohesionSpeed},
            uCohesionForce: {type: 'f', value: params.cohesionForce},

            uSteerSpeed: {type: 'f', value: params.steerSpeed},
            uSteerForce: {type: 'f', value: params.steerForce},

            uCorrectionSpeed: {type: 'f', value: params.correctionSpeed},
            uCorrectionForce: {type: 'f', value: params.correctionForce},
            uDivergenceSpeed: {type: 'f', value: params.divergenceSpeed},
            uDivergenceForce: {type: 'f', value: params.divergenceForce},

            uMaxSpeed: {type: 'f', value: params.maxSpeed},

            uSeparationDist: {type: 'f', value: params.separationDist},
            uAlignDist: {type: 'f', value: params.alignDist},
            uCohesionDist: {type: 'f', value: params.cohesionDist},
            uBounds: {type: 'f', value: params.bounds},

            uSteerK: {type: 'f', value: params.steerK},
            uDivergenceK: {type: 'f', value: params.divergenceK},
            uCorrectionK: {type: 'f', value: params.correctionK},
            uSeparationK: {type: 'f', value: params.separationK},
            uAlignmentK: {type: 'f', value: params.alignmentK},
            uCohesionK: {type: 'f', value: params.cohesionK},
                
            // uSeparationSpeed: {type: 'f', value: 35.0},
            // uSeparationForce: {type: 'f', value: 1.2},
            
            // uAlignSpeed: {type: 'f', value: 35.0},
            // uAlignForce: {type: 'f', value: 1.2},
            
            // uCohesionSpeed: {type: 'f', value: 35.0},
            // uCohesionForce: {type: 'f', value: 0.9},

            // uSteerSpeed: {type: 'f', value: 35.0},
            // uSteerForce: {type: 'f', value: 1.2},

            // uSeparationDist: {type: 'f', value: 50.0},
            // uAlignDist: {type: 'f', value: 90.0},
            // uCohesionDist: {type: 'f', value: 240},
            // uBounds: {type: 'f', value: 1500.0},

            // uSteerK: {type: 'f', value: 0.5},
            // uSeparationK: {type: 'f', value: 1.5},
            // uAlignmentK: {type: 'f', value: 1.0},
            // uCohesionK: {type: 'f', value: 1.0},

            uTarget: { type: 'v3', value: new Vector3(0.0, 0.0, 0.0)},

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

        this.updateParams();

        (<RawShaderMaterial>this.renderQuad.material).uniforms['uPos'].value = headPos;
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uVel'].value = this.bufferB;
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uTarget'].value.copy(target);
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uTime'].value += t;

        renderer.render(this.scene, this.camera, this.bufferA);

    }

    private updateParams(): void {

        const params = (<any>window).params;

        (<RawShaderMaterial>this.renderQuad.material).uniforms['uSeparationSpeed'].value  = params.separationSpeed;
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uSeparationForce'].value  = params.separationForce;
        
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uAlignSpeed'].value  = params.alignSpeed;
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uAlignForce'].value  = params.alignForce;

        (<RawShaderMaterial>this.renderQuad.material).uniforms['uCohesionSpeed'].value  = params.cohesionSpeed;
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uCohesionForce'].value  = params.cohesionForce;

        (<RawShaderMaterial>this.renderQuad.material).uniforms['uSteerSpeed'].value  = params.steerSpeed;
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uSteerForce'].value  = params.steerForce;

        (<RawShaderMaterial>this.renderQuad.material).uniforms['uMaxSpeed'].value  = params.maxSpeed;

        (<RawShaderMaterial>this.renderQuad.material).uniforms['uSeparationDist'].value  = params.separationDist;
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uAlignDist'].value  = params.alignDist;
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uCohesionDist'].value  = params.cohesionDist;
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uBounds'].value  = params.bounds;

        (<RawShaderMaterial>this.renderQuad.material).uniforms['uSteerK'].value  = params.steerK;
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uSeparationK'].value  = params.separationK;
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uAlignmentK'].value  = params.alignmentK;
        (<RawShaderMaterial>this.renderQuad.material).uniforms['uCohesionK'].value  = params.cohesionK;

    }

    get outPut() {

        return this.bufferA;

    }

}