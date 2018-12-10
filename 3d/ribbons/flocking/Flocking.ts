//Returns an array with vector3's
//that will be used to determine the head positions of each ribbon
//each boid, will be steering towards a target (in my test case the mouse)
//but will be affected by flocking forces

//EVENTUAL FEATURE: I'll have each boids steering weights be affected over time

import Boid from './Boid';
import { Vector3 } from 'three';

export default class Flocking {

    public boids: Boid[];

    constructor(count: number) {

        this.init(count);

    }

    private init(count: number): void {

        this.boids = [];
        const startPos: Vector3 = new Vector3();
        
        let i: number  = 0;
        while(i < count) {

            // startPos.x = 400.0;
            // startPos.y = 0.0;
            // startPos.z = 0.0;
            startPos.x = ((Math.random() * 2.0) - 1.0) * 50.0;
            startPos.y = ((Math.random() * 2.0) - 1.0) * 50.0;
            startPos.z = ((Math.random() * 2.0) - 1.0) * 50.0;

            this.boids[i] = new Boid(startPos);

            i++;

        }

    }

    public update(target: Vector3): void {

        // this.boids.forEach( boid => boid.steer(target.clone()));
        this.boids.forEach( boid => boid.flock(target.clone(), this.boids));

    }

}