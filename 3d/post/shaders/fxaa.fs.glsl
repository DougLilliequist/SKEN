uniform sampler2D uTex;
uniform vec2 uResolution;
varying vec2 vUV;

#pragma glslify: fxaa = require('glsl-fxaa')

void main() {

    vec2 uv = vUV;

    gl_FragColor = fxaa(uTex, gl_FragCoord.xy, uResolution);

}