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

float isEqual(vec3 a, vec3 b) {

    return 1.0 - abs(sign(dot(a, b) - dot(b, b)));

}

float isEqual(float a, float b) {

    return 1.0 - abs(sign(a - b));

}

vec3 steer(in vec3 target, in vec3 pos, in vec3 vel, float k) {

    vec3 desiredVel = normalize(target - pos) * uMaxSpeed;
    vec3 steerForce = desiredVel - vel;
    steerForce = mix(steerForce, normalize(steerForce) * uMaxForce, step(uMaxForce, length(steerForce)));
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

    for(float v = 0.0; v < float(HEIGHT); v++) {
        for(float u = 0.0; u < float(WIDTH); u++) {

            float x = 0.0;
            float y = v / float(HEIGHT);
            // if(isEqual(y, vUV.y) == 1.0) continue;
            vec2 coord = vec2(x, y);
            vec3 otherPos = texture2D(uPos, coord).xyz;
            //expensive, but the most accurate indicator if I'm sampling the same pixel
            if(isEqual(pos, otherPos) == 1.0) continue; 

            float minDistSq = uMinDist * uMinDist;
            float maxDistSq = uMaxDist * uMaxDist;

            vec3 dir = otherPos - pos;
            float distSq = dot(dir, dir);

            if(distSq < minDistSq) {

                float k = distSq / minDistSq;
                vec3 d = normalize(dir) * uAvoidSpeed;
                vec3 separationForce = (d - vel) * (1.0 - k);
                acc -= separationForce * uSeparateK;

            } else if(distSq < maxDistSq) {
                
                vec3 velOther = texture2D(uVel, coord).xyz;
                vec3 avgVel = (velOther + vel) * 0.5;
                if(dot(avgVel, avgVel) > 0.0) {

                    vec3 desired = normalize(avgVel) * uMaxSpeed;
                    float delta = distSq - minDistSq;
                    float k = (delta + minDistSq) / maxDistSq;
                    float forceK = 1.0 - (cos(k * PI) * 0.5 + 0.5);
                    vec3 alignForce = (desired - vel) * forceK;
                    acc += alignForce * uAlignK;

                }

            } else {

                // float k = distSq / (800.0 * 800.0);
                float delta = distSq - maxDistSq;
                float k = delta + maxDistSq / (120.0 * 120.0);

                vec3 avgPos = (pos + otherPos) * 0.5;
                vec3 desired = normalize(avgPos - pos) * uMaxSpeed;
                // float forceK = 1.0 - (sin(k * PI) * 0.5 + 0.5);
                vec3 cohesionForce = (desired - vel) * k;
                acc += cohesionForce * uCohesionK;
                // cohesion += otherPos * k;
                // cohesionCount++;

            }

        }

    }

    // acc += steer(uTarget, pos, vel, uSteerK);

    acc += steer(vec3(0.0), pos, vel, uSteerK);

    // if(length(uTarget - pos) < 40.0) {
    //     vec3 diverge = cross((uTarget - pos), vec3(0.0, 1.0, 0.0));
    //     diverge.x *= sign(pos.x);
    //     acc += steer(diverge, pos, vel, uSteerK);
    // }
    
    vel += acc;
    vel = mix(vel, normalize(vel) * uMaxSpeed, step(uMaxSpeed, length(vel)));

    gl_FragColor = vec4(vel, 1.0);

}