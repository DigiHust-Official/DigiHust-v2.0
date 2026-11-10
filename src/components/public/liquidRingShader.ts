// Fragment shader for the decorative liquid-glass ring (transparent background, theme via u_dark).
export const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

export const FRAG = `#extension GL_OES_standard_derivatives : enable
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res; uniform float u_t; uniform float u_dark;
float hash(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.-2.*f);
 return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float S(vec2 p,float t){
 float r=length(p); vec2 d=p/max(r,1e-4);
 vec3 q=vec3(d*1.25,t*0.16);
 float R=0.60+0.26*(noise(q)-0.5)+0.14*(noise(q*2.3+7.)-0.5)+0.06*(noise(q*5.1+3.)-0.5);
 float w=0.07+0.11*noise(vec3(d*1.4+3.,t*0.13+9.))+0.03*noise(q*3.);
 return (r-R)/w;
}
void main(){
 vec2 p=(gl_FragCoord.xy/u_res)*2.-1.;
 float t=u_t;
 float s=S(p,t);
 float aw=1.0;
 #ifdef GL_OES_standard_derivatives
 aw=fwidth(s)*1.1;
 #else
 aw=0.03;
 #endif
 float a=1.-smoothstep(1.-aw,1.+aw,abs(s));
 if(a<=0.001){gl_FragColor=vec4(0.);return;}
 float e=0.004;
 vec2 g=vec2(S(p+vec2(e,0.),t)-S(p-vec2(e,0.),t),S(p+vec2(0.,e),t)-S(p-vec2(0.,e),t));
 g=normalize(g+1e-6);
 float sc=clamp(s,-0.985,0.985);
 vec3 N=vec3(g*sc,sqrt(1.-sc*sc));
 vec3 cp=vec3(p*7.,t*0.22);N.xy+=0.34*(vec2(noise(cp),noise(cp+vec3(5.,3.,1.)))-.5)+0.18*(vec2(noise(cp*2.3+2.),noise(cp*2.3+9.))-.5);
 N=normalize(N);
 vec3 Rf=2.*N.z*N-vec3(0.,0.,1.);
 float streak=pow(0.5+0.5*sin(Rf.y*11.+Rf.x*4.+noise(vec3(p*3.,t*0.2))*5.),4.);
 float env=0.22+0.55*pow(smoothstep(0.0,1.0,Rf.y*0.75+Rf.x*0.45),1.6);
 env+=0.30*smoothstep(0.0,0.7,-Rf.y-0.15)*0.6+0.28*streak;
 float vein=pow(1.-abs(noise(vec3(p*8.,t*0.18))*2.-1.),10.);
 float spec=smoothstep(0.80,0.93,Rf.x*0.55+Rf.y*0.83);
 float spec2=smoothstep(0.88,0.97,-Rf.x*0.7-Rf.y*0.5)*0.6;
 float fr=pow(1.-N.z,2.2);
 float irid=noise(vec3(p*2.2,t*0.2));
 vec3 col;
 if(u_dark>0.5){
  col=mix(vec3(.03,.20,.26),vec3(.20,.66,.74),env);
  col=mix(col,vec3(.30,.40,.95),0.22*irid*(0.4+fr));
  col+=vec3(.18,.77,.84)*fr*0.7;
  col+=vec3(.85,.97,1.)*(spec+spec2)+vec3(.45,.85,.95)*vein*0.55;
 }else{
  col=mix(vec3(.12,.42,.50),vec3(.80,.94,.96),env);
  col=mix(col,vec3(.45,.55,.95),0.16*irid*(0.4+fr));
  col=mix(col,vec3(.12,.48,.55),fr*0.65);
  col+=vec3(1.)*(spec+spec2)*0.9+vec3(.9,1.,1.)*vein*0.4;
 }
 float al=a*mix(0.62,1.0,clamp(fr*1.4+spec+env*0.4,0.,1.));
 gl_FragColor=vec4(col*al,al);
}`;
