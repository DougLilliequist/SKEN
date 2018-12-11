precision lowp float;

uniform sampler2D uHeadPos;
uniform sampler2D uPos;

uniform vec2 uTexelSize;

varying vec2 vUV;

void main() {

    vec3 pos = vec3(0.0);
    vec2 sampleOffSet = vec2(uTexelSize.x, 0.0);

    if(vUV.x < uTexelSize.x) {

        pos = texture2D(uHeadPos, vec2(0.0, vUV.y)).xyz;

    } else {

        pos = texture2D(uPos, vUV - sampleOffSet).xyz;

    }

    gl_FragColor = vec4(pos, 1.0);

}