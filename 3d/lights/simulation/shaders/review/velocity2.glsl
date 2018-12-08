precision mediump float;

uniform sampler2D uVel;
uniform sampler2D uPos;

uniform vec3 uTarget;

uniform float uMaxSpeed;
uniform float uMaxForce;
uniform float uAvoidSpeed;
uniform float uAvoidForce;

uniform float uMinDist;
uniform float uMaxDist;
        
uniform float uSteerK;
uniform float uSeparateK;
uniform float uAlignK;
uniform float uCohesionK;

uniform vec2 uTextureSize;
uniform vec2 uPixelSize;
uniform float uTime;

varying vec2 vUV;

#define PI 3.14159265359
#define PI2 3.14159265359 * 2.0

vec3 steer(in vec3 target, in vec3 pos, in vec3 vel, float k) {

    vec3 desiredVel = normalize(target - pos) * uMaxSpeed;
    vec3 steerForce = desiredVel - vel;
    if(length(steerForce) > uMaxForce) {
        steerForce = normalize(steerForce) * uMaxForce;
    }
    // steerForce = mix(steerForce, normalize(steerForce) * uMaxForce, step(uMaxForce, length(steerForce)));
    return steerForce * k;

}

void main() {

    vec3 pos = texture2D(uPos, vec2(0.0, vUV.y)).xyz;
    vec3 vel = texture2D(uVel, vec2(0.0, vUV.y)).xyz;

    vec3 acc = vec3(0.0);

    float separateCount = 0.0;
    float alignCount = 0.0;
    float cohesionCount = 0.0;

    vec3 separation = vec3(0.0);
    vec3 alignment = vec3(0.0);
    vec3 cohesion = vec3(0.0);

    for(int v = 0; v <= int(HEIGHT); v++) {
        for(int u = 0; u <= int(WIDTH); u++) {

            float x = 0.0; //texture is only 1 px wide and I just need the first one
            float y = float(v / HEIGHT);
            if(y == vUV.y) continue;

            vec3 otherPos = texture2D(uPos, vec2(x, y)).xyz;
            vec3 dir = otherPos - pos;
            float dist = length(dir);

            if(dist < uMinDist) {

                float k = dist / uMinDist;
                vec3 separationDir = normalize(pos - otherPos) * (1.0 - k) * uAvoidSpeed;
                vec3 separationForce = separationDir - vel;
                separationForce = mix(separationForce, normalize(separationForce) * uAvoidForce, step(uAvoidForce * uAvoidForce, dot(separationForce, separationForce)));
                acc += separationForce * uSeparateK;

            } else if(dist < uMaxDist) {

                vec3 otherVel = texture2D(uVel, vec2(x, y)).xyz;
                vec3 avgVel = 0.5 * (vel + otherVel);
                
                float applyAlignment = step(0.0, dot(avgVel, avgVel));
                avgVel = normalize(avgVel) * uMaxSpeed;
                vec3 alignForce = avgVel - vel;
                alignForce = mix(alignForce, normalize(alignForce) * uMaxForce, step(uMaxForce * uMaxForce, dot(alignForce, alignForce)));  
                acc += alignForce * uAlignK * applyAlignment;

                vec3 avgPos = mix(pos, otherPos, 0.6);
                vec3 desiredCohesion = normalize(avgPos) * uMaxSpeed * 0.1;
                vec3 cohesionForce = desiredCohesion - vel;
                cohesionForce = mix(cohesionForce, normalize(cohesionForce) * uMaxForce, step(uMaxForce * uMaxForce, dot(cohesionForce, cohesionForce)));  
                acc += cohesionForce * uCohesionK;

            }

        }

    }

    // vec3 force = normalize(uTarget - pos) * 0.8;

    // vel += force;

    // acc += steer(vec3(0.0), pos, vel, uSteerK);
    acc += steer(uTarget, pos, vel, uSteerK);

    vel += acc;
    vel = mix(vel, normalize(vel) * uMaxSpeed, step(uMaxSpeed, length(vel)));
    // vel *= 0.93;

    gl_FragColor = vec4(vel, 1.0);

}