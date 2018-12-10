import { Mesh, RawShaderMaterial, Vector3, WebGLRenderTarget, Texture } from 'three';

import Geometry from './Geometry';
import Material from './Material';

import Simulator from './simulation/Simulator';

import eventEmitter from '../../utils/emitter';
const emitter = eventEmitter.emitter;

    export default class LightsGPU extends Mesh {

    private ribbonCount: number;
    private segmentCount: number;

    private simulator: Simulator;

    constructor(renderer: any, ribbonCount: number, isMobile: boolean = false) {

        const segmentCount:number = isMobile == false ? 128.0 : 64.0; //move this somewhere else

        const geo: Geometry = new Geometry(ribbonCount, segmentCount);
        const mat: Material = new Material(ribbonCount, segmentCount, isMobile);
        
        super(geo, mat);

        this.ribbonCount = ribbonCount;
        this.segmentCount = segmentCount;
        this.frustumCulled = false;

        this.init(renderer);
        this.initEvents();

    }

    private init(renderer: any): void {

        this.simulator = new Simulator(renderer, this.segmentCount, this.ribbonCount);

    }

    private initEvents(): void {

        emitter.on('resizing', this.onResize.bind(this));

    }

    public update(renderer: any, target: Vector3, t: number): void {

        this.simulator.update(renderer, target, t);
        this.positions = this.simulator.positions;
        (<RawShaderMaterial>this.material).uniforms['uTime'].value = t;

    }

    private onResize(): void {

        (<RawShaderMaterial>this.material).uniforms['uAspectRatio'].value = window.innerWidth / window.innerHeight;
    }

    get positions() {

        return (<RawShaderMaterial>this.material).uniforms['uPosition'].value;

    }

    set positions(data: WebGLRenderTarget | Texture) {

        (<RawShaderMaterial>this.material).uniforms['uPosition'].value = data;

    }

}
