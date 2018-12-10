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

vec3 seek(in vec3 target, in vec3 pos, in vec3 vel, float k) {

    vec3 desiredVel = normalize(target - pos) * uMaxSpeed;
    vec3 steerForce = desiredVel - vel;
    steerForce = mix(steerForce, normalize(steerForce) * uMaxForce, step(uMaxForce, length(steerForce)));
    return steerForce * k;

}

vec3 seekwDesired(in vec3 desired, in vec3 vel, float s,  float f, float k) {

    vec3 desiredVel = normalize(desired) * s;
    vec3 steerForce = desiredVel - vel;
    steerForce = mix(steerForce, normalize(steerForce) * f, step(f * f, dot(steerForce, steerForce)));
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
            
            //don't sample the same texel!           
            float vFloor = floor(v);
            float uvYFloor = floor(vUV.y) * float(HEIGHT); 
            if(vFloor == uvYFloor) continue;

            vec2 coord = vec2(0.0, v / float(HEIGHT));
            vec3 otherPos = texture2D(uPos, coord).xyz;

            float minDistSq = uMinDist * uMinDist;
            float maxDistSq = uMaxDist * uMaxDist;

            vec3 dir = otherPos - pos;
            float distSq = dot(dir, dir);

            if(distSq < minDistSq) {

                float k = distSq / minDistSq;
                vec3 d = (dir) * (1.0 - k);
                separation += d;
                separateCount++;

            } else if(distSq < maxDistSq) {

                vec3 velOther = texture2D(uVel, coord).xyz;
                alignment += velOther;
                alignCount++;

                cohesion += otherPos;
                cohesionCount++;

            }

        }

    }


    // float applySeparation = step(0.0, separateCount);
    // separation *= (1.0 / separateCount);
    // vec3 desiredSeparation = normalize(separation) * uAvoidSpeed;
    // vec3 separationForce = desiredSeparation - vel;
    // separationForce = mix(separationForce, normalize(separationForce) * uAvoidForce, step(uAvoidForce * uAvoidForce, dot(separationForce, separationForce)));
    // acc -= separationForce * applySeparation;

    // float applyAlignment = step(0.0, alignCount);
    // alignment *= (1.0 / alignCount);
    // vec3 desiredAlignment = normalize(alignment) * uMaxSpeed;
    // vec3 alignmentForce = desiredAlignment - vel;
    // alignmentForce = mix(alignmentForce, normalize(alignmentForce) * uMaxForce, step(uMaxForce * uMaxForce, dot(alignmentForce, alignmentForce)));
    // acc += alignmentForce * uAlignK * applyAlignment;

    float applySeparation = step(0.0, separateCount);
    separation *= (1.0 / separateCount);
    vec3 separationForce = seekwDesired(separation, vel, uAvoidSpeed, uAvoidForce, uSeparateK);
    acc -= separationForce * applySeparation;

    float applyAlignment = step(0.0, alignCount);
    alignment *= (1.0 / alignCount);
    vec3 alignmentForce = seekwDesired(alignment, vel, uMaxSpeed, uMaxForce, uAlignK);
    acc += alignmentForce * applyAlignment;

    float applyCohesion = step(0.0, cohesionCount);
    cohesion *= (1.0 / cohesionCount);
    vec3 cohesionForce = seek(cohesion, pos, vel, uCohesionK);
    acc += cohesionForce * applyCohesion;

    acc += seek(uTarget, pos, vel, uSteerK);

    float applyDivergence = step((40.0 * 40.0), dot(uTarget - pos, uTarget - pos));
    vec3 diverge = cross(uTarget - pos, vec3(0.0, 1.0, 0.0));
    diverge.x *= sign(pos.x);
    acc += seek(diverge, pos, vel, uSteerK) * applyDivergence;

    float applyCorrectionForce = step((900.0 * 900.0), dot(pos, pos));
    float correctionForceK = dot(pos, pos) - (900.0 * 900.0);
    vec3 target = normalize(pos) * correctionForceK;
    acc -= seek(target, pos, vel, uSteerK) * applyCorrectionForce;
    
    vel += acc;
    vel = mix(vel, normalize(vel) * uMaxSpeed, step(uMaxSpeed * uMaxSpeed, dot(vel, vel)));

    gl_FragColor = vec4(vel, 1.0);

}