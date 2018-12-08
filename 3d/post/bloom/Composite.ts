/**
 * @author: Douglas Lilliequist (http://www.douglaslilliequist.xyz/
 * inspired from mrdoob's (https://github.com/mrdoob) unrealbloom pass
 * source by : https://github.com/mrdoob/three.js/blob/master/examples/js/postprocessing/UnrealBloomPass.js
 * ln: 90 + 324
 * 
 */

import { ShaderMaterial, WebGLRenderTarget, Vector2, Vector3, Color } from 'three';
const glslify = require('glslify');

interface ICompositeDefines {

    "NUM_MIPS": number;

}

interface ICompositeUniforms {

    uBlurTexture1: { value: WebGLRenderTarget | null },
    uBlurTexture2: { value: WebGLRenderTarget | null },
    uBlurTexture3: { value: WebGLRenderTarget | null },
    uBlurTexture4: { value: WebGLRenderTarget | null },
    uBlurTexture5: { value: WebGLRenderTarget | null },
    uDirtTexture: { value: WebGLRenderTarget | null },
    uBloomStrength: { value: number },
    uBloomFactors: { value: number[] },
    uBloomTintColors: { value: Vector3[] },
    uBloomRadius: { value: number },
    uResolution: {value: Vector2}

}

export default class Composite extends ShaderMaterial {

    constructor(mipCount: number, w: number, h: number) {

        const d: ICompositeDefines = {

            "NUM_MIPS": mipCount

        }

        const u: ICompositeUniforms = {

            uBlurTexture1: { value: null },
            uBlurTexture2: { value: null },
            uBlurTexture3: { value: null },
            uBlurTexture4: { value: null },
            uBlurTexture5: { value: null },
            uDirtTexture: { value: null },
            uBloomStrength: { value: 1.0 },
            uBloomFactors: { value: null },
            uBloomTintColors: { value: null },
            uBloomRadius: { value: 0.0 },
            uResolution: {value: new Vector2(w, h)}

        }

        const vShader = glslify('../shaders/pass.vs.glsl');
        const fShader = glslify('../shaders/composite.fs.glsl');

        super({defines: d, uniforms: u, vertexShader: vShader, fragmentShader: fShader})

    }

}