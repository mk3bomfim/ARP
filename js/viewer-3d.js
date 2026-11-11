/**
 * Advanced Research Projects // Simulador 3D de Regeneração Edáfica
 */
let scene, camera, renderer, controls;
let currentGroup = new THREE.Group();
let animItems = [];
let layerItems = [];
let isRotating = true;
let isWire = false;
let currentMode = 'hugel';

function initViewer3D() {
  const container = document.querySelector('.viewport-3d');
  const canvas = document.getElementById('canvas3d-article');
  if (!container || !canvas) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0f1d);
  scene.fog = new THREE.FogExp2(0x0a0f1d, 0.038);

  camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(7, 5.5, 8.5);

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.02;
  controls.minDistance = 3;
  controls.maxDistance = 20;
  controls.target.set(0, 1.1, 0);

  // Luzes estilo Blueprint Técnico
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xfffaed, 1.1);
  keyLight.position.set(8, 12, 7);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const blueFill = new THREE.DirectionalLight(0x0000f2, 0.5);
  blueFill.position.set(-8, 4, -6);
  scene.add(blueFill);

  // Grid técnico azul
  const grid = new THREE.GridHelper(18, 18, 0x0000f2, 0x172554);
  grid.position.y = 0;
  scene.add(grid);

  scene.add(currentGroup);

  window.addEventListener('resize', onViewerResize);
  renderLoop();

  switch3D('hugel');
}

function onViewerResize() {
  const container = document.querySelector('.viewport-3d');
  if (!container) return;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function clearStage() {
  while (currentGroup.children.length > 0) {
    currentGroup.remove(currentGroup.children[0]);
  }
  animItems = [];
  layerItems = [];
  const range = document.getElementById('explode-range');
  if (range) range.value = 0;
}

function switch3D(mode) {
  currentMode = mode;
  clearStage();

  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.getAttribute('onclick')?.includes(mode));
  if (activeBtn) activeBtn.classList.add('active');

  const desc = document.getElementById('viewer-desc');
  const explodeBox = document.getElementById('explode-container');

  if (mode === 'hugel') {
    if (desc) desc.textContent = "Hügelkultur — Núcleo de troncos enterrados, aeração profunda e esponja de lignina";
    if (explodeBox) explodeBox.style.display = 'flex';
    buildHugel();
  } else if (mode === 'biochar') {
    if (desc) desc.textContent = "Reator Kon-Tiki — Pirólise de biomassa, cortina de chamas abafadora e quench";
    if (explodeBox) explodeBox.style.display = 'none';
    buildBiochar();
  } else if (mode === 'lasagna') {
    if (desc) desc.textContent = "Lasagna Gardening — Estratificação laminar sobre papelão (No-Dig)";
    if (explodeBox) explodeBox.style.display = 'flex';
    buildLasagna();
  } else if (mode === 'biodigester') {
    if (desc) desc.textContent = "Biodigestor Anaeróbico — Cúpula gasométrica de metano e sifão de biofertilizante";
    if (explodeBox) explodeBox.style.display = 'none';
    buildBiodigester();
  } else if (mode === 'vermi') {
    if (desc) desc.textContent = "Vermicomposteira Vertical — Caixas modulares furadas e migração de minhocas";
    if (explodeBox) explodeBox.style.display = 'flex';
    buildVermi();
  } else if (mode === 'bsfl') {
    if (desc) desc.textContent = "Reator BSFL — Bioconversão de choque e rampa de autocolheita em 35°";
    if (explodeBox) explodeBox.style.display = 'none';
    buildBSFL();
  }
}

