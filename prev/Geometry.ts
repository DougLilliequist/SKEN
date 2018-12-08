import { BufferGeometry, BufferAttribute } from 'three'

export default class Geometry extends BufferGeometry {

    constructor(ribbonCount: number, count: number) {

        super()

        const positionDataCount: number = ribbonCount * count * 3.0;
        const positionData: Float32Array = new Float32Array(positionDataCount);
        let positionIterator: number = 0.0;

        for(let i = 0; i < ribbonCount; i++) {

            let offset = (((Math.random() * 2.0) - 1.0) * 20.0);

            for(let j = 0; j < count; j++) {

                positionData[positionIterator++] = j;
                positionData[positionIterator++] = i;
                positionData[positionIterator++] = i * offset;

            }

        }

        this.addAttribute('position', new BufferAttribute(positionData, 3));

    }

}