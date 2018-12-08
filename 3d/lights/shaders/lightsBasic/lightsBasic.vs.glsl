attribute vec3 position;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

uniform vec3 uHeadPosition[POSCOUNT];
uniform float uResolution;

varying float vDebug;

void main() {

    vec3 pos = uHeadPosition[int((position.y * uResolution) + position.x)];
    
    mat4 viewProjection = projectionMatrix * modelViewMatrix;

    gl_Position = viewProjection * vec4(pos, 1.0);

    gl_PointSize = 5.0;

    vDebug = position.z;

}