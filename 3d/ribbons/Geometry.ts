import { BufferGeometry, BufferAttribute } from 'three';

export default class Geometry extends BufferGeometry {

    constructor(ribbonCount: number, resolution: number) {
        super();

        const segmentCount = resolution;
        
        const positionDataCount: number = ribbonCount * (segmentCount * 2.0 * 3.0);
        const uvDataCount: number = ribbonCount * (segmentCount * 2.0 * 2.0);
        const paramsDataCount: number = ribbonCount * (segmentCount * 2.0 * 3.0);
    
        const positionData: Float32Array = new Float32Array(positionDataCount);
        const uvData: Float32Array = new Float32Array(uvDataCount);
        const paramsData: Float32Array = new Float32Array(paramsDataCount);

        let positionIterator: number = 0.0;
        let xK = 1.0 / (segmentCount - 0.0);
        let yK = 1.0 / (ribbonCount - 0.0);

        let uvIterator: number = 0.0;
        let uvK = 1.0 / (segmentCount - 1);

        let paramsIterator: number = 0.0;

        for(let v = 0; v < ribbonCount; v++) {

            const r = Math.random();

            for(let u = 0; u < segmentCount; u++) {

                positionData[positionIterator++] = u * xK;
                positionData[positionIterator++] = v * yK;
                positionData[positionIterator++] = -1.0;

                positionData[positionIterator++] = u * xK;
                positionData[positionIterator++] = v * yK;
                positionData[positionIterator++] = 1.0;

                uvData[uvIterator++] = u * uvK; 
                uvData[uvIterator++] = 0.0;

                uvData[uvIterator++] = u * uvK;
                uvData[uvIterator++] = 1.0;

                paramsData[paramsIterator++] = r;
                paramsData[paramsIterator++] = 0.0;
                paramsData[paramsIterator++] = 0.0;

                paramsData[paramsIterator++] = r;
                paramsData[paramsIterator++] = 0.0;
                paramsData[paramsIterator++] = 0.0;

            }

        }

        const indexDataCount: number = ribbonCount * (segmentCount - 1) * 6.0; //still a weird assignment
        const indexData: Uint16Array = new Uint16Array(indexDataCount);
        let indexIterator: number = 0.0;
        let indexOffset: number = 0.0;

        for(let i = 0; i < ribbonCount; i++) {

            indexOffset = i * (segmentCount) * 2.0;

            for(let j = 0; j < segmentCount - 1; j++) {

                indexData[indexIterator++] = indexOffset + (j * 2) + 0;
                indexData[indexIterator++] = indexOffset + (j * 2) + 1;
                indexData[indexIterator++] = indexOffset + (j * 2) + 2;

                indexData[indexIterator++] = indexOffset + (j * 2) + 1;
                indexData[indexIterator++] = indexOffset + (j * 2) + 3;
                indexData[indexIterator++] = indexOffset + (j * 2) + 2;

            }

        }

        this.setIndex(new BufferAttribute(indexData, 1));
        this.addAttribute('position', new BufferAttribute(positionData, 3));
        this.addAttribute('uv', new BufferAttribute(uvData, 2));
        this.addAttribute('params', new BufferAttribute(paramsData, 3));

    }

}