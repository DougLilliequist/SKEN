precision mediump float;

uniform sampler2D uVel;
uniform sampler2D uPos;

uniform vec3 uTarget;

uniform float uMaxForce;
uniform float uMaxSpeed;

uniform float uSeparationDist;
uniform float uAlignDist;
uniform float uCohesionDist;
uniform float uBounds;
        
uniform float uSteerK;
uniform float uSeparationK;
uniform float uAlignmentK;
uniform float uCohesionK;

uniform vec2 uTextureSize;
uniform vec2 uPixelSize;
uniform float uTime;

varying vec2 vUV;

#define PI 3.14159265359
#define PI2 3.14159265359 * 2.0

#define maxSpeedSq uMaxSpeed * uMaxSpeed
#define maxForceSq uMaxForce * uMaxForce


vec3 seek(in vec3 target, in vec3 pos, in vec3 vel, float k) {

    vec3 desiredVel = normalize(target - pos) * uMaxSpeed;
    vec3 steerForce = desiredVel - vel;
    steerForce = mix(steerForce, normalize(steerForce) * uMaxForce, step(maxForceSq, dot(steerForce, steerForce)));
    return steerForce * k;

}

vec3 seekwDesired(in vec3 desired, in vec3 vel, float k) {

    vec3 desiredVel = normalize(desired) * uMaxSpeed;
    vec3 steerForce = desiredVel - vel;
    steerForce = mix(steerForce, normalize(steerForce) * uMaxForce, step(maxForceSq, dot(steerForce, steerForce)));
    return steerForce * k;

}

float isEqual(vec3 a, vec3 b) {

    return 1.0 - abs(sign(dot(a, a) - dot(b, b)));

}

void main() {

    vec3 pos = texture2D(uPos, vec2(0.5, vUV.y)).xyz;
    vec3 vel = texture2D(uVel, vec2(0.5, vUV.y)).xyz;

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
            float uvYFloor = floor(vUV.y * float(HEIGHT)); 
            if(vFloor == uvYFloor) continue;

            vec2 coord = vec2(0.5, (vFloor + 0.5) / float(HEIGHT));
            vec3 otherPos = texture2D(uPos, coord).xyz;

            float separationDistSq = uSeparationDist * uSeparationDist;
            float alignDistSq = uAlignDist * uAlignDist;
            float cohesionDistSq = uCohesionDist * uCohesionDist;

            vec3 dir = otherPos - pos;
            float distSq = dot(dir, dir);

            if(distSq < separationDistSq) {

                float k = max(distSq / separationDistSq, 0.0001);
                vec3 separationDir = dir * (1.0 - k);
                separation += separationDir;
                separateCount++;

            } else if(distSq < alignDistSq) {

                vec3 velOther = texture2D(uVel, coord).xyz;
                alignment += velOther;
                alignCount++;

                // cohesion += otherPos;
                // cohesionCount++;

            } else if(distSq < cohesionDistSq) {

                cohesion += otherPos;
                cohesionCount++;

            }

        }

    }
    
    float applySeparation = step(0.0, separateCount);
    separation *= (1.0 / separateCount);
    vec3 separationForce = seekwDesired(separation, vel, uSeparationK);
    acc -= separationForce * applySeparation;

    float applyAlignment = step(0.0, alignCount);
    alignment *= (1.0 / alignCount);
    vec3 alignmentForce = seekwDesired(alignment, vel, uAlignmentK);
    acc += alignmentForce * applyAlignment;

    float applyCohesion = step(1.0, cohesionCount);
    cohesion *= (1.0 / cohesionCount);
    vec3 cohesionForce = seek(cohesion, pos, vel, uCohesionK);
    acc += cohesionForce * applyCohesion;

    float applyCorrectionForce = step((uBounds * uBounds), dot(pos, pos));
    float correctionForceK = dot(pos, pos) - (uBounds * uBounds);
    vec3 target = normalize(pos) * correctionForceK;
    acc -= seek(target, pos, vel, uSteerK) * applyCorrectionForce;

    // float applyDivergence = step((40.0 * 40.0), dot(uTarget - pos, uTarget - pos));
    // vec3 up = cross(uTarget - pos, vec3(1.0, 0.0, 0.0));
    // vec3 diverge = cross(uTarget - pos, up);
    // diverge.x *= sign(pos.x);
    // acc += seek(diverge, pos, vel, uSteerSpeed, uSteerForce, uSteerK) * applyDivergence;
    
    // acc += seek(vec3(0.0), pos, vel, uSteerK);
    acc += seek(uTarget, pos, vel, uSteerK);

    vel += acc;
    
    vel = mix(vel, normalize(vel) * uMaxSpeed, step(maxSpeedSq, dot(vel, vel)));

    gl_FragColor = vec4(vel, 1.0);

}