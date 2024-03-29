import World3D from './3d/world3d';
import * as dat from 'dat.gui';

class App {

    private enableGui: boolean;

    constructor() {

        this.enableGui = false;

        this.init();
        this.initWorld();

    }

    private init(): void {

        const params = (<any>window).params = {


            // separationDist: 107.0,
            // alignDist: 232.0,
            // cohesionDist: 265.0,
            // bounds: 1188.0,

            // separationSpeed: 35.0,
            // separationForce: 1.2,

            // alignSpeed: 35.0,
            // alignForce: 1.2,

            // cohesionSpeed: 35.0,
            // cohesionForce: 0.5,

            // steerSpeed: 35.0,
            // steerForce: 0.74,

            // correctionSpeed: 35.0,
            // correctionForce: 1.0,

            // divergenceSpeed: 35.0,
            // divergenceForce: 0.5,

            // maxSpeed: 45.0,

            // steerK: 1.28,
            // divergenceK: 0.8,
            // correctionK: 0.8,
            // separationK: 1.8,
            // alignmentK: 0.5,
            // cohesionK: 0.5,

            // temporalFreq: 1.0

            separationDist: 120.0,
            alignDist: 240.0,
            cohesionDist: 300.0,
            bounds: 1200.0,

            separationSpeed: 35.0,
            separationForce: 1.2,

            alignSpeed: 35.0,
            alignForce: 0.8,

            cohesionSpeed: 35.0,
            cohesionForce: 1.4,

            steerSpeed: 35.0,
            steerForce: 0.9,

            correctionSpeed: 35.0,
            correctionForce: 1.2,

            divergenceSpeed: 35.0,
            divergenceForce: 1.2,

            maxSpeed: 45.0,

            steerK: 1.25,
            divergenceK: 0.8,
            correctionK: 0.8,
            separationK: 2.0,
            alignmentK: 0.8,
            cohesionK: 0.3,

            temporalFreq: 1.0

        };
        
        if(this.enableGui) {
        
            (<any>window).gui = new dat.GUI();
            (<any>window).gui.closed = false;

            (<any>window).gui.addFolder('flocking distances');
            (<any>window).gui.add(params, 'separationDist', 0, 500);
            (<any>window).gui.add(params, 'alignDist', 0, 500);
            (<any>window).gui.add(params, 'cohesionDist', 0, 500);
            (<any>window).gui.add(params, 'bounds', 0, 2000);

            (<any>window).gui.addFolder('flocking speeds and forces');
            (<any>window).gui.add(params, 'separationSpeed', 0, 50);
            (<any>window).gui.add(params, 'separationForce', 0, 10);
            (<any>window).gui.add(params, 'alignSpeed', 0, 50);
            (<any>window).gui.add(params, 'alignForce', 0, 10);
            (<any>window).gui.add(params, 'cohesionSpeed', 0, 50);
            (<any>window).gui.add(params, 'cohesionForce', 0, 10);
        
            (<any>window).gui.addFolder('seeking speeds and forces');
            (<any>window).gui.add(params, 'steerSpeed', 0, 50);
            (<any>window).gui.add(params, 'steerForce', 0, 10);
            (<any>window).gui.add(params, 'correctionSpeed', 0, 50);
            (<any>window).gui.add(params, 'correctionForce', 0, 10);
            (<any>window).gui.add(params, 'divergenceSpeed', 0, 50);
            (<any>window).gui.add(params, 'divergenceForce', 0, 10);

            (<any>window).gui.add(params, 'maxSpeed', 0, 100);

            (<any>window).gui.addFolder('flocking weights');
            (<any>window).gui.add(params, 'steerK', 0, 10);
            (<any>window).gui.add(params, 'correctionK', 0, 10);
            (<any>window).gui.add(params, 'divergenceK', 0, 10);
            (<any>window).gui.add(params, 'separationK', 0, 10);
            (<any>window).gui.add(params, 'alignmentK', 0, 10);
            (<any>window).gui.add(params, 'cohesionK', 0, 10);
        
        }

    }

    private initWorld(): void {

        const world = new World3D();

    }

}

window.onload = () => new App();