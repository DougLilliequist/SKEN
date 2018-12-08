//create an object3d containing a group of simple spheres
//and assign each position to be the resulting flocking targets

import * as THREE from 'three';

import Flocking from './flocking/Flocking';

export default class FlockingTest extends THREE.Object3D {

    private testMeshes: THREE.Mesh[];
    private flockingSim: Flocking;

    constructor(count : number) {

        super()

        this.testMeshes = [];

        let i = 0;
        while(i < count) {

            // this.testMeshes[i] = new THREE.Mesh(
            //     new THREE.SphereBufferGeometry(4, 64, 32),
            //     new THREE.MeshNormalMaterial({}))

            this.testMeshes[i] = new THREE.Mesh(
                new THREE.SphereBufferGeometry(4, 64, 32),
                new THREE.MeshBasicMaterial({color: 0xffffff}))

            this.add(this.testMeshes[i]);

            i++;

        }

        this.flockingSim = new Flocking(count);

    }

    public update(target: THREE.Vector3): void {

        this.flockingSim.update(target);

        let i = 0;

        while(i < this.testMeshes.length) {

            this.testMeshes[i].position.copy(this.flockingSim.boids[i].position);
            i++;
        } 


    }

}