// 1. MODELO HÜGELKULTUR
function buildHugel() {
  const trench = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.45, 4.2), new THREE.MeshStandardMaterial({ color: 0x1b1510, roughness: 0.95 }));
  trench.position.y = 0.22;
  currentGroup.add(trench);

  const logMat = new THREE.MeshStandardMaterial({ color: 0x452e1c, roughness: 0.85 });
  for (let i = -2; i <= 2; i += 0.9) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.4, 3.8, 16), logMat);
    log.rotation.x = Math.PI / 2;
    log.position.set(i * 1.05, 0.65, 0);
    currentGroup.add(log);
  }

  const brMat = new THREE.MeshStandardMaterial({ color: 0x6e4726, roughness: 0.9 });
  for (let j = -1.8; j <= 1.8; j += 0.55) {
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 3.6, 10), brMat);
    br.rotation.x = Math.PI / 2;
    br.position.set(j * 0.9, 1.25, 0);
    layerItems.push({ mesh: br, baseY: 1.25, factor: 0.8 });
    currentGroup.add(br);
  }

  const greenLayer = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.35, 3.6), new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.85 }));
  greenLayer.position.y = 1.6;
  layerItems.push({ mesh: greenLayer, baseY: 1.6, factor: 1.8 });
  currentGroup.add(greenLayer);

  const compost = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.4, 3.3), new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 }));
  compost.position.y = 2.0;
  layerItems.push({ mesh: compost, baseY: 2.0, factor: 2.8 });
  currentGroup.add(compost);

  const mulch = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.2, 3.1), new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.9 }));
  mulch.position.y = 2.3;
  layerItems.push({ mesh: mulch, baseY: 2.3, factor: 3.8 });
  currentGroup.add(mulch);

  const partGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const partMat = new THREE.MeshBasicMaterial({ color: 0x0000f2 });
  for (let k = 0; k < 35; k++) {
    const pt = new THREE.Mesh(partGeo, partMat);
    pt.position.set((Math.random() - 0.5) * 3.8, 0.4 + Math.random() * 0.8, (Math.random() - 0.5) * 2.8);
    pt.userData = { vy: 0.006 + Math.random() * 0.008, baseY: pt.position.y };
    animItems.push(pt);
    currentGroup.add(pt);
  }
}

// 2. MODELO KON-TIKI BIOCHAR
function buildBiochar() {
  const coneGeo = new THREE.CylinderGeometry(2.3, 0.4, 2.7, 32, 1, true, 0, Math.PI * 1.5);
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x223049, metalness: 0.85, roughness: 0.35, side: THREE.DoubleSide });
  const cone = new THREE.Mesh(coneGeo, steelMat);
  cone.position.y = 1.35;
  currentGroup.add(cone);

  const charMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.3, 0.8, 16), new THREE.MeshStandardMaterial({ color: 0x050507, roughness: 0.95 }));
  charMesh.position.y = 0.5;
  currentGroup.add(charMesh);

  const embers = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 0.85, 0.85, 16), new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.8 }));
  embers.position.y = 1.25;
  currentGroup.add(embers);

  const flameMat = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.65 });
  for (let f = 0; f < 25; f++) {
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.6, 6), flameMat);
    flame.position.set((Math.random() - 0.5) * 1.8, 2.1 + Math.random() * 0.3, (Math.random() - 0.5) * 1.8);
    flame.userData = { vy: 0.02 + Math.random() * 0.02, baseY: flame.position.y };
    animItems.push(flame);
    currentGroup.add(flame);
  }
}

// 3. MODELO LASAGNA NO-DIG
function buildLasagna() {
  const w = 4.8, d = 3.4;
  const turf = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 0.25, d + 0.8), new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.9 }));
  turf.position.y = 0.12;
  currentGroup.add(turf);

  const card = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.85 }));
  card.position.y = 0.3;
  layerItems.push({ mesh: card, baseY: 0.3, factor: 0.5 });
  currentGroup.add(card);

  const brown1 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.28, d), new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.9 }));
  brown1.position.y = 0.52;
  layerItems.push({ mesh: brown1, baseY: 0.52, factor: 1.2 });
  currentGroup.add(brown1);

  const green1 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.22, d), new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 }));
  green1.position.y = 0.8;
  layerItems.push({ mesh: green1, baseY: 0.8, factor: 2.0 });
  currentGroup.add(green1);

  const comp = new THREE.Mesh(new THREE.BoxGeometry(w, 0.32, d), new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 }));
  comp.position.y = 1.1;
  layerItems.push({ mesh: comp, baseY: 1.1, factor: 2.8 });
  currentGroup.add(comp);

  const mulch = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, d), new THREE.MeshStandardMaterial({ color: 0xf2f200, roughness: 0.85 }));
  mulch.position.y = 1.35;
  layerItems.push({ mesh: mulch, baseY: 1.35, factor: 3.6 });
  currentGroup.add(mulch);
}

