import * as THREE from 'three';

export function initBackground() {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 1;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // ---------------------------------------------------------
  // Realistic Star Texture Generator
  // ---------------------------------------------------------
  function getStarTexture() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2;

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  const starTexture = getStarTexture();

  // ---------------------------------------------------------
  // Refined Starfield Implementation
  // ---------------------------------------------------------
  const particlesCount = 1200; // Reduced density for premium feel
  const positions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);
  const scales = new Float32Array(particlesCount);

  for (let i = 0; i < particlesCount; i++) {
    // Random position in a wide space
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

    // Slight brightness variations
    const brightness = 0.5 + Math.random() * 0.5;
    colors[i * 3] = brightness;
    colors[i * 3 + 1] = brightness;
    colors[i * 3 + 2] = brightness;

    scales[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.05, // Slightly larger base size since we have translucency
    sizeAttenuation: true,
    map: starTexture,
    transparent: true,
    alphaTest: 0.001, // Low alpha test to keep the soft edges
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const starField = new THREE.Points(geometry, material);
  scene.add(starField);

  // ---------------------------------------------------------
  // Realistic 3D Rocket Implementation
  // ---------------------------------------------------------
  // Lighting for 3D visibility
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const rocketGroup = new THREE.Group();
  const rocketMat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 100 });

  // Body: Cylinder
  const bodyGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.12, 12);
  const body = new THREE.Mesh(bodyGeo, rocketMat);
  body.rotation.x = Math.PI / 2;
  rocketGroup.add(body);

  // Nose: Cone
  const noseGeo = new THREE.ConeGeometry(0.03, 0.06, 12);
  const nose = new THREE.Mesh(noseGeo, rocketMat);
  nose.position.z = 0.09;
  nose.rotation.x = Math.PI / 2;
  rocketGroup.add(nose);

  // Fins: 3 boxes
  const finGeo = new THREE.BoxGeometry(0.01, 0.04, 0.04);
  for (let i = 0; i < 3; i++) {
    const fin = new THREE.Mesh(finGeo, rocketMat);
    const angle = (i / 3) * Math.PI * 2;
    fin.position.set(Math.cos(angle) * 0.03, Math.sin(angle) * 0.03, -0.04);
    fin.rotation.z = angle;
    rocketGroup.add(fin);
  }

  // Engine Point Light (attached to rocket)
  const engineLight = new THREE.PointLight(0xffaa44, 2, 1);
  engineLight.position.set(0, 0, -0.1);
  rocketGroup.add(engineLight);

  // Glowing Exhaust Sprite
  const flameMat = new THREE.PointsMaterial({
    size: 0.4,
    map: starTexture,
    transparent: true,
    color: 0xffaa44,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const flameGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, -0.1]), 3));
  const flame = new THREE.Points(flameGeo, flameMat);
  rocketGroup.add(flame);

  rocketGroup.visible = false;
  scene.add(rocketGroup);

  let rocketActive = false;
  let rocketStartTime = 0;
  const rocketDuration = 6.0; // Slightly faster for depth feel
  let startPos = new THREE.Vector3();
  let endPos = new THREE.Vector3();

  function spawnRocket(time) {
    rocketActive = true;
    rocketStartTime = time;
    rocketGroup.visible = true;

    // Full XYZ Randomization
    const side = Math.random() > 0.5 ? 1 : -1;
    // Enter from deep space (-10) to closer space (2) or vice versa
    startPos.set(-6 * side, (Math.random() - 0.5) * 8, -10 + Math.random() * 5);
    endPos.set(6 * side, (Math.random() - 0.5) * 8, -2 + Math.random() * 6);

    rocketGroup.position.copy(startPos);
    rocketGroup.lookAt(endPos);
  }

  let lastSpawnCheck = 0;

  // ---------------------------------------------------------
  // Animation loop
  // ---------------------------------------------------------
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Subtle drift for stars
    starField.rotation.y = elapsedTime * 0.02;
    starField.rotation.x = elapsedTime * 0.01;

    // Rocket Logic (Active frequency)
    if (!rocketActive && elapsedTime - lastSpawnCheck > 1.0) {
      lastSpawnCheck = elapsedTime;
      if (Math.random() < 0.12) {
        spawnRocket(elapsedTime);
      }
    }

    if (rocketActive) {
      const progress = (elapsedTime - rocketStartTime) / rocketDuration;
      if (progress >= 1.0) {
        rocketActive = false;
        rocketGroup.visible = false;
      } else {
        rocketGroup.position.lerpVectors(startPos, endPos, progress);
        // Look at target slightly smoothed or just fixed
        rocketGroup.lookAt(endPos);

        // Flicker effect
        flame.material.opacity = 0.6 + Math.random() * 0.4;
        engineLight.intensity = 1.5 + Math.random() * 1.5;
      }
    }

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
