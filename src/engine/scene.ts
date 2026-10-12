// WebGL paper. Each sheet is a finely divided plane carrying a picture of a printed page.
// To turn it, the plane is wrapped round a cylinder whose axis sweeps across the sheet: the part past
// the axis rolls up and over and lies back down face-down, the way newsprint actually bends.
// World units are CSS pixels; the camera is placed so that z = 0 maps one-to-one onto the screen.
import * as THREE from 'three';

const FOV = 20;

const sheetVert = /* glsl */ `
  uniform float uS;      // axis offset along uN
  uniform vec2  uN;      // unit normal of the axis, pointing toward the side that lifts
  uniform float uR;      // radius of the curl
  uniform float uDir;    // +1 rolls up toward the viewer, -1 folds away behind the sheet
  varying vec2  vUv;
  varying vec3  vNormal;
  varying float vLift;
  void main() {
    vUv = uv;
    vec3 p = position;
    vec3 n = vec3(0.0, 0.0, 1.0);
    float d = dot(p.xy, uN) - uS;
    vLift = 0.0;
    if (d > 0.0) {
      vec2 base = p.xy - uN * d;
      float th = d / uR;
      if (th < 3.14159265) {
        p.xy = base + uN * (uR * sin(th));
        p.z = uDir * uR * (1.0 - cos(th));
        n = vec3(-uDir * uN * sin(th), cos(th));
      } else {
        p.xy = base - uN * (d - 3.14159265 * uR);
        p.z = uDir * 2.0 * uR;
        n = vec3(0.0, 0.0, -1.0);
      }
      vLift = min(th, 3.14159265);
    }
    vNormal = n;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const sheetFrag = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3  uBack;   // colour of the unprinted side
  uniform vec3  uLight;
  uniform float uAlpha;
  varying vec2  vUv;
  varying vec3  vNormal;
  varying float vLift;
  void main() {
    vec3 L = normalize(uLight);
    vec3 N = normalize(vNormal);
    vec4 tex = texture2D(uMap, vUv);
    vec3 col;
    if (gl_FrontFacing) {
      col = tex.rgb;
    } else {
      N = -N;
      // newsprint is thin: the other side's ink shows through faintly, mirrored
      float ink = 1.0 - dot(tex.rgb, vec3(0.299, 0.587, 0.114));
      col = uBack * (1.0 - ink * 0.16);
    }
    float flatShade = 0.62 + 0.38 * L.z;
    float diff = 0.62 + 0.38 * max(dot(N, L), 0.0);
    col *= diff / flatShade;
    // a soft sheen where the paper bends toward the lamp
    vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
    col += pow(max(dot(N, H), 0.0), 18.0) * 0.07 * smoothstep(0.05, 0.6, vLift);
    gl_FragColor = vec4(col, uAlpha);
  }
`;

const shadeVert = /* glsl */ `
  varying vec2 vP;
  void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

// Shadow the turning page casts on the page beneath it: darkest at the curl, fading away from it.
const turnShadowFrag = /* glsl */ `
  uniform float uS; uniform vec2 uN; uniform float uR; uniform float uStrength; uniform vec2 uHalf;
  varying vec2 vP;
  void main() {
    float d = dot(vP, uN) - uS;
    float a = d > 0.0 ? exp(-d / (uR * 1.7)) : 0.0;
    // keep it on the page
    vec2 q = abs(vP) - uHalf;
    if (q.x > 0.0 || q.y > 0.0) a = 0.0;
    gl_FragColor = vec4(0.06, 0.04, 0.03, a * uStrength);
  }
`;

// A blurred rectangle under a sheet lying on the table.
const dropFrag = /* glsl */ `
  uniform vec2 uHalf; uniform float uBlur; uniform float uStrength;
  varying vec2 vP;
  void main() {
    vec2 q = abs(vP) - (uHalf - uBlur);
    float dist = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
    float a = 1.0 - smoothstep(-uBlur, uBlur, dist);
    gl_FragColor = vec4(0.05, 0.03, 0.02, a * uStrength);
  }
