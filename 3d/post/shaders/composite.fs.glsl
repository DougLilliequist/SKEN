/**
** source: https://github.com/mrdoob/three.js/blob/master/examples/js/postprocessing/UnrealBloomPass.js
** ln: 352 
**/

uniform sampler2D uBlurTexture1;
uniform sampler2D uBlurTexture2;
uniform sampler2D uBlurTexture3;
uniform sampler2D uBlurTexture4;
uniform sampler2D uBlurTexture5;
uniform sampler2D uDirtTexture;
uniform float uBloomStrength;
uniform float uBloomRadius;
uniform float uBloomFactors[NUM_MIPS];
uniform vec3 uBloomTintColors[NUM_MIPS];
uniform vec2 uResolution;

varying vec2 vUV;
        
float lerpBloomFactor(const in float factor) {
    float mirrorFactor = 1.2 - factor;
    return mix(factor, mirrorFactor, uBloomRadius);
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    gl_FragColor = uBloomStrength * ( lerpBloomFactor(uBloomFactors[0]) * vec4(uBloomTintColors[0], 1.0) * texture2D(uBlurTexture1, vUV) +
                                    lerpBloomFactor(uBloomFactors[1]) * vec4(uBloomTintColors[1], 1.0) * texture2D(uBlurTexture2, vUV) +
                                    lerpBloomFactor(uBloomFactors[2]) * vec4(uBloomTintColors[2], 1.0) * texture2D(uBlurTexture3, vUV) + 
                                    lerpBloomFactor(uBloomFactors[3]) * vec4(uBloomTintColors[3], 1.0) * texture2D(uBlurTexture4, vUV) + 
                                    lerpBloomFactor(uBloomFactors[4]) * vec4(uBloomTintColors[4], 1.0) * texture2D(uBlurTexture5, vUV) );
    }