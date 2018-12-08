/**
** source: https://github.com/mrdoob/three.js/blob/master/examples/js/postprocessing/UnrealBloomPass.js
** ln: 294 
**/

#include <common>
uniform sampler2D uColorTexture;
uniform vec2 uTexSize;
uniform vec2 uDirection;
uniform vec2 uResolution;
varying vec2 vUV;

float gaussianPdf(in float x, in float sigma) {
    return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;
}

void main() {
    
    vec2 invSize = 1.0 / uTexSize;
    float fSigma = float(SIGMA);
    float weightSum = gaussianPdf(0.0, fSigma);
    vec3 diffuseSum = texture2D( uColorTexture, vUV).rgb * weightSum;
    for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
        float x = float(i);
        float w = gaussianPdf(x, fSigma);
        vec2 uvOffset = uDirection * invSize * x;
        vec3 sample1 = texture2D( uColorTexture, vUV + uvOffset).rgb;
        vec3 sample2 = texture2D( uColorTexture, vUV - uvOffset).rgb;
        diffuseSum += (sample1 + sample2) * w;
        weightSum += 2.0 * w;
    }
    
	gl_FragColor = vec4(diffuseSum/weightSum, 1.0);

}
