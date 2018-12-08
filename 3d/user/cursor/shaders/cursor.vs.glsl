attribute vec3 position;
attribute vec3 localPosition;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;

uniform vec2 uMousePos;
uniform float uAngle;
uniform float uScale;

uniform float uAspectRatio;

varying vec2 vUV;

mat2 rotate2D(float angle) {

    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, -s, s, c);

}

vec2 toScreen(vec2 v, float w) {

    return (v / w) * uAspectRatio;

}

void main() {

    vec3 pos = localPosition;
    pos.xy = rotate2D(uAngle) * pos.xy;

    pos.x /= uAspectRatio;
    pos *= uScale;
    pos.xy += uMousePos;

    gl_Position = vec4(pos, 1.0);

    vUV = uv;

}