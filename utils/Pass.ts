import { Scene, OrthographicCamera, WebGLRenderTarget, ClampToEdgeWrapping, LinearFilter, UnsignedByteType, ShaderMaterial, Texture, RGBAFormat } from 'three';
import RenderQuad from './renderQuad/RenderQuad';
const glslify = require('glslify');

import eventEmitter from './emitter';
const emitter = eventEmitter.emitter;

interface IUniforms {

    uTex: {type: string, value: WebGLRenderTarget | Texture | null}

}

export default class Pass {

    public renderWidth: number;
    public renderHeight: number;

    public scene: Scene;
    public camera: OrthographicCamera;
    public renderQuad: RenderQuad;
    public rtt: WebGLRenderTarget;
    public blitMaterial: ShaderMaterial; 

    constructor(width: number = 1, height: number = 1) {

        this.renderWidth = width;
        this.renderHeight = height;

        this.scene = new Scene();
        this.camera = new OrthographicCamera(-this.renderWidth, this.renderWidth, this.renderHeight, -this.renderHeight, 0.1, 1);
        this.renderQuad = new RenderQuad();
        this.scene.add(this.renderQuad);

        this.rtt = this.createRenderTexture(width, height);

        const u: IUniforms = {

            uTex: {type: 't', value: null}

        }

        const vShader: string = `
        
        varying vec2 vUV;

        void main() {

            gl_Position = vec4(position, 1.0);
            vUV = uv;

        }
        
        `;

        const fShader: string = `
        
            uniform sampler2D uTex;
            
            varying vec2 vUV;

            void main() {

                vec3 outPut = texture2D(uTex, vUV).xyz;
                gl_FragColor = vec4(outPut, 1.0);

            }

        `
        
        this.blitMaterial = new ShaderMaterial({uniforms: u, vertexShader: vShader, fragmentShader: fShader})
        this.blitMaterial.transparent = false;
        this.blitMaterial.depthTest = false;
        this.blitMaterial.depthWrite = false;

        emitter.on('resizing', this.onResize);

    }

    private onResize = (): void => {

        this.renderWidth = window.innerWidth;
        this.renderHeight = window.innerHeight;

    }

    public createRenderTexture(w: number, h: number) : WebGLRenderTarget {

        return new WebGLRenderTarget(
            w,
            h,
            {
                wrapS: ClampToEdgeWrapping,
                wrapT: ClampToEdgeWrapping,
                minFilter: LinearFilter,
                magFilter: LinearFilter,
                format: RGBAFormat,
                type: UnsignedByteType,
                generateMipmaps: false,
                stencilBuffer: false,
                depthBuffer: false
            });

    }

}