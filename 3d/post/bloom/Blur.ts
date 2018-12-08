 /**
 * @author: Douglas Lilliequist (http://www.douglaslilliequist.xyz/)
 * inspired from mrdoob's (https://github.com/mrdoob) unrealbloom pass
 * source : https://github.com/mrdoob/three.js/blob/master/examples/js/postprocessing/UnrealBloomPass.js
 * ln: 272
 * 
 */

import { ShaderMaterial, WebGLRenderTarget, Vector2 } from 'three';
const glslify = require('glslify');

interface IBlurDefines {

    "KERNEL_RADIUS": number,
    "SIGMA": number

}

interface IBlurUniforms {

    uColorTexture: {type: string, value: WebGLRenderTarget | null},
    uTexSize: { type: string, value: Vector2},
    uDirection: { type: string, value: Vector2},

}

export default class Blur extends ShaderMaterial {

    constructor(kernelRadius: number) {

        const d: IBlurDefines = {

            "KERNEL_RADIUS": kernelRadius,
            "SIGMA": kernelRadius

        }

        const u: IBlurUniforms = {

            uColorTexture: {type: 't', value: null},
            uTexSize: {type: 'v2', value: new Vector2(0.5, 0.5)},
            uDirection: {type: 'v2', value: new Vector2(0.5, 0.5)},

        }

        const vShader = glslify('../shaders/pass.vs.glsl');
        const fShader = glslify('../shaders/blur.fs.glsl');

        super({defines: d, uniforms: u, vertexShader: vShader, fragmentShader: fShader})

    }  

}