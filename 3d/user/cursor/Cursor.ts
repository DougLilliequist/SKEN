import {Mesh, RawShaderMaterial, PlaneBufferGeometry, Vector2, FrontSide} from 'three'

import Geometry from './Geometry';
import Material from './Material';

import {TweenLite, Expo, Power2} from 'gsap'

import eventEmitter from '../../../utils/emitter';
const emitter = eventEmitter.emitter;

export default class Cursor extends Mesh {

    private hideAnim: TweenLite;
    private revealAnim: TweenLite;

    constructor() {

        super();

        const geo: Geometry = new Geometry();
        const mat: Material = new Material();

        this.geometry = geo;
        this.material = mat;

        this.initEvents();

        this.alpha = 0.0;
        this.size = 0.08;

    }

    private initEvents(): void {

        emitter.on('revealCursor', this.reveal)
        emitter.on('hideCursor', this.hide);

    }

    private reveal = (): void => {

        if(this.hideAnim) this.hideAnim.kill();

        this.revealAnim = TweenLite.to(this, 0.25, {

            ease: Power2.easeOut,
            alpha: 1.0,
            size: 0.05

        })


    };

    private hide = (): void => {

        if(this.revealAnim) this.revealAnim.kill();

        this.hide = TweenLite.to(this, 0.25, {

            ease: Power2.easeOut,
            alpha: 0.0,
            size: 0.08

        })

    };

    public update(mouse: Vector2): void {

        (<RawShaderMaterial>this.material).uniforms['uMousePos'].value.copy(mouse);

    }

    get aspectRatio(): number {

        return (<RawShaderMaterial>this.material).uniforms['uAspectRatio'].value;

    }

    set aspectRatio(a: number) {

        (<RawShaderMaterial>this.material).uniforms['uAspectRatio'].value = a;

    }

    get alpha(): number {

        return (<RawShaderMaterial>this.material).uniforms['uAlpha'].value;

    }

    set alpha(v: number) {

        (<RawShaderMaterial>this.material).uniforms['uAlpha'].value = v;

    }

    get size(): number {

        return (<RawShaderMaterial>this.material).uniforms['uScale'].value;

    }

    set size(v: number) {

        (<RawShaderMaterial>this.material).uniforms['uScale'].value = v;

    }


}