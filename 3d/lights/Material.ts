import { RawShaderMaterial, DoubleSide, AdditiveBlending, Texture, TextureLoader, ClampToEdgeWrapping, NearestFilter } from 'three'
const glslify = require('glslify');

interface ILightUniforms {

    uColor: {type: string, value: Texture}
    uWidth: {type: string, value: number},
    uHeadPosition: {type: string, value: Float32Array | null}
    uResolution: {type: string, value: number}
    uAspectRatio: {type: string, value: number}

}

interface ILightDefines {

    "POSCOUNT": number

}

export default class Material extends RawShaderMaterial {

    constructor(ribbonCount: number, count: number) {

        const d: ILightDefines = {

            "POSCOUNT": ribbonCount * count

        }

        const tex: Texture = new TextureLoader().load('./assets/lightColors.png');
        tex.wrapS = ClampToEdgeWrapping;
        tex.wrapT = ClampToEdgeWrapping;
        tex.minFilter = NearestFilter;
        tex.magFilter = NearestFilter;

        const u: ILightUniforms = {

            uColor: {type: 't', value: tex},
            uWidth: {type: 'f', value: 10.0},
            uHeadPosition: {type: 'fv', value: null},
            uResolution: {type: 'f', value: count},
            uAspectRatio: {type: 'f', value: window.innerWidth / window.innerHeight},

        }

        const vShader = glslify('./shaders/lights/lights.vs.glsl');
        const fShader = glslify('./shaders/lights/lights.fs.glsl');

        super({defines: d, uniforms: u, vertexShader: vShader, fragmentShader: fShader});

        this.transparent = true;
        this.blending = AdditiveBlending;
        this.side = DoubleSide;

    }

}