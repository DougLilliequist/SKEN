import { RawShaderMaterial, DoubleSide, AdditiveBlending, Texture, TextureLoader, ClampToEdgeWrapping, NearestFilter, Vector2, WebGLRenderTarget } from 'three'
const glslify = require('glslify');

interface ILightUniforms {

    uColor: {type: string, value: Texture}
    uWidth: {type: string, value: number},
    uPosition: {type: string, value: WebGLRenderTarget | Texture | null}
    uAspectRatio: {type: string, value: number}
    uTexelSize: {type: string, value: Vector2}

}

export default class Material extends RawShaderMaterial {

    constructor(ribbonCount: number, count: number, isMobile: boolean = false) {

        const tex: Texture = new TextureLoader().load('./assets/colors.png');
        tex.wrapS = ClampToEdgeWrapping;
        tex.wrapT = ClampToEdgeWrapping;
        tex.minFilter = NearestFilter;
        tex.magFilter = NearestFilter;

        const u: ILightUniforms = {

            uColor: {type: 't', value: tex},
            uWidth: {type: 'f', value: isMobile == false ? 30.0 : 60.0},
            uPosition: {type: 't', value: null},
            uAspectRatio: {type: 'f', value: window.innerWidth / window.innerHeight},
            uTexelSize: {type: 'v2', value: new Vector2(1.0 / count, 1.0 / ribbonCount)}

        }

        const vShader = glslify('./shaders/ribbons.vs.glsl');
        const fShader = glslify('./shaders/ribbons.fs.glsl');

        super({uniforms: u, vertexShader: vShader, fragmentShader: fShader});

        this.transparent = true;
        this.blending = AdditiveBlending;
        this.side = DoubleSide;

    }

}