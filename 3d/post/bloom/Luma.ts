/**
 * @author bhouston / http://clara.io/
 * @author: Douglas Lilliequist (http://www.douglaslilliequist.xyz/)
 * inspired from mrdoob's (https://github.com/mrdoob) unrealbloom pass
 * source: https://github.com/mrdoob/three.js/blob/34dc2478c684066257e4e39351731a93c6107ef5/examples/js/shaders/LuminosityHighPassShader.js
 */

import { ShaderMaterial, WebGLRenderTarget, Texture, Color } from 'three';
const glslify = require('glslify');

interface ILumaUniforms {

    uTexture: {type: string, value: WebGLRenderTarget | Texture | null};
    uLumaThreshold: {type: string, value: number};
    uSmoothWidth: {type: string, value: number};
    uDefaultColor: {type: string, value: Color};
    uDefaultAlpha: {type: string, value: number};

}

export default class Luma extends ShaderMaterial {

    constructor() {

        const u: ILumaUniforms = {

            uTexture: {type: 't', value: null},
            uLumaThreshold: {type: 'f', value: 1.0},
            uSmoothWidth: {type: 'f', value: 0.01},
            uDefaultColor: {type: 'c', value: new Color(0x000000)},
            uDefaultAlpha: {type: 'f', value: 0.0}

        }

        const vShader = glslify('../shaders/pass.vs.glsl');
        const fShader = glslify('../shaders/luma.fs.glsl');

        super({uniforms: u, vertexShader: vShader, fragmentShader: fShader});

    }

}