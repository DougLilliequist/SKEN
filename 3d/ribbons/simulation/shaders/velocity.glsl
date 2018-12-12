precision mediump float;

uniform sampler2D uVel;
uniform sampler2D uPos;

uniform vec3 uTarget;

uniform float uSeparationSpeed;
uniform float uSeparationForce;

uniform float uAlignSpeed;
uniform float uAlignForce;

uniform float uCohesionSpeed;
uniform float uCohesionForce;

uniform float uSteerSpeed;
uniform float uSteerForce;

uniform float uCorrectionSpeed;
uniform float uCorrectionForce;

uniform float uDivergenceSpeed;
uniform float uDivergenceForce;

uniform float uMaxSpeed;

uniform float uSeparationDist;
uniform float uAlignDist;
uniform float uCohesionDist;
uniform float uBounds;
        
uniform float uSteerK;
uniform float uCorrectionK;
uniform float uDivergenceK;
uniform float uSeparationK;
uniform float uAlignmentK;
uniform float uCohesionK;

uniform vec2 uTextureSize;
uniform vec2 uPixelSize;

varying vec2 vUV;

vec3 seek(in vec3 target, in vec3 pos, in vec3 vel, float s, float f, float k) {

    vec3 desiredVel = normalize(target - pos) * s;
    vec3 steerForce = desiredVel - vel;
    steerForce = mix(steerForce, normalize(steerForce) * f, step(f * f, dot(steerForce, steerForce)));
    return steerForce * k;

}

vec3 seekwDesired(in vec3 desired, in vec3 vel, float s, float f, float k) {

    vec3 desiredVel = normalize(desired) * s;
    vec3 steerForce = desiredVel - vel;
    steerForce = mix(steerForce, normalize(steerForce) * f, step(f * f, dot(steerForce, steerForce)));
    return steerForce * k;

}

float isEqual(vec3 a, vec3 b) {

    return 1.0 - abs(sign(dot(a, a) - dot(b, b)));

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

    float separationDistSq = uSeparationDist * uSeparationDist;
    float alignDistSq = uAlignDist * uAlignDist;
    float cohesionDistSq = uCohesionDist * uCohesionDist;

    for(float v = 0.0; v < float(RIBBONCOUNT); v++) {
            //don't sample the same texel!           
            float vFloor = floor(v);
            float uvYFloor = floor(vUV.y * float(RIBBONCOUNT)); 
            if(vFloor == uvYFloor) continue;

            vec2 coord = vec2(0.5, ((vFloor + 0.5) / float(RIBBONCOUNT)));

            vec3 otherPos = texture2D(uPos, coord).xyz;

            vec3 dir = otherPos - pos;
            float distSq = dot(dir, dir);
            if(distSq < 0.00001) continue;

            if(distSq < separationDistSq) {

                float k = max(distSq / separationDistSq, 0.001);
                vec3 separationDir = dir * (1.0 - k);
                separation += separationDir;
                separateCount++;

            } else if(distSq < alignDistSq) {

                vec3 otherVel = texture2D(uVel, coord).xyz;
                vec3 avgVel = 0.5 * (otherVel + vel);
                
                if(dot(avgVel, avgVel) > 0.0) {

                    alignment += otherVel;
                    alignCount++;

                }

            } else if(distSq < cohesionDistSq) {

                cohesion += otherPos;
                cohesionCount++;

            }

    }
        
    if(separateCount > 0.0) {        
     
        separation *= (1.0 / separateCount);
        vec3 separationForce = seekwDesired(separation, vel, uSeparationSpeed, uSeparationForce, uSeparationK);
        acc -= separationForce;
    
    }
        
    if(alignCount > 0.0) {
        
        alignment *= (1.0 / alignCount);
        vec3 alignmentForce = seekwDesired(alignment, vel, uAlignSpeed, uAlignForce, uAlignmentK);
        acc += alignmentForce;

    }
    
    if(cohesionCount > 0.0) {
        
        cohesion *= (1.0 / cohesionCount);
        vec3 cohesionForce = seek(cohesion, pos, vel, uCohesionSpeed, uCohesionForce, uCohesionK);
        acc += cohesionForce;

    }
    
    if(dot(pos, pos) > (uBounds * uBounds)) {
        
        float correctionForceK = dot(pos, pos) - (uBounds * uBounds);
        vec3 target = normalize(pos) * correctionForceK;
        acc -= seek(target, pos, vel, uCorrectionSpeed, uCorrectionForce, uCorrectionK);
    
    }

    if(dot(uTarget - pos, uTarget - pos) < (100.0, 100.0)) {

        vec3 up = cross(uTarget - pos, vec3(1.0, 0.0, 0.0));
        vec3 divergence = cross(uTarget - pos, up);
        divergence.x *= normalize(pos).x;
        acc += seek(divergence, pos, vel, uDivergenceSpeed, uDivergenceForce, uDivergenceK);

    }
    
    acc += seek(uTarget, pos, vel, uSteerSpeed, uSteerForce, uSteerK);

    vel += acc;
    vel = mix(vel, normalize(vel) * uMaxSpeed, step(uMaxSpeed * uMaxSpeed, dot(vel, vel)));

    gl_FragColor = vec4(vel, 1.0);

}