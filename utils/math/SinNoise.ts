import { Vector3, Vector4, Matrix4, Matrix3 } from 'three';

const m4 = new Matrix4();
m4.set(0.00,  0.80,  0.60, -0.4,
    -0.80,  0.36, -0.48, -0.5,
    -0.60, -0.48,  0.64,  0.2,
     0.40,  0.30,  0.20,  0.4);

const m3 = new Matrix3();
m3.set( 0.00,  0.80,  0.60,
    -0.80,  0.36, -0.48,
    -0.60, -0.48,  0.64 );


export const SinNoise43 = (st: Vector3, t: number): Vector3 => {

    st.multiplyScalar(0.008);
    const p: Vector4 = new Vector4(st.x, st.y, st.z, t);
    let a: number = 1.0;
    let f: number = 1.0;
    let fallOff: number = 2.0;
    const noise: Vector3 = new Vector3(0.0, 0.0, 0.0);

    for(let i = 0; i < 4; i++) {

        //p.multiplyScalar(f);
        p.applyMatrix4(m4);
        noise.x += Math.sin(p.x * f) * a;
        noise.y += Math.sin(p.y * f) * a;
        noise.z += Math.sin(p.z * f) * a;

        f /= fallOff;
        a *= fallOff;

    }

    return noise;

}

// export const SinNoise32 = (st: Vector3): Vector2 => {




// }