import { BufferGeometry, BufferAttribute } from 'three'

export default class Geometry extends BufferGeometry {

    constructor() {

        super();

        const positionCount: number = 4.0 * 3.0;
        const positionData: Float32Array = new Float32Array(positionCount);
        const localPosData: Float32Array = new Float32Array(positionCount);

        const uvCount: number = 4.0 * 2.0;
        const uvData: Float32Array = new Float32Array(uvCount);

        const indexCount: number = 6.0;
        const indicies: Uint16Array = new Uint16Array(indexCount);

        localPosData[0] = -1.0;
        localPosData[1] = 1.0;
        localPosData[2] = 0.0;

        localPosData[3] = -1.0;
        localPosData[4] = -1.0;
        localPosData[5] = 0.0;

        localPosData[6] = 1.0;
        localPosData[7] = 1.0;
        localPosData[8] = 0.0;

        localPosData[9] = 1.0;
        localPosData[10] = -1.0;
        localPosData[11] = 0.0;

        uvData[0] = 0.0;
        uvData[1] = 1.0; 

        uvData[2] = 0.0;
        uvData[3] = 0.0;

        uvData[4] = 1.0;
        uvData[5] = 1.0;

        uvData[6] = 1.0;
        uvData[7] = 0.0;

        indicies[0] = 0.0;
        indicies[1] = 1.0;
        indicies[2] = 2.0;
        indicies[3] = 1.0;
        indicies[4] = 3.0;
        indicies[5] = 2.0;

        this.addAttribute('position', new BufferAttribute(positionData, 3.0));
        this.addAttribute('localPosition', new BufferAttribute(localPosData, 3.0));
        this.addAttribute('uv', new BufferAttribute(uvData, 2.0));
        this.setIndex(new BufferAttribute(indicies, 1.0));

    }

}