import { Points, Mesh, RawShaderMaterial, Vector3 } from 'three';

import Geometry from './Geometry';
import Material from './Material';

import Flocking from './flocking/Flocking';

export default class Lights extends Mesh {

    private posIterator: number;
    private headPositions: Float32Array;
    private ribbonCount: number;
    private posCount: number;

    private flockingSim: Flocking;

    constructor(ribbonCount: number) {

        const posCount:number = 30.0;

        const geo: Geometry = new Geometry(ribbonCount, posCount);
        const mat: Material = new Material(ribbonCount, posCount);

        super(geo, mat);

        this.ribbonCount = ribbonCount;
        this.posCount = posCount;

        this.init();
        this.initFlocking();

    }

    private init(): void {

        this.posIterator = 0;
        this.headPositions = new Float32Array(this.ribbonCount * this.posCount * 3.0);

    }

    private initFlocking(): void {

        this.flockingSim = new Flocking(this.ribbonCount);

    }

    public updateHeadPositions(target: Vector3): void {

        this.flockingSim.update(target);

        let i = this.headPositions.length;
        while(i > 0) {

            let i3 = i * 3;
            this.headPositions[i3 + 0] = this.headPositions[i3 - 3];
            this.headPositions[i3 + 1] = this.headPositions[i3 - 2];
            this.headPositions[i3 + 2] = this.headPositions[i3 - 1];

            i -= 1;

        }

        const t = this.flockingSim.boids[0].position;

        this.headPositions[0] = t.x;
        this.headPositions[1] = t.y;
        this.headPositions[2] = t.z;

        this.positions = this.headPositions;

    }

    //---------------------------------------------------------------------------------

    get positions() {

        return (<RawShaderMaterial>this.material).uniforms['uHeadPosition'].value;

    }

    set positions(data: Float32Array) {

        (<RawShaderMaterial>this.material).uniforms['uHeadPosition'].value = data;

    }

}
