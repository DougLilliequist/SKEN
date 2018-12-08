import { Mesh, RawShaderMaterial, Vector3 } from 'three';

import Geometry from './Geometry';
import Material from './Material';

import Flocking from './flocking/Flocking';

import eventEmitter from '../../utils/emitter';
const emitter = eventEmitter.emitter;

    export default class Lights extends Mesh {

    private headPositions: Float32Array;
    private ribbonCount: number;
    private segmentCount: number;

    private flockingSim: Flocking;

    constructor(ribbonCount: number) {

        const segmentCount:number = 64.0; //move this somewhere else

        const geo: Geometry = new Geometry(ribbonCount, segmentCount);
        const mat: Material = new Material(ribbonCount, segmentCount);
        
        super(geo, mat);

        this.ribbonCount = ribbonCount;
        this.segmentCount = segmentCount;
        this.frustumCulled = false;

        this.init();
        this.initFlocking();
        this.initEvents();

    }

    private init(): void {

        this.headPositions = new Float32Array(this.ribbonCount * (this.segmentCount) * 3.0); //rename

    }

    private initFlocking(): void {

        this.flockingSim = new Flocking(this.ribbonCount);

    }

    private initEvents(): void {

        emitter.on('resizing', this.onResize.bind(this));

    }

    public updateHeadPositions(target: Vector3): void {

        for(let y = 0; y < this.ribbonCount; y++) {

            let offset: number = ((this.segmentCount * 3.0)) * (1.0 + y);

                for(let x = offset; x > this.segmentCount * 3 * y; x -= 3) {

                this.headPositions[x - 3] = this.headPositions[x - 6];
                this.headPositions[x - 2] = this.headPositions[x - 5];
                this.headPositions[x - 1] = this.headPositions[x - 4];

            }

        }

        this.flockingSim.update(target);

        let j = 0;
        while(j < this.ribbonCount) {

            const b = this.flockingSim.boids[j].position;

            let index: number = j * this.segmentCount * 3;

            this.headPositions[index + 0] = b.x;
            this.headPositions[index + 1] = b.y;
            this.headPositions[index + 2] = b.z;

            j++;

        }

        this.positions = this.headPositions;

    }

    private onResize(): void {

        (<RawShaderMaterial>this.material).uniforms['uAspectRatio'].value = window.innerWidth / window.innerHeight;
    }

    get positions() {

        return (<RawShaderMaterial>this.material).uniforms['uHeadPosition'].value;

    }

    set positions(data: Float32Array) {

        (<RawShaderMaterial>this.material).uniforms['uHeadPosition'].value = data;

    }

}
