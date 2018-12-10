import World3D from './3d/world3d';
import * as dat from 'dat.gui';

class App {

    constructor() {

        const params = (<any>window).params = {

            separationDist: 45.0,
            alignDist: 50.0,
            cohesionDist: 100.0,
            bounds: 1500.0,

            steerSpeed: 10.0,
            steerForce: 0.2,

            separationSpeed: 2.0,
            separationForce: 0.2,

            alignmentSpeed: 2.0,
            alignmentForce: 0.2,

            cohesionSpeed: 2.0,
            cohesionForce: 0.2,

            steerK: 0.8,
            separationK: 1.5,
            alignmentK: 1.0,
            cohesionK: 1.0,

            maxForce: 1.2,
            maxSpeed: 10.0,

            temporalFreq: 1.0

        };

        (<any>window).gui = new dat.GUI();
        (<any>window).gui.closed = false;

        (<any>window).gui.addFolder('flocking distances');
        (<any>window).gui.add(params, 'separationDist', 0, 500);
        (<any>window).gui.add(params, 'alignDist', 0, 500);
        (<any>window).gui.add(params, 'cohesionDist', 0, 500);
        (<any>window).gui.add(params, 'bounds', 0, 1000);

        (<any>window).gui.addFolder('speeds and forces');
        (<any>window).gui.add(params, 'separationSpeed', 0, 50);
        (<any>window).gui.add(params, 'separationForce', 0, 10);
        
        (<any>window).gui.add(params, 'alignmentSpeed', 0, 50);
        (<any>window).gui.add(params, 'alignmentForce', 0, 10);
        
        (<any>window).gui.add(params, 'cohesionSpeed', 0, 50);
        (<any>window).gui.add(params, 'cohesionForce', 0, 10);
        
        (<any>window).gui.add(params, 'steerSpeed', 0, 50);
        (<any>window).gui.add(params, 'steerForce', 0, 10);

        (<any>window).gui.add(params, 'maxForce', 0, 100);
        (<any>window).gui.add(params, 'maxSpeed', 0, 100);

        (<any>window).gui.addFolder('flocking weights');
        (<any>window).gui.add(params, 'steerK', 0, 10);
        (<any>window).gui.add(params, 'separationK', 0, 10);
        (<any>window).gui.add(params, 'alignmentK', 0, 10);
        (<any>window).gui.add(params, 'cohesionK', 0, 10);

        const world = new World3D();

    }

}

window.onload = () => new App();