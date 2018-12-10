import World3D from './3d/world3d';
import * as dat from 'dat.gui';

class App {

    constructor() {

        const params = (<any>window).params = {

            separationDist: 125.0,
            alignDist: 150.0,
            cohesionDist: 180.0,
            bounds: 1500.0,

            maxForce: 0.5,
            maxSpeed: 10.0,

            steerK: 0.8,
            separationK: 1.5,
            alignmentK: 1.0,
            cohesionK: 1.0,

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