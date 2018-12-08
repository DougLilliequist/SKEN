import {RawShaderMaterial, Vector2, FrontSide, DoubleSide, AdditiveBlending} from 'three';

const glslify = require('glslify');

interface ICursorUniforms {

    uMousePos: {type: string, value: Vector2};
    uAngle: {type: string, value: number};
    uScale: {type: string, value: number};
    uAlpha: {type: string, value: number};
    uAspectRatio: {type: string, value: number}

}

export default class Material extends RawShaderMaterial {

    constructor() {
    
        const u: ICursorUniforms = {

            uMousePos: {type: 'v2', value: new Vector2(0.0, 0.0)},
            uAngle: {type: 'f', value: Math.PI * .25},
            uScale: {type: 'f', value: 0.05},
            uAlpha: {type: 'f', value: 1.0},
            uAspectRatio: {type: 'f', value: window.innerWidth / window.innerHeight}

        }

        const vShader = glslify('./shaders/cursor.vs.glsl');
        const fShader = glslify('./shaders/cursor.fs.glsl');

        super({uniforms: u, vertexShader: vShader, fragmentShader: fShader});
        this.transparent = true;
        this.blending = AdditiveBlending;
        this.side = DoubleSide;

    }

}