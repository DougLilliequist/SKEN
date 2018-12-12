import PositionSim from './PositionSim';
import VelocitySim from './VelocitySim';
import HeadPositionSim from './HeadPositionSim';
import { Vector3 } from 'three';

export default class Simulator {

    private positionSim: PositionSim;
    private velocitySim: VelocitySim;
    private headPositionSim: HeadPositionSim;

    constructor(renderer: any, isMobile: boolean, width: number, height: number) {

        this.initSimulators(renderer, isMobile, width, height);

    }

    private initSimulators(renderer: any, isMobile: boolean, width: number, height: number): void {

        this.positionSim = new PositionSim(width, height, isMobile);
        this.velocitySim = new VelocitySim(1.0, height, isMobile);
        this.headPositionSim = new HeadPositionSim(1.0, height, isMobile);

        this.headPositionSim.initSim(renderer);
        this.velocitySim.initSim(renderer);
        this.positionSim.initSim(renderer);

    }

    public update(renderer: any, target: Vector3, t: number): void {

        this.velocitySim.update(renderer, this.headPositionSim.bufferA, target, t);
        this.headPositionSim.update(renderer, this.velocitySim.bufferA);
        this.positionSim.update(renderer, this.headPositionSim.bufferA);

    }

    get positions() {

        return this.positionSim.bufferA;

    }

    get velocities() {

        return this.velocitySim.bufferA;

    }

    get headPositions() {

        return this.headPositionSim.bufferA;

    }

}