precision mediump float;

uniform sampler2D uColor;

varying vec2 vUV;
varying vec3 vPos;
varying float vColorIndex;

uniform float uTime;

#define textureSize vec2(4.0, 1.0)
#define octaves 4
#define spatialF 1.0
#define temporalF 1.0
#define fallOff 0.83

#define m3 (0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64)

float sinNoise31(vec3 st, float k) {

    st.xy *= spatialF;
    st.z *= temporalF + k;

    float a = 1.0;
    float f = 1.0;

    vec2 outPut = vec2(0.0);

    for(int i = 0; i < octaves; i++) {
        
        st = m3 * st.xyz;
        outPut += sin(st.xy + st.z * f) * a;
        
        a *= fallOff;
        f /= fallOff;

    }

    return outPut.x;

}

void main() {

    float noise = sinNoise31(vec3(vUV, uTime), vColorIndex) * 0.5 + 0.5;
    float colorIndex = ((noise * (textureSize.x - 1.0)) + 0.5) / textureSize.x;
    
    vec3 lightCol = texture2D(uColor, vec2(colorIndex, 0.5)).xyz;
    float phase = smoothstep(1.0, 0.0, vUV.x);
    gl_FragColor = vec4(lightCol, phase);

    // float testPhase = smoothstep(0.0, 1.0, vUV.x);

    // gl_FragColor = vec4(vec3(testPhase), 1.0);

}