`;

export interface Rect { x: number; y: number; w: number; h: number }

export class Sheet {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  turnShadow: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  drop: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  group = new THREE.Group();
  w = 1;
  h = 1;

  constructor(scene: THREE.Scene) {
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1, 1, 1),
      new THREE.ShaderMaterial({
        vertexShader: sheetVert,
        fragmentShader: sheetFrag,
        side: THREE.DoubleSide,
        transparent: true,
        uniforms: {
          uMap: { value: null },
          uS: { value: 1e6 }, uN: { value: new THREE.Vector2(1, 0) }, uR: { value: 100 }, uDir: { value: 1 },
          uBack: { value: new THREE.Color(0xeae4d6) },
          uLight: { value: new THREE.Vector3(-0.45, 0.55, 1.0) },
          uAlpha: { value: 1 },
        },
      }),
    );
    this.turnShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShaderMaterial({
        vertexShader: shadeVert, fragmentShader: turnShadowFrag, transparent: true, depthWrite: false,
        uniforms: { uS: { value: 1e6 }, uN: { value: new THREE.Vector2(1, 0) }, uR: { value: 100 }, uStrength: { value: 0 }, uHalf: { value: new THREE.Vector2(1, 1) } },
      }),
    );
    this.drop = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShaderMaterial({
        vertexShader: shadeVert, fragmentShader: dropFrag, transparent: true, depthWrite: false,
        uniforms: { uHalf: { value: new THREE.Vector2(1, 1) }, uBlur: { value: 20 }, uStrength: { value: 0 } },
      }),
    );
    this.turnShadow.position.z = -0.5;
    this.drop.renderOrder = -2;
    this.turnShadow.renderOrder = -1;
    this.group.add(this.drop, this.turnShadow, this.mesh);
    scene.add(this.group);
    this.group.visible = false;
  }

  setTexture(t: THREE.Texture) { this.mesh.material.uniforms.uMap.value = t; }

  /** Size in pixels; the mesh is subdivided finely enough for a smooth curl at that size. */
  setSize(w: number, h: number) {
    if (Math.abs(w - this.w) < 0.5 && Math.abs(h - this.h) < 0.5) return;
    this.w = w; this.h = h;
    const sx = Math.min(160, Math.max(40, Math.round(w / 9))), sy = Math.min(120, Math.max(30, Math.round(h / 9)));
    this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.PlaneGeometry(w, h, sx, sy);
    this.turnShadow.geometry.dispose();
    this.turnShadow.geometry = new THREE.PlaneGeometry(w, h);
    this.turnShadow.material.uniforms.uHalf.value.set(w / 2, h / 2);
  }

  /** Place the sheet flat over a screen rectangle. */
  place(r: Rect, view: { w: number; h: number }) {
    this.setSize(r.w, r.h);
    this.group.position.set(r.x + r.w / 2 - view.w / 2, view.h / 2 - (r.y + r.h / 2), 0);
    this.group.rotation.set(0, 0, 0);
    this.group.scale.set(1, 1, 1);
  }

  flat() { this.curl(1e6, 0, 100); }

  curl(s: number, angle: number, r: number, dir = 1) {
    const u = this.mesh.material.uniforms, t = this.turnShadow.material.uniforms;
    u.uDir.value = dir;
    const n = new THREE.Vector2(Math.cos(angle), Math.sin(angle));
    u.uS.value = s; u.uN.value.copy(n); u.uR.value = r;
    t.uS.value = s; t.uN.value.copy(n); t.uR.value = r;
  }

  /** Axis offsets at which the curl first touches the sheet and where it has rolled clean past it. */
  sweep(angle: number, r: number) {
    const n = new THREE.Vector2(Math.cos(angle), Math.sin(angle)), hw = this.w / 2, hh = this.h / 2;
    const ds = [[hw, hh], [-hw, hh], [hw, -hh], [-hw, -hh]].map(([x, y]) => x * n.x + y * n.y);
    const hi = Math.max(...ds), lo = Math.min(...ds);
    return { from: hi + 2, to: lo - Math.PI * r * 0.7 };
  }

  /** Soft shadow on the table. `top` limits it to the upper part of the sheet (0..1 of its height), for a folded paper. */
  setDrop(strength: number, blur: number, lift = 0, top = 1) {
    const u = this.drop.material.uniforms;
    const h = this.h * top;
    u.uStrength.value = strength; u.uBlur.value = blur;
    u.uHalf.value.set(this.w / 2 + blur * 0.4, h / 2 + blur * 0.4);
    const key = `${this.w}|${h}|${blur}`;
    if (this.drop.userData.key !== key) {
      this.drop.userData.key = key;
      this.drop.geometry.dispose();
      this.drop.geometry = new THREE.PlaneGeometry(this.w + blur * 4, h + blur * 4);
    }
    this.drop.position.set(lift * 0.35, this.h / 2 - h / 2 - lift * 0.5, -1);
  }
}

export class Paper {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(FOV, 1, 1, 50000);
  view = { w: 1, h: 1 };

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: false });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  resize(w: number, h: number) {
    this.view = { w, h };
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.position.set(0, 0, h / 2 / Math.tan((FOV * Math.PI) / 360));
    this.camera.near = 10;
    this.camera.far = this.camera.position.z * 4;
    this.camera.updateProjectionMatrix();
  }

  texture(src: HTMLCanvasElement) {
    const t = new THREE.CanvasTexture(src);
    t.colorSpace = THREE.NoColorSpace;
    t.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    return t;
  }

  render() { this.renderer.render(this.scene, this.camera); }

  dispose() {
    this.scene.traverse(o => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.geometry.dispose();
      const mat = m.material as THREE.ShaderMaterial;
      (mat.uniforms?.uMap?.value as THREE.Texture | null)?.dispose();
      mat.dispose();
    });
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
  clear() { this.renderer.clear(); }
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}
