// Liquid-glass ring shader v2: silver-rimmed glass with violet patches, dark pools and fine sparkle. Transparent background; theme via u_dark.
export const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
export const FRAG = `#extension GL_OES_standard_derivatives : enable
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res; uniform float u_t; uniform float u_dark;
float hash(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*f*(f*(f*6.-15.)+10.);
 return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float S(vec2 p,float t){
 float r=length(p); vec2 d=p/max(r,1e-4);
 vec3 q=vec3(d*1.3,t*0.15);
 float R=0.58+0.24*(noise(q)-0.5)+0.12*(noise(q*2.1+7.)-0.5)+0.04*(noise(q*4.3+3.)-0.5);
 float wn=noise(vec3(d*1.3+3.,t*0.12+9.));
 float w=0.055+0.19*wn*wn+0.02*noise(q*3.);
 return (r-R)/w;
}
float envm(vec3 R){
 float e=0.10+0.45*smoothstep(-0.3,0.9,R.y);
 e+=0.50*pow(0.5+0.5*sin(R.y*5.0+R.x*2.0+1.0),3.0);
 e+=0.35*smoothstep(0.6,0.95,R.x*0.6-R.y*0.4);
 return e;
}
void main(){
 vec2 p=(gl_FragCoord.xy/u_res)*2.-1.;
 float t=u_t;
 float s=S(p,t);
 float aw=0.03;
 #ifdef GL_OES_standard_derivatives
 aw=fwidth(s)*1.0;
 #endif
 float a=1.-smoothstep(1.-aw,1.+aw,abs(s));
 if(a<=0.001){gl_FragColor=vec4(0.);return;}
 float e=0.004;
 vec2 g=vec2(S(p+vec2(e,0.),t)-S(p-vec2(e,0.),t),S(p+vec2(0.,e),t)-S(p-vec2(0.,e),t));
 g=normalize(g+1e-6);
 float sc=clamp(s,-0.985,0.985);
 vec3 N=vec3(g*sc,sqrt(1.-sc*sc));
 float ang=atan(p.y,p.x);
 float tw=sin(ang*2.+t*0.35+noise(vec3(p*1.5,t*0.1))*4.)*0.5;
 float cs=cos(tw),sn=sin(tw);
 N.xy=mat2(cs,-sn,sn,cs)*N.xy;
 vec3 wp=vec3(p*6.+vec2(noise(vec3(p*3.,t*0.2)),noise(vec3(p*3.+4.,t*0.2)))*3.,t*0.25);
 N.xy+=0.26*(vec2(noise(wp),noise(wp+vec3(5.,3.,1.)))-.5);
 vec3 gp=vec3(p*38.,t*0.1);
 N.xy+=0.13*(vec2(noise(gp),noise(gp+9.))-.5);
 vec3 cq=vec3(p*17.,t*0.2);
 N.xy+=0.10*(vec2(noise(cq),noise(cq+7.))-.5);
 N=normalize(N);
 vec3 Rf=2.*N.z*N-vec3(0.,0.,1.);
 float eR=envm(normalize(Rf+vec3(0.07,0.,0.)));
 float eG=envm(Rf);
 float eB=envm(normalize(Rf-vec3(0.07,0.,0.)));
 vec3 ev=vec3(eR,eG,eB);
 float em=eG;
 float fr=pow(1.-N.z,1.7);
 vec2 pp=mat2(.8,-.6,.6,.8)*p;pp+=0.22*vec2(noise(vec3(pp*2.3,t*0.1)),noise(vec3(pp*2.3+5.,t*0.1)));
 float patch=smoothstep(0.45,0.65,noise(vec3(pp*2.0,t*0.18)));
 float dk=smoothstep(0.52,0.68,noise(vec3(pp*2.2+11.,t*0.15)));
 float spk=pow(noise(vec3(p*130.,t*0.6)),14.);
 float sp=pow(max(dot(Rf,normalize(vec3(-.4,.7,.6))),0.),80.)+pow(max(dot(Rf,normalize(vec3(.6,.3,.7))),0.),140.);
 vec3 col;
 if(u_dark>0.5){
  vec3 deep=vec3(.09,.24,.27),mid=vec3(.25,.41,.45),sil=vec3(.39,.65,.70);
  col=mix(deep,mid,clamp(em*1.4,0.,1.));
  col=mix(col,sil,clamp(ev*ev*1.1,0.,1.)*0.68);
  col=mix(col,vec3(.21,.50,.56),patch*smoothstep(.2,.8,em)*0.50);
  col*=1.-0.65*dk*(1.-fr);
  col+=vec3(.32,.58,.64)*pow(fr,1.3)*0.90;
  col+=vec3(.35,.62,.69)*smoothstep(.86,.98,abs(s))*0.40;
  col+=vec3(.75,.93,.97)*(sp*1.1+spk*2.0*smoothstep(.15,.8,em));
 }else{
  vec3 deep=vec3(.16,.40,.58),mid=vec3(.46,.78,.88),sil=vec3(.98,1.,1.);
  col=mix(deep,mid,clamp(em*1.4,0.,1.));
  col=mix(col,sil,clamp(ev*ev*1.1,0.,1.)*0.9);
  col=mix(col,vec3(.60,.42,.92),patch*smoothstep(.25,.9,em)*0.40);
  col*=1.-0.50*dk*(1.-fr);
  col=mix(col,vec3(.10,.42,.52),pow(fr,2.)*0.55);
  col+=vec3(1.)*(sp*1.1+spk*1.6*smoothstep(.15,.8,em));
  col+=vec3(.9,1.,1.)*smoothstep(.86,.98,abs(s))*0.3;
 }
 float al=a*mix(0.9,1.0,fr);
 gl_FragColor=vec4(col*al,al);
}`;
