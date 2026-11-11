/**
 * Advanced Research Projects // 3D Raymarched Fractal Engine
 * Geometria Implícita Volumétrica: Mandelbulb, Esponja de Menger & Julia Quaterniônico
 * Renderizado em tempo real via WebGL Ray Marching
 */
(function() {
  const host = document.getElementById('gl');
  if (!host) return;

  const cv = document.createElement('canvas');
  cv.id = 'fx';
  host.appendChild(cv);

  const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true });
  if (!gl) return;

  const NF = 3;
  let cur = 0, off = [0, 0], drag = null, vis = true, T = 0, prev = performance.now(), last = prev, busy = false;

  const vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const fs = 'precision highp float;uniform vec2 r,rot;uniform float t;uniform int m;' +
    'vec4 qm(vec4 a,vec4 b){return vec4(a.x*b.x-dot(a.yzw,b.yzw),a.x*b.yzw+b.x*a.yzw+cross(a.yzw,b.yzw));}' +
    'float DE(vec3 p){' +
    ' if(m==0){float n=6.+2.*sin(t*.2);vec3 z=p;float dr=1.,rr=0.;' +
    '  for(int i=0;i<8;i++){rr=length(z);if(rr>2.)break;float th=acos(clamp(z.z/rr,-1.,1.)),ph=atan(z.y,z.x),zr=pow(rr,n-1.);dr=zr*n*dr+1.;zr*=rr;th*=n;ph*=n;z=zr*vec3(sin(th)*cos(ph),sin(th)*sin(ph),cos(th))+p;}' +
    '  return .5*log(rr)*rr/dr;}' +
    ' if(m==1){vec3 q=abs(p)-vec3(1.);float d=length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);float s=1.;' +
    '  for(int i=0;i<4;i++){vec3 a=mod(p*s,2.)-1.;s*=3.;vec3 e=abs(1.-3.*abs(a));float da=max(e.x,e.y),db=max(e.y,e.z),dc=max(e.z,e.x);d=max(d,(min(da,min(db,dc))-1.)/s);}' +
    '  return d;}' +
    ' vec4 c=vec4(-.2+.1*sin(t*.3),.8,0.,.1*cos(t*.25));vec4 z=vec4(p,0.),dz=vec4(1.,0.,0.,0.);' +
    ' for(int i=0;i<10;i++){dz=2.*qm(z,dz);z=qm(z,z)+c;if(dot(z,z)>16.)break;}' +
    ' float lz=length(z);return max(.5*lz*log(lz)/length(dz),p.z-.15);}' +
    'void main(){vec2 uv=(gl_FragCoord.xy-.5*r)/min(r.x,r.y)*2.;' +
    'if(r.x>r.y)uv.x-=.45;else uv.y-=.35;' +
    'float yw=t*.15+rot.x*3.,pt=.35+rot.y*2.;vec3 ro=3.4*vec3(cos(pt)*sin(yw),sin(pt),cos(pt)*cos(yw));' +
    'vec3 f=normalize(-ro),rt=normalize(cross(f,vec3(0.,1.,0.))),up=cross(rt,f),rd=normalize(f*1.8+rt*uv.x+up*uv.y);' +
    'float tt=0.,steps=0.;bool hit=false;' +
    'for(int i=0;i<72;i++){float d=DE(ro+rd*tt);steps=float(i);if(d<.0015*tt){hit=true;break;}tt+=d;if(tt>8.)break;}' +
    'vec3 bl=vec3(.1,.1,1.);vec4 o=vec4(0.);' +
    'if(hit){vec3 p=ro+rd*tt;vec2 e=vec2(.002,0.);' +
    ' vec3 n=normalize(vec3(DE(p+e.xyy)-DE(p-e.xyy),DE(p+e.yxy)-DE(p-e.yxy),DE(p+e.yyx)-DE(p-e.yyx)));' +
    ' vec3 L=normalize(vec3(.6,.8,.5));float df=clamp(dot(n,L),0.,1.),fr=pow(1.-clamp(dot(n,-rd),0.,1.),2.5),ao=1.-steps/72.;' +
    ' vec3 col=mix(vec3(0.,0.,.3),bl,.35+.65*df)*(.45+.55*ao)+vec3(.55,.6,1.)*fr*.7;o=vec4(col,1.);}' +
    'else{float g=pow(steps/72.,2.5)*.5;o=vec4(bl*g,g);}' +
    'gl_FragColor=o;}';

  function sh(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(pr);
  gl.useProgram(pr);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const al = gl.getAttribLocation(pr, 'a');
  gl.enableVertexAttribArray(al);
  gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);

  const U = n => gl.getUniformLocation(pr, n);
  const uR = U('r'), uRot = U('rot'), uT = U('t'), uM = U('m');

  function size() {
    const d = Math.min(devicePixelRatio || 1, 1.5) * 0.55;
    cv.width = Math.max(2, cv.clientWidth * d);
    cv.height = Math.max(2, cv.clientHeight * d);
    gl.viewport(0, 0, cv.width, cv.height);
  }

  addEventListener('resize', size);
  size();

  new IntersectionObserver(entries => {
    vis = entries[0].isIntersecting;
  }).observe(cv);

  function go(i) {
    if (busy) return;
    busy = true;
    cv.style.opacity = 0;
    setTimeout(() => {
      cur = i;
      cv.style.opacity = 1;
      busy = false;
    }, 500);
    last = performance.now();
  }

  cv.addEventListener('pointerdown', e => {
    drag = [e.clientX, e.clientY, off[0], off[1]];
    cv.setPointerCapture(e.pointerId);
  });

  cv.addEventListener('pointermove', e => {
    if (!drag) return;
    off[0] = drag[2] - (e.clientX - drag[0]) / cv.clientWidth;
    off[1] = drag[3] + (e.clientY - drag[1]) / cv.clientHeight * 0.5;
  });

  cv.addEventListener('pointerup', () => {
    drag = null;
  });

  function frame(n) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (n - prev) / 1000);
    prev = n;
    if (!vis) return;

    T += dt;
    if (n - last > 14000) go((cur + 1) % NF);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform2f(uR, cv.width, cv.height);
    gl.uniform2f(uRot, off[0], off[1]);
    gl.uniform1f(uT, T);
    gl.uniform1i(uM, cur);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  requestAnimationFrame(frame);
})();

