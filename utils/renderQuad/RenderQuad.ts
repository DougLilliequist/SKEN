import { PlaneBufferGeometry, RawShaderMaterial, Mesh, Texture, WebGLRenderTarget } from 'three';
const glslify = require('glslify');

interface ITextureUniform {

    type: string;
    value: WebGLRenderTarget | Texture | null;

}

interface IUniforms {

    uTex: ITextureUniform;

}

export default class RenderQuad extends Mesh {

    constructor() {

        const geo: PlaneBufferGeometry = new PlaneBufferGeometry(2, 2, 1, 1);

        const u: IUniforms = {

            uTex: { type: 't', value: null}

        };

        const vShader = glslify('./shaders/renderQuad.vs.glsl');
        const fShader = glslify('./shaders/renderQuad.fs.glsl');

        const mat: RawShaderMaterial = new RawShaderMaterial({uniforms: u, vertexShader: vShader, fragmentShader: fShader});
        mat.transparent = false;

        super(geo, mat);

    }

    get texture() {

        return (<RawShaderMaterial>this.material).uniforms['uTex'].value;

    }

    set texture(texture: WebGLRenderTarget | Texture) {

        (<RawShaderMaterial>this.material).uniforms['uTex'].value = texture;

    }

}