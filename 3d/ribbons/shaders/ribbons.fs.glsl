precision mediump float;

uniform sampler2D uColor;

varying vec2 vUV;
varying vec3 vPos;
varying float vColorIndex;

#define textureSize vec2(3.0, 1.0)

void main() {


    float colorIndex = floor(vColorIndex * textureSize.x * 3.0) / textureSize.x;
    vec3 lightCol = texture2D(uColor, vec2(colorIndex, 0.5)).xyz;
    // vec3 lightCol = vec3(0.9, 0.9, 1.0);

    float linePhase = vUV.x;

    float phase = smoothstep(1.0, 0.0, linePhase);

    // gl_FragColor = vec4(vec3(1.0), 1.0);

    gl_FragColor = vec4(lightCol, phase);

    // float testPhase = smoothstep(0.0, 1.0, vUV.x);

    // gl_FragColor = vec4(vec3(testPhase), 1.0);

}