precision mediump float;

uniform sampler2D uTex;

varying vec2 vUV;

void main() {

    vec3 outPut = texture2D(uTex, vUV).xyz;
    gl_FragColor = vec4(outPut, 1.0);

}