// 4. MODELO BIODIGESTOR
function buildBiodigester() {
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 2.2, 32), new THREE.MeshStandardMaterial({ color: 0x0000f2, transparent: true, opacity: 0.35, roughness: 0.2 }));
  tank.position.y = 1.1;
  currentGroup.add(tank);

  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.75, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.5 }));
  dome.position.y = 2.2;
  currentGroup.add(dome);

  const sludge = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1.2, 32), new THREE.MeshStandardMaterial({ color: 0x332211, roughness: 0.95 }));
  sludge.position.y = 0.6;
  currentGroup.add(sludge);

  const bubbleGeo = new THREE.SphereGeometry(0.05, 8, 8);
  const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xf2f200 });
  for (let b = 0; b < 25; b++) {
    const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
    bubble.position.set((Math.random() - 0.5) * 2.6, 0.4 + Math.random() * 1.4, (Math.random() - 0.5) * 2.6);
    bubble.userData = { vy: 0.015 + Math.random() * 0.015, minY: 0.4, maxY: 2.1 };
    animItems.push(bubble);
    currentGroup.add(bubble);
  }
}

// 5. MODELO VERMICOMPOSTEIRA
function buildVermi() {
  const boxMat = new THREE.MeshStandardMaterial({ color: 0x1a263e, roughness: 0.6 });
  const b1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.65, 1.9), boxMat);
  b1.position.y = 0.45;
  currentGroup.add(b1);

  const b2 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.65, 1.9), boxMat);
  b2.position.y = 1.2;
  layerItems.push({ mesh: b2, baseY: 1.2, factor: 1.0 });
  currentGroup.add(b2);

  const b3 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.65, 1.9), boxMat);
  b3.position.y = 1.95;
  layerItems.push({ mesh: b3, baseY: 1.95, factor: 2.0 });
  currentGroup.add(b3);

  const lid = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 2.0), new THREE.MeshStandardMaterial({ color: 0x0000f2 }));
  lid.position.y = 2.35;
  layerItems.push({ mesh: lid, baseY: 2.35, factor: 2.6 });
  currentGroup.add(lid);
}

// 6. MODELO REATOR BSFL
function buildBSFL() {
  const bin = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.75, 2.1), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 }));
  bin.position.y = 0.55;
  currentGroup.add(bin);

  const ramp = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.9), new THREE.MeshStandardMaterial({ color: 0x64748b, side: THREE.DoubleSide }));
  ramp.position.set(1.35, 1.1, 0);
  ramp.rotation.set(0, 0, -Math.PI / 4.5);
  currentGroup.add(ramp);

  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.55, 16), new THREE.MeshStandardMaterial({ color: 0xf2f200 }));
  cup.position.set(2.2, 0.65, 0);
  currentGroup.add(cup);
}

function handleExplode(val) {
  const factor = val / 100;
  layerItems.forEach(item => {
    item.mesh.position.y = item.baseY + (factor * item.factor);
  });
}

function toggleRot() {
  isRotating = !isRotating;
  const btn = document.getElementById('btn-rot');
  if (btn) btn.classList.toggle('active', isRotating);
}

function toggleWire() {
  isWire = !isWire;
  const btn = document.getElementById('btn-wire');
  if (btn) btn.classList.toggle('active', isWire);
  currentGroup.traverse(child => {
    if (child.isMesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.wireframe = isWire);
      } else {
        child.material.wireframe = isWire;
      }
    }
  });
}

function resetCam() {
  camera.position.set(7, 5.5, 8.5);
  controls.target.set(0, 1.1, 0);
  controls.update();
}

function renderLoop() {
  requestAnimationFrame(renderLoop);
  if (isRotating) {
    currentGroup.rotation.y += 0.003;
  }
  animItems.forEach(p => {
    if (p.userData.vy) {
      p.position.y += p.userData.vy;
      if (p.userData.maxY && p.position.y > p.userData.maxY) p.position.y = p.userData.minY;
      if (p.userData.baseY && p.position.y > p.userData.baseY + 0.45) p.position.y = p.userData.baseY;
    }
  });
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', initViewer3D);
