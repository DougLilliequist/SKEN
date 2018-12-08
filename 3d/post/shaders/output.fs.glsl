uniform sampler2D uMain;
uniform sampler2D uBloom;

varying vec2 vUV;

void main() {

    vec3 main = texture2D(uMain, vUV).xyz;
    vec3 bloom = texture2D(uBloom, vUV).xyz;

    gl_FragColor = vec4(main, 1.0) + vec4(bloom, 1.0);
    
}