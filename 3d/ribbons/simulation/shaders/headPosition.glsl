precision mediump float;

uniform sampler2D uVel;
uniform sampler2D uPos;

varying vec2 vUV;

void main() {

    vec3 vel = texture2D(uVel, vec2(0.0, vUV.y)).xyz;
    vec3 pos = texture2D(uPos, vec2(0.0, vUV.y)).xyz;

    gl_FragColor = vec4(vel + pos, 1.0);

}