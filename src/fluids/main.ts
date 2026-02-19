import * as THREE from "three";

const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry(100, 0, 100, 2000, 1, 2000);
const material = new THREE.ShaderMaterial({
uniforms: {
  uTime: { value: 0 },
  uColor: { value: new THREE.Color(0xffffff) },
  uLightPosition: { value: new THREE.Vector3() },
  uLightColor: { value: new THREE.Color() },
  uAmbientColor: { value: new THREE.Color(0, 0, 0.1) }
},
  vertexShader: `
uniform float uTime;

varying vec3 vNormal;
varying vec3 vWorldPosition;

/* ---------- NOISE ---------- */

// Hash
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Noise 2D
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) +
         (c - a) * u.y * (1.0 - u.x) +
         (d - b) * u.x * u.y;
}

// Fractal Brownian Motion
float fbm(vec2 p, float amp) {
  float value = 0.0;
  float amplitude = amp;

  for (int i = 0; i < 10; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}

/* ---------- MAIN ---------- */

void main() {
  vec3 pos = position;

  pos.y += sin(pos.x * 0.2 + uTime * 1.0) * 0.5;
  pos.x += sin(pos.x * pos.y * 0.5 + uTime * 0.5) * 1.0;
  
  pos.y += fbm(pos.xz * 0.5 + uTime * 0.1, 5.0) * 0.015;
  pos.x += sin(fbm(pos.xz * 1.0 + uTime * 1.0, 0.5) * 1.0) * 1.0;
  pos.z += sin(fbm(pos.xz * 1.0 + uTime * 1.0, 0.5) * 1.0) * 0.5;

  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  vWorldPosition = worldPosition.xyz;

  vNormal = normalize(mat3(modelMatrix) * normal);

  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}

  `,

  fragmentShader: `
    uniform vec3 uColor;
    uniform vec3 uLightPosition;
    uniform vec3 uLightColor;
    uniform vec3 uAmbientColor;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
        vec3 dx = dFdx(vWorldPosition);
        vec3 dy = dFdy(vWorldPosition);
        vec3 normal = normalize(cross(dx, dy));

        vec3 lightDir = normalize(uLightPosition - vWorldPosition);

        float diffuse = max(dot(normal, lightDir), 0.0);

        vec3 color = uColor * (diffuse + uAmbientColor) + uLightColor * diffuse;
        gl_FragColor = vec4(color, 1.0);

    }
  `
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const mainCamera = new THREE.PerspectiveCamera();
mainCamera.position.set(0, 7, 10);
mainCamera.lookAt(0, 0, 0);
scene.add(mainCamera);

const light = new THREE.DirectionalLight(new THREE.Color(1, 1, 1), 1);
light.position.set(-50, 2, 50);
light.lookAt(0, 0, 0);
scene.add(light);

const ambientLight = new THREE.AmbientLight(new THREE.Color(1, 1, 1), 0.02);
ambientLight.position.set(-10, 10, 10);
ambientLight.lookAt(0, 0, 0);
scene.add(ambientLight);

const canvas = document.getElementById("canvas")!;
const rendererParams: THREE.WebGLRendererParameters = { antialias: true, canvas: canvas }
const renderer = new THREE.WebGLRenderer(rendererParams);

const loop = (time: number) => {
    material.uniforms.uTime.value = time * 0.001;
    material.uniforms.uLightPosition.value.copy(light.position);
    material.uniforms.uLightColor.value.copy(light.color);

    renderer.render(scene, mainCamera);
    requestAnimationFrame(loop)
}
requestAnimationFrame(loop)

const resize = () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, true);

    if(mainCamera instanceof THREE.PerspectiveCamera) {
        mainCamera.aspect = canvas.clientWidth / canvas.clientHeight;
        mainCamera.updateProjectionMatrix();
    }
}
resize();