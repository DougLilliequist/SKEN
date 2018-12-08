precision mediump float;

uniform float uAlpha;
varying vec2 vUV;

void main() {

    vec2 uv = vUV;

    float stepX = step(uv.x, 0.05) + step(0.95, uv.x);
    float stepY = step(uv.y, 0.05) + step(0.95, uv.y);

    // float borderX = smoothstep(0)


    gl_FragColor = vec4(vec3(stepX + stepY), uAlpha);

}