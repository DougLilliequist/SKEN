import { Vector3 } from 'three'

interface IFlockingParams {

    avoidForce: number;
    avoidSpeed: number;
    maxForce: number;
    maxSpeed: number;
    minDist: number;
    maxDist: number;

}

interface IFlockingWeights {

    steerK: number;
    avoidK: number;
    allignK: number;
    cohereK: number;

}

interface IAvgVectors {

    avoid: Vector3;
    align: Vector3;
    cohere: Vector3;

}

interface IAvgCount {

    avoid: number;
    align: number;
    cohere: number;

}

export default class Boid {

    public position: Vector3;
    private params: IFlockingParams;
    private weights: IFlockingWeights;
    private avg: IAvgVectors;
    private avgCount: IAvgCount;

    private acc: Vector3;
    private vel: Vector3;

    constructor(startPos: Vector3) {

        this.init(startPos);

    }

    private init(startPos: Vector3): void {


        //will eventually be set up so each boid has a personality
        //by having different params

        this.params = {

            avoidForce: 0.2,
            avoidSpeed: 1.3,
            maxForce: 0.1,
            maxSpeed: 3.8,
            minDist: 16,
            maxDist: 30

        }

        this.weights = {

            steerK: 1.0,
            avoidK: 1.8,
            allignK: 1.0,
            cohereK: 1.0,

        }

        this.avg = {

            avoid: new Vector3(0.0, 0.0, 0.0),
            align: new Vector3(0.0, 0.0, 0.0),
            cohere: new Vector3(0.0, 0.0, 0.0)

        }

        this.avgCount = {

            avoid: 0.0,
            align: 0.0,
            cohere: 0.0

        }
        
        this.acc = new Vector3(0.0, 0.0, 0.0);
        this.vel = new Vector3(0.0, 0.0, 0.0);

        this.position = startPos.clone();

    }

    public steer(target: Vector3, k: number): void {

        //WILL BE REMOVED SOON.

        //A force in a simulation context, is a power that pushes something, in a certain direction with x power
        //and in the context of a simulation, a force has a direction and magnitude (which is the same as a vector!)
        //with that said, to describe a force, I need a direction towards a desired target, then normliaze the vector to set
        //the strength (magnitude) of the force, which will give me a vector that will be applied to an
        //vector that describes acceleration (which accumelates all forces that will result in a direction)
        //which my object will accelerate at

        let desiredVelocity: Vector3 = target.sub(this.position.clone());
        desiredVelocity = desiredVelocity.normalize().multiplyScalar(this.params.maxSpeed);
        const steerForce: Vector3 = desiredVelocity.sub(this.vel.clone());
        if(steerForce.length() > this.params.maxForce) steerForce.normalize().multiplyScalar(this.params.maxForce);
        this.acc.add(steerForce.multiplyScalar(k));
        // this.vel.add(this.acc);
        // if(this.vel.length() > this.params.maxSpeed) this.vel.normalize().multiplyScalar(this.params.maxSpeed);
        // this.position.add(this.vel);
        // this.acc.multiplyScalar(0);


    }

    public flock(target: Vector3, n: Boid[]): void {

        this.resetAvereges();

        for(let i = 0; i < n.length; i++) {

            if(n[i] === this) continue;

            let dir: Vector3 = n[i].position.clone().sub(this.position.clone());
            const dist: number = dir.length();
            let k = dist / 180.0;

            if(dist < this.params.minDist) {

                let avoidK: number = dist / this.params.minDist;
                let desired: Vector3 = dir.normalize().multiplyScalar(this.params.avoidSpeed * (1.0 - avoidK));
                let avoidForce: Vector3 = desired.sub(this.vel.clone());
                if(avoidForce.length() > this.params.avoidForce) avoidForce = avoidForce.normalize().multiplyScalar(this.params.avoidForce);
                this.acc.sub(avoidForce.multiplyScalar(this.weights.avoidK));

            } else if (dist < this.params.maxDist) {

                let nVel = n[i].vel.clone();
                let avgVel = this.vel.clone().add(nVel).multiplyScalar(0.7);
                avgVel = avgVel.normalize().multiplyScalar(this.params.maxSpeed);
                let alignmentForce = avgVel.sub(this.vel.clone());
                if(alignmentForce.length() > this.params.maxForce) alignmentForce = alignmentForce.normalize().multiplyScalar(this.params.maxForce);
                this.acc.add(alignmentForce.multiplyScalar(this.weights.allignK));


            } else {

            // k = 1.0 - k;
            k = 1.0 - (Math.cos(k * (2 * Math.PI)) * 0.5 + 0.5);
            // let desired = new Vector3(0.0, 0.0,0.0).sub(this.position.clone());
            // desired = dir.normalize().multiplyScalar(this.params.maxSpeed);
            let desired = dir.normalize().multiplyScalar(this.params.maxSpeed);
            let cohesionForce = desired.sub(this.vel.clone());
            if(cohesionForce.length() > this.params.maxForce * 0.001 * k) cohesionForce = cohesionForce.normalize().multiplyScalar(this.params.maxForce * 0.001 * k);
            this.acc.add(cohesionForce.multiplyScalar(this.weights.cohereK));

        }

    }

    
/*    if(this.avgCount.avoid > 0.0) {

        // this.avg.avoid.multiplyScalar(1.0 / this.avgCount.avoid);
        // this.steer(this.avg.avoid, this.weights.avoidK);
        let desiredVelocity: Vector3 = this.avg.avoid.sub(this.position.clone());
        desiredVelocity = desiredVelocity.normalize().multiplyScalar(10.0);
        const steerForce: Vector3 = desiredVelocity.sub(this.vel.clone());
        if(steerForce.length() > this.params.maxForce) steerForce.normalize().multiplyScalar(this.params.maxForce);
        // if(steerForce.length() > 0.2) steerForce.normalize().multiplyScalar(0.2);
        this.acc.sub(steerForce.multiplyScalar(this.weights.avoidK));

    } */

        // this.steer(new Vector3(0.0, 0.0, 0.0), this.weights.steerK);
        // this.steer(target, this.weights.steerK);



        this.vel.add(this.acc);
        if(this.vel.length() > this.params.maxSpeed) this.vel.normalize().multiplyScalar(this.params.maxSpeed);
        this.position.add(this.vel);
        this.acc.multiplyScalar(0);

        // this.acc.multiplyScalar(0);

    }

    private resetAvereges(): void {

        this.avg.avoid.multiplyScalar(0);
        this.avg.align.multiplyScalar(0);
        this.avg.cohere.multiplyScalar(0);

        this.avgCount.avoid = 0.0;
        this.avgCount.align = 0.0;
        this.avgCount.cohere = 0.0;

    }

}