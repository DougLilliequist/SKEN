/**
 * @author bhouston / http://clara.io/
 * @author Douglas Lilliequist / http://douglaslilliequist.xyz/
 *
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

uniform sampler2D uTexture;
uniform vec3 uDefaultColor;
uniform float uDefaultAlpha;
uniform float uLumaThreshold;
uniform float uSmoothWidth;

varying vec2 vUV;

uniform vec2 resolution;

void main() {

	vec4 texel = texture2D( uTexture, vUV );

	vec3 luma = vec3( 0.299, 0.587, 0.114 );
	float v = dot( texel.xyz, luma );

	vec4 outputColor = vec4( uDefaultColor.rgb, uDefaultAlpha );
	float alpha = smoothstep( uLumaThreshold, uLumaThreshold + uSmoothWidth, v );

	gl_FragColor = mix( outputColor, texel, alpha );

}