import {DataTexture, NearestFilter, ClampToEdgeWrapping, RGBAFormat, HalfFloatType, FloatType} from 'three';

export default class SimData extends DataTexture {

    constructor(data: Float32Array | Uint16Array, w: number, h: number, isMobile: boolean = false) {

        super(data, w, h);

        this.minFilter = NearestFilter;
        this.magFilter = NearestFilter;
        this.wrapS = ClampToEdgeWrapping;
        this.wrapT = ClampToEdgeWrapping;
        this.format = RGBAFormat;
        // this.type = isMobile ? HalfFloatType : FloatType;
        this.type = FloatType;
        this.generateMipmaps = false;
        this.flipY = false;
        this.needsUpdate = true;

    }

}