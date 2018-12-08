attribute vec3 position;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform vec3 uHeadPosition[POSCOUNT];

uniform float uResolution;
uniform float uWidth;
uniform float uAspectRatio;
attribute vec3 params;

varying vec2 vUV;
varying vec3 vPos;
varying float vColorIndex;

#define HASHSCALE1 443.8975

float hash11(float p)
{
	vec3 p3  = fract(vec3(p) * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 ndcToScreen(vec2 p, float w) {

    //brings the 1:1 NDC spaced vector to correct screenspace positions based on Aspect ratio

    return (p / w) * uAspectRatio;

}

float isEqual(vec2 a, vec2 b) {

    return 1.0 - abs(sign(dot(a, a) - dot(b, b)));

}

void main() {

    mat4 viewProjection = projectionMatrix * viewMatrix;

    float row = position.y * uResolution;
    float index = row + position.x;   
    float prevIndex = max(row, index - 1.0);
    float nextIndex = min(row + uResolution - 1.0, index + 1.0);

    vec4 pos = viewProjection * (modelMatrix * vec4(uHeadPosition[int(index)], 1.0));
    vec4 posPrev = viewProjection * (modelMatrix * vec4(uHeadPosition[int(prevIndex)], 1.0));
    vec4 posNext = viewProjection * (modelMatrix * vec4(uHeadPosition[int(nextIndex)], 1.0));

    vec2 screenPos = ndcToScreen(pos.xy, pos.w);
    vec2 screenPosPrev = ndcToScreen(posPrev.xy, posPrev.w);
    vec2 screenPosNext = ndcToScreen(posNext.xy, posNext.w);

    vec2 dir = vec2(0.0, 0.0);

    // // vec2 prevToCurrent = screenPos - screenPosPrev;
    // // vec2 currentToNext = screenPosNext - screenPos;

    // // dir = normalize(prevToCurrent + currentToNext);
    
    // // dir = mix(dir, normalize(screenPosNext - screenPos), isEqual(screenPos, screenPosPrev));
    // // dir = mix(dir, normalize(screenPos - screenPosPrev), isEqual(screenPos, screenPosNext));

    if(screenPos == screenPosPrev) {

        dir = normalize(screenPosNext - screenPos);

    } else if(screenPos == screenPosNext) {

        dir = normalize(screenPos - screenPosPrev);

    } else {

        vec2 prevToCurrent = screenPos - screenPosPrev;
        vec2 currentToNext = screenPosNext - screenPos;

        dir = normalize(prevToCurrent + currentToNext);

    }

    vec2 p = vec2(-dir.y, dir.x);
    // //bring the perpendicular back to NCD space to maintain 90 degree angle, no matter what screen dimensions
    p.x /= uAspectRatio;
    p *= position.z * (uWidth * 0.5);
    pos.xy += p;

    gl_Position = pos;
    
    vUV = uv;
    vPos = pos.xyz;
    vColorIndex = hash11(position.y * params.x);

}
