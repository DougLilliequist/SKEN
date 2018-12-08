uniform sampler2D uTex;
uniform vec2 uResolution;

#pragma glslify: fxaa = require('glsl-fxaa')

void main() {

    gl_FragColor = fxaa(uTex, gl_FragCoord.xy, uResolution);

}