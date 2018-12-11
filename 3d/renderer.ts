import { WebGLRenderer, Color } from 'three'

class Renderer extends WebGLRenderer {
    constructor(params: {antialias: boolean, precision: string}){
        super(params);
    }

    public init(): void {

        this.setSize(window.innerWidth, window.innerHeight);
        this.setClearColor(new Color(0.0, 0.0, 0.0));

        this.domElement.style.position = 'absolute';
        this.domElement.style.margin = '0';
        this.domElement.style.top = '0';
        this.domElement.style.left = '0';
        this.domElement.style.width = '100%';
        this.domElement.style.height = '100%';
        this.domElement.style.zIndex = '-1';
        this.domElement.style.overflow = 'hidden';

        document.body.appendChild(renderer.domElement);

    }

}

const renderer = new Renderer({antialias: false, precision: 'lowp'});
// const renderer = new Renderer({antialias: false, precision: 'mediump'});
export default renderer;