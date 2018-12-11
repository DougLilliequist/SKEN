precision mediump float;

uniform sampler2D uColor;

varying vec2 vUV;
varying float vColorIndex;

#define textureSize vec2(4.0, 1.0)

void main() {

    float colorIndex = (floor(vColorIndex * textureSize.x) + 0.5) / textureSize.x;

    vec3 lightCol = texture2D(uColor, vec2(colorIndex, 0.5)).xyz;
    float phase = smoothstep(1.0, 0.0, vUV.x);
   
    gl_FragColor = vec4(lightCol, phase);

}