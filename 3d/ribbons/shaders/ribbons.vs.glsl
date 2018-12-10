attribute vec3 position;
attribute vec2 uv;
uniform sampler2D uPosition;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform vec2 uTexelSize;

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

    float index = position.x; 
    float row = position.y;
    vec2 offSet = vec2(uTexelSize.x, 0.0);

    vec3 pc = texture2D(uPosition, vec2(index, row)).xyz;
    vec3 pp = texture2D(uPosition, vec2(index, row) - offSet).xyz;
    vec3 pn = texture2D(uPosition, vec2(index, row) + offSet).xyz;

    vec4 pos = viewProjection * (modelMatrix * vec4(pc, 1.0));
    vec4 posPrev = viewProjection * (modelMatrix * vec4(pp, 1.0));
    vec4 posNext = viewProjection * (modelMatrix * vec4(pn, 1.0));

    vec2 screenPos = ndcToScreen(pos.xy, pos.w);
    vec2 screenPosPrev = ndcToScreen(posPrev.xy, posPrev.w);
    vec2 screenPosNext = ndcToScreen(posNext.xy, posNext.w);

    vec2 dir = vec2(0.0, 0.0);

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
    vColorIndex = hash11(position.y + params.x);

}
