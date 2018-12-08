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

        // this.params = {

        //     avoidForce: 0.3,
        //     avoidSpeed: 15.0,
        //     maxForce: 0.7,
        //     maxSpeed: 15.0,
        //     minDist: 45,
        //     maxDist: 60

        // }

        // this.params = {

        //     avoidForce: 0.15,
        //     avoidSpeed: 25.0,
        //     maxForce: 0.3,
        //     maxSpeed: 22.0,
        //     minDist: 50,
        //     maxDist: 60

        // }

        this.params = {

            avoidForce: 0.4,
            avoidSpeed: 15.0,
            maxForce: 0.2,
            maxSpeed: 18,
            minDist: 50,
            maxDist: 65

        }


        // this.params = {

        //     avoidForce: 0.22,
        //     avoidSpeed: 1.0,
        //     maxForce: 0.7,
        //     maxSpeed: 1.0,
        //     minDist: 50,
        //     maxDist: 60

        // }


        this.weights = {

            steerK: 0.5,
            avoidK: 1.8,
            allignK: 1.0,
            cohereK: 1.0,

        }

        // this.params = {

        //     avoidForce: 0.22,
        //     avoidSpeed: 15.0,
        //     maxForce: 0.1,
        //     maxSpeed: 15.0,
        //     minDist: 50,
        //     maxDist: 60

        // }


        // this.weights = {

        //     steerK: 0.05,
        //     avoidK: 1.5,
        //     allignK: 1.0,
        //     cohereK: 0.5,

        // }


        // this.params = {

        //     avoidForce: 0.08,
        //     avoidSpeed: 0.2,
        //     maxForce: 0.2,
        //     maxSpeed: 0.5,
        //     minDist: 40,
        //     maxDist: 60

        // }


        // this.weights = {

        //     steerK: 0.1,
        //     avoidK: 1.0,
        //     allignK: 0.0,
        //     cohereK: 0.0,

        // }

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

        let desiredVelocity: Vector3 = target.sub(this.position.clone());
        desiredVelocity = desiredVelocity.normalize().multiplyScalar(this.params.maxSpeed);
        const steerForce: Vector3 = desiredVelocity.sub(this.vel.clone());
        if(steerForce.length() > this.params.maxForce) steerForce.normalize().multiplyScalar(this.params.maxForce);
        this.acc.add(steerForce.multiplyScalar(k));

    }

    public flock(target: Vector3, n: Boid[]): void {

        this.resetAvereges();

        for(let i = 0; i < n.length; i++) {

            if(n[i] === this) continue;

            let dir: Vector3 = n[i].position.clone().sub(this.position.clone());
            const dist: number = dir.length();

            if(dist < this.params.minDist) {

                let k: number = dist / this.params.minDist;
                this.avg.avoid.add(dir.multiplyScalar(1.0 - k));
                this.avgCount.avoid++;

            } else if (dist < this.params.maxDist) {
         
                this.avg.align.add(n[i].vel.clone());
                this.avgCount.align++;
            
            } else if (dist < this.params.maxDist) {

                this.avg.cohere.add(dir);
                this.avgCount.cohere++;

            }

    }

    if(this.avgCount.avoid > 0.0) {

        const avg: number = 1.0 / this.avgCount.avoid;
        this.avg.avoid.multiplyScalar(avg);
        this.avg.avoid = this.avg.avoid.normalize().multiplyScalar(this.params.avoidSpeed);
        const steerForce: Vector3 = this.avg.avoid.sub(this.vel.clone());
        if(steerForce.length() > this.params.avoidForce) steerForce.normalize().multiplyScalar(this.params.avoidForce);
        this.acc.sub(steerForce.multiplyScalar(this.weights.avoidK));

    } 

    if(this.avgCount.align > 0.0) {

        const avg: number = 1.0 / this.avgCount.align;
        this.avg.align.multiplyScalar(avg);
        this.avg.align.normalize().multiplyScalar(this.params.maxSpeed);
        const alignForce: Vector3 = this.avg.align.sub(this.vel.clone());
        if(alignForce.length() > this.params.maxForce) alignForce.normalize().multiplyScalar(this.params.maxForce);
        this.acc.add(alignForce.multiplyScalar(this.weights.allignK));

    }

    if(this.avgCount.cohere > 0.0) {

        const avg: number = 1.0 / this.avgCount.cohere;
        this.avg.cohere.multiplyScalar(avg);
        this.avg.cohere.normalize().multiplyScalar(this.params.maxSpeed);
        const cohesionForce: Vector3 = this.avg.cohere.sub(this.vel.clone());
        if(cohesionForce.length() > this.params.maxForce) cohesionForce.normalize().multiplyScalar(this.params.maxForce);
        this.acc.add(cohesionForce.multiplyScalar(this.weights.cohereK));

    }

    this.steer(target, this.weights.steerK);

        this.vel.add(this.acc);
        if(this.vel.length() > this.params.maxSpeed) this.vel.normalize().multiplyScalar(this.params.maxSpeed);
        this.position.add(this.vel);
        this.acc.multiplyScalar(0);

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