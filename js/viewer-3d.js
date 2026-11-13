/**
 * Advanced Research Projects // Simulador 3D de Regeneração Edáfica e Biotecnologia de Resíduos
 * Arquitetura Procedural Pura em Three.js r128 — Zero Dependências Externas (100% Offline / file:///)
 * Modelagem Tridimensional Científica de Alta Fidelidade dos 6 Reatores Agroecológicos:
 *  01 // Hügelkultur (Colina Permacultural / Canteiro Esponja Decenal)
 *  02 // Kon-Tiki Biochar (Reator Cônico de Pirólise com Cortina de Chamas em Vórtice)
 *  03 // Lasagna No-Dig (Sheet Mulching / Estratificação Laminar Aerada sobre Papelão)
 *  04 // Biodigestor Anaeróbico (Cúpula Gasométrica de Metano, Lodo Metanogênico e Manômetro)
 *  05 // Vermicomposteira Vertical (Bateria Modular HDPE com Migração e Torneira de Biofertilizante)
 *  06 // Reator BSFL (Bioconversão por Hermetia illucens com Rampa de Autocolheita em 35°)
 */

let scene, camera, renderer, controls;
let currentGroup = new THREE.Group();
let animItems = [];
let layerItems = [];
let isRotating = true;
let isWire = false;
let currentMode = 'hugel';
let isUserScrubbingCam = false;

// =========================================================================
// GERADORES PROCEDURAIS DE TEXTURA EM CANVAS 2D (ZERO ASSETS EXTERNOS)
// =========================================================================

function createTreeRingCanvasTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const cx = 128, cy = 128;
  const grad = ctx.createRadialGradient(cx, cy, 6, cx, cy, 126);
  grad.addColorStop(0, '#543216');
  grad.addColorStop(0.2, '#9c663a');
  grad.addColorStop(0.7, '#cba273');
  grad.addColorStop(0.92, '#855228');
  grad.addColorStop(1.0, '#381f10');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  ctx.lineWidth = 1.2;
  for (let r = 12; r < 122; r += 4 + Math.sin(r * 0.3) * 1.5) {
    ctx.beginPath();
    ctx.strokeStyle = r % 8 === 0 ? 'rgba(68, 38, 18, 0.65)' : 'rgba(84, 48, 22, 0.40)';
    for (let a = 0; a <= Math.PI * 2; a += 0.08) {
      const wobble = Math.sin(a * 7 + r) * 1.6 + Math.cos(a * 3) * 1.2;
      const px = cx + (r + wobble) * Math.cos(a);
      const py = cy + (r + wobble) * Math.sin(a);
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Rachaduras radiais naturais
  ctx.strokeStyle = 'rgba(40, 20, 10, 0.55)';
  ctx.lineWidth = 1.0;
  for (let k = 0; k < 7; k++) {
    const ang = k * (Math.PI * 2 / 7) + 0.3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const len = 40 + Math.random() * 65;
    ctx.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function createTreeBarkCanvasTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#452b19';
  ctx.fillRect(0, 0, 256, 256);

  for (let x = 0; x < 256; x += 3) {
    ctx.fillStyle = (x % 6 === 0) ? '#2c1a0e' : '#5c3922';
    ctx.fillRect(x, 0, 2, 256);
  }

  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * 256;
    const ry = Math.random() * 256;
    const rw = 2 + Math.random() * 4;
    const rh = 12 + Math.random() * 24;
    ctx.fillStyle = Math.random() > 0.5 ? '#1f130b' : '#694127';
    ctx.fillRect(rx, ry, rw, rh);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 4);
  return tex;
}

function createManometerCanvasTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Mostrador branco com aro metálico
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(128, 128, 124, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(128, 128, 114, 0, Math.PI * 2);
  ctx.fill();

  // Faixas coloridas: Verde (15-30 mbar), Amarelo (30-40), Vermelho (40-50)
  ctx.lineWidth = 8;
  // Arco de 0.75 PI a 2.25 PI (270 graus)
  ctx.strokeStyle = '#22c55e'; // Verde
  ctx.beginPath();
  ctx.arc(128, 128, 98, Math.PI * 0.95, Math.PI * 1.55);
  ctx.stroke();

  ctx.strokeStyle = '#eab308'; // Amarelo
  ctx.beginPath();
  ctx.arc(128, 128, 98, Math.PI * 1.55, Math.PI * 1.85);
  ctx.stroke();

  ctx.strokeStyle = '#ef4444'; // Vermelho
  ctx.beginPath();
  ctx.arc(128, 128, 98, Math.PI * 1.85, Math.PI * 2.25);
  ctx.stroke();

  // Marcas e graduação
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const totalTicks = 25;
  for (let i = 0; i <= totalTicks; i++) {
    const ang = Math.PI * 0.75 + (i / totalTicks) * (Math.PI * 1.5);
    const inner = (i % 5 === 0) ? 84 : 90;
    const x1 = 128 + Math.cos(ang) * inner;
    const y1 = 128 + Math.sin(ang) * inner;
    const x2 = 128 + Math.cos(ang) * 96;
    const y2 = 128 + Math.sin(ang) * 96;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    if (i % 5 === 0) {
      const val = (i * 2).toString();
      const tx = 128 + Math.cos(ang) * 72;
      const ty = 128 + Math.sin(ang) * 72;
      ctx.fillText(val, tx, ty);
    }
  }

  // Textos técnicos
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('BIOGÁS', 128, 158);
  ctx.font = '10px monospace';
  ctx.fillStyle = '#475569';
  ctx.fillText('mbar // ARP-06', 128, 174);

  // Ponteiro apontando para 22 mbar (zona ótima de operação)
  const needleAngle = Math.PI * 0.75 + (11 / totalTicks) * (Math.PI * 1.5);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(128 - Math.cos(needleAngle) * 14, 128 - Math.sin(needleAngle) * 14);
  ctx.lineTo(128 + Math.cos(needleAngle) * 88, 128 + Math.sin(needleAngle) * 88);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(128, 128, 8, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// Texturas compartilhadas instanciadas
let sharedWoodRingTex = null;
let sharedWoodBarkTex = null;
let sharedManometerTex = null;

function getSharedTextures() {
  if (!sharedWoodRingTex) sharedWoodRingTex = createTreeRingCanvasTexture();
  if (!sharedWoodBarkTex) sharedWoodBarkTex = createTreeBarkCanvasTexture();
  if (!sharedManometerTex) sharedManometerTex = createManometerCanvasTexture();
}

// =========================================================================
// INICIALIZAÇÃO THREE.JS & VIEWPORT
// =========================================================================

function initViewer3D() {
  const container = document.querySelector('.viewport-3d');
  const canvas = document.getElementById('canvas3d-article');
  if (!container || !canvas) return;

  getSharedTextures();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1953d4);
  scene.fog = new THREE.FogExp2(0x1953d4, 0.024);

  camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(7, 5.5, 8.5);

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.maxPolarAngle = Math.PI / 2 - 0.02;
  controls.minDistance = 2.0;
  controls.maxDistance = 35;
  controls.target.set(0, 1.1, 0);

  controls.addEventListener('start', () => {
    isUserScrubbingCam = false;
  });

  controls.addEventListener('change', () => {
    if (!isUserScrubbingCam) {
      updateCamUI(camera.position.x, camera.position.y, camera.position.z);
    }
  });

  // Luzes estilo Blueprint Técnico
  const ambient = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambient);
  window._viewerAmbient = ambient;

  const keyLight = new THREE.DirectionalLight(0xfffaed, 1.25);
  keyLight.position.set(8, 14, 7);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight);
  window._viewerKeyLight = keyLight;

  const fillWhite = new THREE.DirectionalLight(0xffffff, 0.55);
  fillWhite.position.set(-8, 5, -6);
  scene.add(fillWhite);
  window._viewerFillLight = fillWhite;

  // Grid técnico blueprint
  const grid = new THREE.GridHelper(18, 18, 0xffffff, 0x5a91f5);
  grid.position.y = 0;
  scene.add(grid);

  scene.add(currentGroup);

  window.scene = scene;
  window.camera = camera;
  window.renderer = renderer;
  window.controls = controls;
  window.currentGroup = currentGroup;
  window.animItems = animItems;
  window.layerItems = layerItems;

  window.addEventListener('resize', onViewerResize);
  renderLoop();

  switch3D('hugel');
}

function onViewerResize() {
  const container = document.querySelector('.viewport-3d');
  if (!container || !renderer || !camera) return;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function clearStage() {
  while (currentGroup.children.length > 0) {
    const child = currentGroup.children[0];
    currentGroup.remove(child);
  }
  animItems = [];
  layerItems = [];
  window.animItems = animItems;
  window.layerItems = layerItems;
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

  // Suporte universal e elegante ao controle de explosão estratigráfica em todos os reatores
  if (explodeBox) explodeBox.style.display = 'flex';

  if (mode === 'hugel') {
    if (desc) desc.textContent = "Hügelkultur — Núcleo de troncos enterrados, teia fúngica e esponja de retenção hídrica decenal";
    buildHugel();
  } else if (mode === 'biochar') {
    if (desc) desc.textContent = "Reator Kon-Tiki — Pirólise de biomassa, cortina de chamas em vórtice e quench por inundação";
    buildBiochar();
  } else if (mode === 'lasagna') {
    if (desc) desc.textContent = "Lasagna Gardening — Estratificação laminar aerada sobre papelão e galerias de minhocas";
    buildLasagna();
  } else if (mode === 'biodigester') {
    if (desc) desc.textContent = "Biodigestor Anaeróbico — Cúpula gasométrica de metano com contrapesos, lodo metanogênico e manômetro";
    buildBiodigester();
  } else if (mode === 'vermi') {
    if (desc) desc.textContent = "Vermicomposteira Vertical — Caixas modulares HDPE, piso furado de migração e torneira de biofertilizante";
    buildVermi();
  } else if (mode === 'bsfl') {
    if (desc) desc.textContent = "Reator BSFL — Bioconversão de choque por Hermetia illucens e rampa de autocolheita em 35°";
    buildBSFL();
  }
}

// =========================================================================
// AUXILIARES PROCEDURAIS DE MODELAGEM
// =========================================================================

function createDetailedLog(r, len, barkMat, ringMat) {
  const logGroup = new THREE.Group();
  
  // Corpo cilíndrico com casca
  const geo = new THREE.CylinderGeometry(r, r * 1.05, len, 24, 1, false);
  const mesh = new THREE.Mesh(geo, barkMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  logGroup.add(mesh);

  // Topo e base com anéis concêntricos de crescimento
  const capGeo = new THREE.CircleGeometry(r, 24);
  const topCap = new THREE.Mesh(capGeo, ringMat);
  topCap.rotation.x = -Math.PI / 2;
  topCap.position.y = len / 2 + 0.002;
  logGroup.add(topCap);

  const bottomCap = new THREE.Mesh(capGeo, ringMat);
  bottomCap.rotation.x = Math.PI / 2;
  bottomCap.position.y = -len / 2 - 0.002;
  logGroup.add(bottomCap);

  return logGroup;
}

function createShelfFungus(r, thickness, color) {
  const fungusGroup = new THREE.Group();
  const capGeo = new THREE.CylinderGeometry(r, r * 0.95, thickness, 16, 1, false, 0, Math.PI);
  const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.75 });
  const mesh = new THREE.Mesh(capGeo, mat);
  mesh.rotation.z = Math.PI / 2;
  fungusGroup.add(mesh);

  const underMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.9 });
  const under = new THREE.Mesh(new THREE.CircleGeometry(r * 0.92, 16, 0, Math.PI), underMat);
  under.rotation.x = Math.PI / 2;
  under.position.y = -thickness / 2;
  fungusGroup.add(under);
  return fungusGroup;
}

function createEarthworm(curvePoints, radius, bodyColor, clitellumColor) {
  const curve = new THREE.CatmullRomCurve3(curvePoints);
  const wormGeo = new THREE.TubeGeometry(curve, 32, radius, 10, false);
  const wormMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.35, metalness: 0.05 });
  const wormMesh = new THREE.Mesh(wormGeo, wormMat);
  wormMesh.castShadow = true;

  // Clitelo anelar dilatado
  const pClit = curve.getPoint(0.35);
  const tangent = curve.getTangent(0.35);
  const clitGeo = new THREE.CylinderGeometry(radius * 1.45, radius * 1.45, radius * 3.5, 12);
  const clitMat = new THREE.MeshStandardMaterial({ color: clitellumColor, roughness: 0.3 });
  const clitMesh = new THREE.Mesh(clitGeo, clitMat);
  clitMesh.position.copy(pClit);
  clitMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
  wormMesh.add(clitMesh);

  return wormMesh;
}

function createPioneerPlant(type) {
  const plantGroup = new THREE.Group();

  if (type === 'comfrey') {
    // Confrei (Symphytum officinale) com roseta basal e folhas lanceoladas
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x1f5c2b, roughness: 0.7, side: THREE.DoubleSide });
    for (let i = 0; i < 9; i++) {
      const ang = i * (Math.PI * 2 / 9) + Math.random() * 0.2;
      const leafGeo = new THREE.PlaneGeometry(0.24, 0.75, 4, 6);
      // Curvatura arqueada para fora
      const pos = leafGeo.attributes.position;
      for (let j = 0; j < pos.count; j++) {
        const y = pos.getY(j);
        pos.setZ(j, -Math.sin(y * 2.5) * 0.15);
      }
      leafGeo.computeVertexNormals();
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.rotation.set(-0.65, ang, 0, 'YXZ');
      leaf.position.set(Math.cos(ang) * 0.08, 0.15, Math.sin(ang) * 0.08);
      plantGroup.add(leaf);
    }
    // Raiz pivotante profunda em direção aos troncos
    const rootGeo = new THREE.CylinderGeometry(0.04, 0.01, 1.1, 8);
    const rootMat = new THREE.MeshStandardMaterial({ color: 0xd9c8b0, roughness: 0.85 });
    const root = new THREE.Mesh(rootGeo, rootMat);
    root.position.y = -0.55;
    plantGroup.add(root);

  } else if (type === 'squash') {
    // Abóbora/Moranga com folhas largas poligonais e mini fruto
    const vineMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.7, side: THREE.DoubleSide });
    for (let f = 0; f < 5; f++) {
      const lx = (f - 2) * 0.45;
      const lz = Math.sin(f) * 0.35;
      const broadLeaf = new THREE.Mesh(new THREE.CircleGeometry(0.28, 7), vineMat);
      broadLeaf.rotation.x = -Math.PI / 2 + 0.25;
      broadLeaf.position.set(lx, 0.12, lz);
      plantGroup.add(broadLeaf);
    }
    // Mini abóbora alaranjada
    const squashFruit = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.5 })
    );
    squashFruit.scale.set(1.2, 0.85, 1.2);
    squashFruit.position.set(0.65, 0.12, 0.2);
    plantGroup.add(squashFruit);
  }
  return plantGroup;
}

// =========================================================================
// 1. MODELO HÜGELKULTUR (Colina Permacultural)
// =========================================================================
function buildHugel() {
  getSharedTextures();

  // Vala escavada no solo subjacente (Horizonte B)
  const trenchGeo = new THREE.BoxGeometry(6.6, 0.45, 4.4);
  const trenchMat = new THREE.MeshStandardMaterial({ color: 0x291a10, roughness: 0.95 });
  const trench = new THREE.Mesh(trenchGeo, trenchMat);
  trench.position.y = 0.22;
  trench.receiveShadow = true;
  currentGroup.add(trench);

  // Materiais de madeira e casca
  const barkMat = new THREE.MeshStandardMaterial({
    color: 0x4a2e1b,
    roughness: 0.85,
    map: sharedWoodBarkTex
  });
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.75,
    map: sharedWoodRingTex
  });

  // Nível 1: Troncos Basais Espessos (Fundação da Esponja)
  const logRadius1 = 0.38;
  const baseLogOffsets = [-1.8, -0.6, 0.6, 1.8];
  baseLogOffsets.forEach(x => {
    const log1 = createDetailedLog(logRadius1, 3.8, barkMat, ringMat);
    log1.rotation.x = Math.PI / 2;
    log1.position.set(x, 0.58, 0);
    currentGroup.add(log1);
  });

  // Nível 2: Troncos Intermediários Entrelaçados
  const logRadius2 = 0.32;
  const midLogOffsets = [-1.2, 0.0, 1.2];
  midLogOffsets.forEach(x => {
    const log2 = createDetailedLog(logRadius2, 3.7, barkMat, ringMat);
    log2.rotation.x = Math.PI / 2;
    log2.position.set(x, 1.08, 0);
    layerItems.push({ mesh: log2, baseY: 1.08, factor: 0.6 });
    currentGroup.add(log2);
  });

  // Nível 3: Camada de Galhos Finos e Biomassa Lenhosa Intersticial
  const branchMat = new THREE.MeshStandardMaterial({ color: 0x6e4726, roughness: 0.9 });
  for (let j = -2.1; j <= 2.1; j += 0.35) {
    const rBr = 0.08 + Math.random() * 0.04;
    const br = new THREE.Mesh(new THREE.CylinderGeometry(rBr, rBr * 1.1, 3.6, 10), branchMat);
    br.rotation.x = Math.PI / 2;
    br.rotation.z = (Math.random() - 0.5) * 0.15;
    br.position.set(j, 1.48 + (Math.random() - 0.5) * 0.06, 0);
    layerItems.push({ mesh: br, baseY: br.position.y, factor: 1.2 });
    currentGroup.add(br);
  }

  // Fungos de prateleira (Orelhas-de-pau / Ganoderma) colonizando os troncos
  const fungus1 = createShelfFungus(0.22, 0.04, 0x9a3412);
  fungus1.position.set(-1.8 + logRadius1, 0.65, 0.8);
  currentGroup.add(fungus1);

  const fungus2 = createShelfFungus(0.18, 0.03, 0x7c2d12);
  fungus2.position.set(0.6 - logRadius1, 0.72, -0.9);
  currentGroup.add(fungus2);

  // Rede de Hifas de Micélio Fúngico (Filamentos Brancos)
  const myceliumMat = new THREE.LineBasicMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.65 });
  for (let m = 0; m < 16; m++) {
    const pts = [];
    let px = (Math.random() - 0.5) * 3.5;
    let py = 0.5 + Math.random() * 0.8;
    let pz = (Math.random() - 0.5) * 2.5;
    pts.push(new THREE.Vector3(px, py, pz));
    for (let s = 0; s < 4; s++) {
      px += (Math.random() - 0.5) * 0.6;
      py += (Math.random() - 0.2) * 0.4;
      pz += (Math.random() - 0.5) * 0.6;
      pts.push(new THREE.Vector3(px, py, pz));
    }
    const hyphaGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const hyphaLine = new THREE.Line(hyphaGeo, myceliumMat);
    currentGroup.add(hyphaLine);
  }

  // Camada de Biocarvão Inoculado / Pedaços Carbonizados
  const charMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.98 });
  const biocharGroup = new THREE.Group();
  for (let c = 0; c < 28; c++) {
    const charGeo = new THREE.DodecahedronGeometry(0.06 + Math.random() * 0.04);
    const charMesh = new THREE.Mesh(charGeo, charMat);
    charMesh.position.set((Math.random() - 0.5) * 4.2, 1.55 + Math.random() * 0.15, (Math.random() - 0.5) * 3.0);
    biocharGroup.add(charMesh);
  }
  layerItems.push({ mesh: biocharGroup, baseY: 0, factor: 1.5 });
  currentGroup.add(biocharGroup);

  // Camada Verde / Matéria Nitrogenada & Grama Invertida
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.85 });
  const greenLayer = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.32, 3.6), greenMat);
  greenLayer.position.y = 1.82;
  layerItems.push({ mesh: greenLayer, baseY: 1.82, factor: 2.0 });
  currentGroup.add(greenLayer);

  // Camada de Composto Orgânico Maduro (Húmus e Solo Superficial)
  const compostMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.92 });
  const compost = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.38, 3.3), compostMat);
  compost.position.y = 2.18;
  layerItems.push({ mesh: compost, baseY: 2.18, factor: 2.8 });
  currentGroup.add(compost);

  // Camada de Cobertura Morta / Mulching de Palha e Cavacos
  const mulchMat = new THREE.MeshStandardMaterial({ color: 0xc49b45, roughness: 0.9 });
  const mulch = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.22, 3.0), mulchMat);
  mulch.position.y = 2.48;
  layerItems.push({ mesh: mulch, baseY: 2.48, factor: 3.6 });
  currentGroup.add(mulch);

  // Vegetação Pioneira e Produtiva no Topo da Colina
  const plant1 = createPioneerPlant('comfrey');
  plant1.position.set(-1.2, 2.58, 0.4);
  layerItems.push({ mesh: plant1, baseY: 2.58, factor: 4.1 });
  currentGroup.add(plant1);

  const plant2 = createPioneerPlant('comfrey');
  plant2.position.set(1.4, 2.58, -0.3);
  layerItems.push({ mesh: plant2, baseY: 2.58, factor: 4.1 });
  currentGroup.add(plant2);

  const plant3 = createPioneerPlant('squash');
  plant3.position.set(0.1, 2.58, 0.2);
  layerItems.push({ mesh: plant3, baseY: 2.58, factor: 4.1 });
  currentGroup.add(plant3);

  // Partículas de Ascensão Capilar Hídrica da Esponja (Azul Turquesa)
  const partGeo = new THREE.SphereGeometry(0.045, 8, 8);
  const partMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  for (let k = 0; k < 40; k++) {
    const pt = new THREE.Mesh(partGeo, partMat);
    pt.position.set((Math.random() - 0.5) * 4.2, 0.4 + Math.random() * 1.8, (Math.random() - 0.5) * 3.0);
    pt.userData = {
      type: 'moisture',
      vy: 0.007 + Math.random() * 0.009,
      baseY: pt.position.y,
      maxY: 2.5
    };
    animItems.push(pt);
    currentGroup.add(pt);
  }
}

// =========================================================================
// 2. MODELO KON-TIKI BIOCHAR (Pirólise com Cortina de Chamas)
// =========================================================================
function buildBiochar() {
  getSharedTextures();

  // Cone Metálico Troncado em Aço Corten / Carbono Escuro
  // Abertura em 270 graus (Math.PI * 1.5) para corte e inspeção interna do leito
  const coneGeo = new THREE.CylinderGeometry(2.35, 0.45, 2.6, 32, 1, true, 0, Math.PI * 1.55);
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x272f3d,
    metalness: 0.82,
    roughness: 0.38,
    side: THREE.DoubleSide
  });
  const cone = new THREE.Mesh(coneGeo, steelMat);
  cone.position.y = 1.7;
  cone.castShadow = true;
  cone.receiveShadow = true;
  currentGroup.add(cone);

  // Borda Rolada Superior (Torus de Reforço Estrutural)
  const rimGeo = new THREE.TorusGeometry(2.35, 0.08, 16, 48, Math.PI * 1.55);
  const rimMesh = new THREE.Mesh(rimGeo, steelMat);
  rimMesh.rotation.x = Math.PI / 2;
  rimMesh.position.y = 3.0;
  currentGroup.add(rimMesh);

  // Alças Laterais de Içamento e Transporte
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x1e2634, metalness: 0.9, roughness: 0.3 });
  [-1, 1].forEach(side => {
    const hMesh = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 12, 16, Math.PI), handleMat);
    hMesh.position.set(side * 2.38, 2.7, 0);
    hMesh.rotation.y = side === 1 ? 0 : Math.PI;
    currentGroup.add(hMesh);
  });

  // Base do Tripé em Tubo de Aço com Sapatas
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1a212d, metalness: 0.85, roughness: 0.4 });
  const legAngles = [0.4, 0.4 + (Math.PI * 2 / 3), 0.4 + (Math.PI * 4 / 3)];
  legAngles.forEach(ang => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 1.35, 12), legMat);
    leg.position.set(Math.cos(ang) * 0.9, 0.65, Math.sin(ang) * 0.9);
    leg.rotation.z = Math.sin(ang) * 0.42;
    leg.rotation.x = -Math.cos(ang) * 0.42;
    currentGroup.add(leg);

    // Sapata circular na base
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 16), legMat);
    pad.position.set(Math.cos(ang) * 1.25, 0.015, Math.sin(ang) * 1.25);
    currentGroup.add(pad);
  });

  // Anel de Reforço do Tripé
  const ringSupport = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.04, 12, 32), legMat);
  ringSupport.rotation.x = Math.PI / 2;
  ringSupport.position.y = 0.55;
  currentGroup.add(ringSupport);

  // Conjunto do Dreno e Válvula de Quench (Resfriamento por Inundação de Água)
  const valvePipe = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.65, 16), steelMat);
  valvePipe.rotation.x = Math.PI / 2;
  valvePipe.position.set(0, 0.4, 0.35);
  currentGroup.add(valvePipe);

  // Corpo da Válvula em Latão com Alavanca Vermelha de 1/4 de Volta
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, metalness: 0.88, roughness: 0.25 });
  const valveBody = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.22), brassMat);
  valveBody.position.set(0, 0.4, 0.72);
  currentGroup.add(valveBody);

  const valveLever = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.26, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35 })
  );
  valveLever.position.set(0, 0.55, 0.72);
  valveLever.rotation.z = 0.45;
  currentGroup.add(valveLever);

  // Engate Rápido Camlock de Mangueira de Quench
  const camlock = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.16, 16), brassMat);
  camlock.rotation.x = Math.PI / 2;
  camlock.position.set(0, 0.4, 0.88);
  currentGroup.add(camlock);

  // Leito Inferior: Biocarvão Poroso Recalcitrante (Preto Profundo)
  const charMat = new THREE.MeshStandardMaterial({ color: 0x050508, roughness: 0.95 });
  const biocharBase = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.38, 0.85, 24), charMat);
  biocharBase.position.y = 0.85;
  currentGroup.add(biocharBase);

  // Pedaços Facetados de Biocarvão no Fundo
  for (let b = 0; b < 24; b++) {
    const chunk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08 + Math.random() * 0.06), charMat);
    chunk.position.set((Math.random() - 0.5) * 1.1, 1.1 + Math.random() * 0.2, (Math.random() - 0.5) * 1.1);
    currentGroup.add(chunk);
  }

  // Leito Médio: Brasa Viva em Pirólise Ativa (Laranja Incandescente Pulsante)
  const emberMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.85,
    roughness: 0.6
  });
  const embers = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 0.95, 0.9, 24), emberMat);
  embers.position.y = 1.7;
  embers.userData = { type: 'emberPulse', baseEmissive: 0.85 };
  animItems.push(embers);
  layerItems.push({ mesh: embers, baseY: 1.7, factor: 0.8 });
  currentGroup.add(embers);

  // Cortina Cônica Superior de Chamas em Vórtice (Consumidora de Fumaça / Baixas Emissões)
  const flameMatCore = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.85 });
  const flameMatOuter = new THREE.MeshBasicMaterial({ color: 0xea580c, transparent: true, opacity: 0.65 });

  const flameVortexGroup = new THREE.Group();
  for (let f = 0; f < 36; f++) {
    const angle = f * (Math.PI * 2 / 36);
    const rad = 1.45 + Math.random() * 0.75;
    const flameCore = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.75, 6), flameMatCore);
    flameCore.position.set(Math.cos(angle) * rad, 2.45 + Math.random() * 0.45, Math.sin(angle) * rad);
    flameCore.rotation.z = Math.sin(angle) * 0.25;
    flameCore.rotation.x = -Math.cos(angle) * 0.25;
    flameCore.userData = { type: 'vortexFlame', baseRad: rad, angle: angle, vy: 0.015 + Math.random() * 0.02 };
    animItems.push(flameCore);
    flameVortexGroup.add(flameCore);

    const flameOuter = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.95, 6), flameMatOuter);
    flameOuter.position.copy(flameCore.position);
    flameVortexGroup.add(flameOuter);
  }
  layerItems.push({ mesh: flameVortexGroup, baseY: 0, factor: 1.6 });
  currentGroup.add(flameVortexGroup);
}

// =========================================================================
// 3. MODELO LASAGNA NO-DIG (Sheet Mulching Estratificado)
// =========================================================================
function buildLasagna() {
  getSharedTextures();

  const w = 5.0, d = 3.6;

  // 1. Subsolo Nativo Compactado / Horizonte C
  const subsoilGeo = new THREE.BoxGeometry(w + 0.6, 0.22, d + 0.6);
  const subsoilMat = new THREE.MeshStandardMaterial({ color: 0x2e1e12, roughness: 0.95 });
  const subsoil = new THREE.Mesh(subsoilGeo, subsoilMat);
  subsoil.position.y = 0.11;
  subsoil.receiveShadow = true;
  currentGroup.add(subsoil);

  // 2. Horizonte A Nativo (Solo Superficial Existente Não Revolvido)
  const turfGeo = new THREE.BoxGeometry(w + 0.2, 0.14, d + 0.2);
  const turfMat = new THREE.MeshStandardMaterial({ color: 0x1f3818, roughness: 0.9 });
  const turf = new THREE.Mesh(turfGeo, turfMat);
  turf.position.y = 0.29;
  currentGroup.add(turf);

  // 3. Barreira de Papelão Pardo Ondulado (Kraft Cardboard)
  const cardMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.85 });
  const card = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), cardMat);
  card.position.y = 0.40;
  layerItems.push({ mesh: card, baseY: 0.40, factor: 0.5 });
  currentGroup.add(card);

  // 4. Estrato 1 de Carbono ("Marrons" / Folhas Secas, Palhada, Poda Triturada)
  const brown1Mat = new THREE.MeshStandardMaterial({ color: 0x784a1e, roughness: 0.92 });
  const brown1 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.24, d), brown1Mat);
  brown1.position.y = 0.56;
  layerItems.push({ mesh: brown1, baseY: 0.56, factor: 1.1 });
  currentGroup.add(brown1);

  // 5. Estrato 1 de Nitrogênio ("Verdes" / Grama Fresca, Borra de Café, Restos Crus)
  const green1Mat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
  const green1 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.20, d), green1Mat);
  green1.position.y = 0.78;
  layerItems.push({ mesh: green1, baseY: 0.78, factor: 1.8 });
  currentGroup.add(green1);

  // 6. Núcleo Inoculante de Bokashi e Biocarvão Pulverizado
  const bokashiMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.95 });
  const bokashi = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), bokashiMat);
  bokashi.position.y = 0.92;
  layerItems.push({ mesh: bokashi, baseY: 0.92, factor: 2.3 });
  currentGroup.add(bokashi);

  // 7. Estrato 2 de Carbono ("Marrons" / Serragem e Palhada)
  const brown2Mat = new THREE.MeshStandardMaterial({ color: 0x926127, roughness: 0.9 });
  const brown2 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.22, d), brown2Mat);
  brown2.position.y = 1.07;
  layerItems.push({ mesh: brown2, baseY: 1.07, factor: 2.8 });
  currentGroup.add(brown2);

  // 8. Estrato 2 de Nitrogênio ("Verdes" / Esterco Curtido e Biomassa Fresca)
  const green2Mat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.82 });
  const green2 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.18, d), green2Mat);
  green2.position.y = 1.27;
  layerItems.push({ mesh: green2, baseY: 1.27, factor: 3.3 });
  currentGroup.add(green2);

  // 9. Composto Maduro / Húmus Peneirado (Cama de Semeadura Superior)
  const compMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.94 });
  const comp = new THREE.Mesh(new THREE.BoxGeometry(w, 0.28, d), compMat);
  comp.position.y = 1.50;
  layerItems.push({ mesh: comp, baseY: 1.50, factor: 3.8 });
  currentGroup.add(comp);

  // 10. Cobertura Morta Protetora de Palha Dourada (Mulch)
  const mulchMat = new THREE.MeshStandardMaterial({ color: 0xdfa522, roughness: 0.88 });
  const mulch = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, d), mulchMat);
  mulch.position.y = 1.71;
  layerItems.push({ mesh: mulch, baseY: 1.71, factor: 4.4 });
  currentGroup.add(mulch);

  // Minhocas Vermelhas da Califórnia (Eisenia fetida) Perfurando as Camadas
  const wormWiggleGroup = new THREE.Group();
  for (let wm = 0; wm < 8; wm++) {
    const wx = (Math.random() - 0.5) * 4.0;
    const wy = 0.45 + Math.random() * 0.95;
    const wz = (Math.random() - 0.5) * 2.8;
    const pts = [
      new THREE.Vector3(wx, wy, wz),
      new THREE.Vector3(wx + 0.14, wy + 0.08, wz + 0.12),
      new THREE.Vector3(wx + 0.28, wy - 0.05, wz + 0.22),
      new THREE.Vector3(wx + 0.42, wy + 0.03, wz + 0.35)
    ];
    const worm = createEarthworm(pts, 0.022, 0xd9778a, 0xf472b6);
    worm.userData = {
      type: 'wormWiggle',
      baseY: worm.position.y,
      offset: wm * 0.7
    };
    animItems.push(worm);
    wormWiggleGroup.add(worm);
  }
  layerItems.push({ mesh: wormWiggleGroup, baseY: 0, factor: 2.0 });
  currentGroup.add(wormWiggleGroup);

  // Culturas Radiculares e Hortaliças no Topo
  const cropsGroup = new THREE.Group();
  // 4 Alfaces Rizadas
  const vegMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.65, side: THREE.DoubleSide });
  for (let al = -1.6; al <= 1.6; al += 1.05) {
    const letMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 1), vegMat);
    letMesh.position.set(al, 1.88, -0.9);
    cropsGroup.add(letMesh);
  }
  // 5 Cenouras com Folhagem Plumosa e Raiz Laranja Infiltrante
  const carrotTopMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
  const carrotRootMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 });
  for (let cr = -1.8; cr <= 1.8; cr += 0.9) {
    const leafTop = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.45, 8), carrotTopMat);
    leafTop.position.set(cr, 1.95, 0.5);
    cropsGroup.add(leafTop);

    const rootCarrot = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.55, 8), carrotRootMat);
    rootCarrot.rotation.x = Math.PI;
    rootCarrot.position.set(cr, 1.45, 0.5);
    cropsGroup.add(rootCarrot);
  }
  layerItems.push({ mesh: cropsGroup, baseY: 0, factor: 4.8 });
  currentGroup.add(cropsGroup);
}

// =========================================================================
// 4. MODELO BIODIGESTOR ANAERÓBICO (Cúpula Gasométrica e Manômetro)
// =========================================================================
function buildBiodigester() {
  getSharedTextures();

  // Tanque Digestor Translúcido em Polietileno de Alta Densidade (HDPE)
  const tankRadius = 1.75;
  const tankHeight = 2.3;
  const tankGeo = new THREE.CylinderGeometry(tankRadius, tankRadius, tankHeight, 36, 1, false);
  const tankMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    transparent: true,
    opacity: 0.42,
    roughness: 0.22,
    metalness: 0.08
  });
  const tank = new THREE.Mesh(tankGeo, tankMat);
  tank.position.y = 1.15;
  currentGroup.add(tank);

  // Cintas de Reforço em Aço Galvanizado do Tanque
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.35 });
  [0.4, 1.15, 1.9].forEach(y => {
    const strap = new THREE.Mesh(new THREE.TorusGeometry(tankRadius + 0.02, 0.035, 12, 48), ringMat);
    strap.rotation.x = Math.PI / 2;
    strap.position.y = y;
    currentGroup.add(strap);
  });

  // Fundo Cônico de Purga de Minerais
  const bottomCone = new THREE.Mesh(
    new THREE.ConeGeometry(tankRadius * 0.98, 0.45, 32),
    new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.95 })
  );
  bottomCone.rotation.x = Math.PI;
  bottomCone.position.y = 0.22;
  currentGroup.add(bottomCone);

  // Leito Inferior: Lodo Anaeróbico Metanogênico Espesso (Biomassa Escura)
  const sludgeMat = new THREE.MeshStandardMaterial({ color: 0x24160a, roughness: 0.95 });
  const sludge = new THREE.Mesh(new THREE.CylinderGeometry(tankRadius * 0.96, tankRadius * 0.96, 0.9, 32), sludgeMat);
  sludge.position.y = 0.65;
  currentGroup.add(sludge);

  // Camada Intermediária: Biofertilizante Líquido (Digestato Clarificado)
  const liquidMat = new THREE.MeshStandardMaterial({
    color: 0x451a03,
    transparent: true,
    opacity: 0.65,
    roughness: 0.3
  });
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(tankRadius * 0.96, tankRadius * 0.96, 0.75, 32), liquidMat);
  liquid.position.y = 1.48;
  currentGroup.add(liquid);

  // Selo Hidráulico Anelar / Canaleta Superior de Vedação
  const troughGeo = new THREE.TorusGeometry(tankRadius - 0.02, 0.12, 16, 48);
  const troughMesh = new THREE.Mesh(troughGeo, ringMat);
  troughMesh.rotation.x = Math.PI / 2;
  troughMesh.position.y = 2.25;
  currentGroup.add(troughMesh);

  // Gasômetro Flutuante com Cúpula de Metano
  const bellGroup = new THREE.Group();
  const bellRadius = 1.62;
  const bellHeight = 1.45;
  const bellCyl = new THREE.Mesh(
    new THREE.CylinderGeometry(bellRadius, bellRadius, bellHeight, 32, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.65, roughness: 0.28 })
  );
  bellCyl.position.y = 2.05;
  bellGroup.add(bellCyl);

  const domeCap = new THREE.Mesh(
    new THREE.SphereGeometry(bellRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.7, roughness: 0.25 })
  );
  domeCap.position.y = 2.75;
  bellGroup.add(domeCap);

  // Colunas Guia Verticais e Contrapesos de Pressão Constante
  const guideMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.3 });
  const pulleyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.3 });
  for (let g = 0; g < 3; g++) {
    const gang = g * (Math.PI * 2 / 3);
    const gx = Math.cos(gang) * (tankRadius + 0.15);
    const gz = Math.sin(gang) * (tankRadius + 0.15);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 3.8, 12), guideMat);
    post.position.set(gx, 1.9, gz);
    currentGroup.add(post);

    const pulley = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16), pulleyMat);
    pulley.rotation.z = Math.PI / 2;
    pulley.position.set(gx, 3.8, gz);
    currentGroup.add(pulley);

    // Contrapeso de chumbo/ferro fundido
    const counterweight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.55, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.4 })
    );
    counterweight.position.set(gx * 1.08, 2.2, gz * 1.08);
    currentGroup.add(counterweight);
  }

  // Tubo de Carga Inclinado a 45 Graus com Funil Superior
  const pipeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
  const feedChute = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 16), pipeMat);
  feedChute.position.set(-1.8, 1.4, 0);
  feedChute.rotation.z = -Math.PI / 4; // 45 graus estritos
  currentGroup.add(feedChute);

  const hopper = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.14, 0.45, 16), pipeMat);
  hopper.position.set(-2.55, 2.15, 0);
  currentGroup.add(hopper);

  // Sifão de Descarga de Biofertilizante Líquido (Efluente)
  const siphonGroup = new THREE.Group();
  const siph1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.5, 16), pipeMat);
  siph1.position.set(1.95, 1.35, 0);
  siphonGroup.add(siph1);

  const siphOut = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 16), pipeMat);
  siphOut.rotation.z = Math.PI / 2;
  siphOut.position.set(2.15, 2.05, 0);
  siphonGroup.add(siphOut);
  currentGroup.add(siphonGroup);

  // Tubulação Amarela de Biogás e Manômetro Analógico de Pressão em mbar
  const gasLineMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.5, roughness: 0.4 });
  const gasPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.8, 16), gasLineMat);
  gasPipe.position.set(0, 3.8, 0);
  bellGroup.add(gasPipe);

  // Manômetro Analógico com Textura Procedural
  const manoGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.07, 24);
  const manoMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: sharedManometerTex,
    metalness: 0.4,
    roughness: 0.3
  });
  const manometer = new THREE.Mesh(manoGeo, manoMat);
  manometer.rotation.x = Math.PI / 2;
  manometer.position.set(0, 4.25, 0.25);
  bellGroup.add(manometer);

  layerItems.push({ mesh: bellGroup, baseY: 0, factor: 1.8 });
  currentGroup.add(bellGroup);

  // Bolhas de Metano em Ascensão Contínua
  const bubbleGeo = new THREE.SphereGeometry(0.045, 8, 8);
  const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  for (let b = 0; b < 32; b++) {
    const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
    bubble.position.set((Math.random() - 0.5) * 2.8, 0.4 + Math.random() * 1.6, (Math.random() - 0.5) * 2.8);
    bubble.userData = {
      type: 'bubble',
      vy: 0.016 + Math.random() * 0.018,
      minY: 0.45,
      maxY: 2.25
    };
    animItems.push(bubble);
    currentGroup.add(bubble);
  }
}

// =========================================================================
// 5. MODELO VERMICOMPOSTEIRA VERTICAL (Bateria Modular HDPE)
// =========================================================================
function buildVermi() {
  getSharedTextures();

  const binW = 2.6, binH = 0.65, binD = 1.9;
  const hdpeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.52, metalness: 0.1 });
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.2 });

  function createHDPEBin(hasFloorPerforations) {
    const binGroup = new THREE.Group();

    // Paredes e Estrutura Principal
    const mainBox = new THREE.Mesh(new THREE.BoxGeometry(binW, binH, binD), hdpeMat);
    mainBox.castShadow = true;
    mainBox.receiveShadow = true;
    binGroup.add(mainBox);

    // Alças Ergonômicas Laterais
    [-1, 1].forEach(side => {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.45), handleMat);
      handle.position.set(side * (binW / 2 + 0.04), 0.1, 0);
      binGroup.add(handle);
    });

    // Furo e Grade de Migração no Fundo Perfurado
    if (hasFloorPerforations) {
      const perfGroup = new THREE.Group();
      const holeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      for (let hx = -1.0; hx <= 1.0; hx += 0.4) {
        for (let hz = -0.7; hz <= 0.7; hz += 0.35) {
          const hole = new THREE.Mesh(new THREE.CircleGeometry(0.045, 12), holeMat);
          hole.rotation.x = -Math.PI / 2;
          hole.position.set(hx, -binH / 2 + 0.005, hz);
          perfGroup.add(hole);
        }
      }
      binGroup.add(perfGroup);
    }
    return binGroup;
  }

  // Caixa 1 (Fundo): Caixa Coletora de Chorume (Lixiviado / Biofertilizante)
  const b1 = createHDPEBin(false);
  b1.position.y = 0.45;
  currentGroup.add(b1);

  // Torneira de Latão para Extração de Chorume
  const tapBrassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.25 });
  const tapSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.28, 16), tapBrassMat);
  tapSpout.rotation.x = Math.PI / 2;
  tapSpout.position.set(0, 0.28, binD / 2 + 0.14);
  currentGroup.add(tapSpout);

  const tapHandle = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.14, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 })
  );
  tapHandle.position.set(0, 0.38, binD / 2 + 0.14);
  currentGroup.add(tapHandle);

  // Caixa 2 (Intermediária): Digestão Ativa e Húmus Maduro
  const b2 = createHDPEBin(true);
  b2.position.y = 1.22;
  layerItems.push({ mesh: b2, baseY: 1.22, factor: 1.2 });
  currentGroup.add(b2);

  // Caixa 3 (Superior): Alimentação Recente (Restos Orgânicos e Cama Fresca)
  const b3 = createHDPEBin(true);
  b3.position.y = 1.98;
  layerItems.push({ mesh: b3, baseY: 1.98, factor: 2.4 });
  currentGroup.add(b3);

  // Minhocas Vermelhas da Califórnia (Eisenia fetida) em Migração Ativa pelos Furos
  const wormColony = new THREE.Group();
  for (let w = 0; w < 16; w++) {
    const wx = (Math.random() - 0.5) * 2.1;
    const wy = 1.1 + Math.random() * 0.95;
    const wz = (Math.random() - 0.5) * 1.5;
    const pts = [
      new THREE.Vector3(wx, wy, wz),
      new THREE.Vector3(wx + 0.12, wy + 0.07, wz + 0.08),
      new THREE.Vector3(wx + 0.24, wy - 0.04, wz + 0.18),
      new THREE.Vector3(wx + 0.36, wy + 0.02, wz + 0.28)
    ];
    const worm = createEarthworm(pts, 0.024, 0xb91c1c, 0xf87171);
    worm.userData = {
      type: 'wormWiggle',
      baseY: worm.position.y,
      offset: w * 0.5
    };
    animItems.push(worm);
    wormColony.add(worm);
  }
  layerItems.push({ mesh: wormColony, baseY: 0, factor: 2.2 });
  currentGroup.add(wormColony);

  // Tampa Vented Ventilada com Encaixe e Nervuras
  const lidGroup = new THREE.Group();
  const lid = new THREE.Mesh(
    new THREE.BoxGeometry(binW + 0.1, 0.12, binD + 0.1),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 })
  );
  lidGroup.add(lid);

  // Puxador central e aletas de ventilação
  const lidHandle = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.08), handleMat);
  lidHandle.position.y = 0.09;
  lidGroup.add(lidHandle);

  lidGroup.position.y = 2.42;
  layerItems.push({ mesh: lidGroup, baseY: 2.42, factor: 3.4 });
  currentGroup.add(lidGroup);
}

// =========================================================================
// 6. MODELO REATOR BSFL (Hermetia illucens // Larvas de Mosca Soldado Negro)
// =========================================================================
function buildBSFL() {
  getSharedTextures();

  // Caixa de Bioconversão em Polímero Estrutural Resistente
  const binMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.55 });
  const bin = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.85, 2.2), binMat);
  bin.position.y = 0.6;
  bin.castShadow = true;
  bin.receiveShadow = true;
  currentGroup.add(bin);

  // Leito Orgânico de Alimentação com Resíduos e Frass
  const feedBedMat = new THREE.MeshStandardMaterial({ color: 0x271f16, roughness: 0.95 });
  const feedBed = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.4, 2.05), feedBedMat);
  feedBed.position.set(-0.55, 0.68, 0);
  currentGroup.add(feedBed);

  // Suporte de Postura de Ovos (Madeira Canelada / Papelão Microondulado)
  const eggAssemblyGroup = new THREE.Group();
  const eggSupportMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.7 });
  const eggFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.6), eggSupportMat);
  eggAssemblyGroup.add(eggFrame);

  // Cachos de Ovos Cremosos de Hermetia illucens
  const eggClusterMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 });
  for (let e = -0.4; e <= 0.4; e += 0.2) {
    const cluster = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eggClusterMat);
    cluster.scale.set(1.4, 0.7, 1.0);
    cluster.position.set(e, -0.05, 0);
    eggAssemblyGroup.add(cluster);
  }
  eggAssemblyGroup.position.set(-0.6, 1.25, 0);
  layerItems.push({ mesh: eggAssemblyGroup, baseY: 1.25, factor: 2.2 });
  currentGroup.add(eggAssemblyGroup);

  // Rampa de Autocolheita Angular em Exatos 35 Graus (Ótimo Biológico de Fuga)
  // 35 graus = 35 * Math.PI / 180 = ~0.6108 rad
  const rampAng = (35 * Math.PI) / 180;
  const rampLength = 1.85;
  const rampGroup = new THREE.Group();

  const rampMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.35,
    roughness: 0.45,
    side: THREE.DoubleSide
  });
  const rampPlane = new THREE.Mesh(new THREE.BoxGeometry(rampLength, 0.04, 2.05), rampMat);
  rampPlane.rotation.z = -rampAng;
  rampPlane.position.set(1.15, 1.15, 0);
  rampGroup.add(rampPlane);

  // Canaletas Antiderrapantes / Estrias de Tração para Subida das Pré-Pupas
  const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3 });
  for (let r = -0.7; r <= 0.7; r += 0.15) {
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.02, 2.0), ridgeMat);
    ridge.position.set(r, 0.025, 0);
    rampPlane.add(ridge);
  }
  layerItems.push({ mesh: rampGroup, baseY: 0, factor: 0.8 });
  currentGroup.add(rampGroup);

  // Balde Coletor de Autocolheita de Pré-Pupas no Topo da Rampa
  const bucketGroup = new THREE.Group();
  const bucketMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.2, roughness: 0.35 });
  const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.30, 0.65, 24), bucketMat);
  bucket.position.set(2.25, 0.72, 0);
  bucketGroup.add(bucket);

  const bucketRim = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.025, 12, 24), bucketMat);
  bucketRim.rotation.x = Math.PI / 2;
  bucketRim.position.set(2.25, 1.05, 0);
  bucketGroup.add(bucketRim);

  layerItems.push({ mesh: bucketGroup, baseY: 0, factor: 1.4 });
  currentGroup.add(bucketGroup);

  // Larvas em Fase Voraz Alimentar (Creme Claro)
  const larvaMat = new THREE.MeshStandardMaterial({ color: 0xf5eedc, roughness: 0.45 });
  for (let l = 0; l < 35; l++) {
    const larva = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.15, 8), larvaMat);
    larva.rotation.z = Math.PI / 2 + (Math.random() - 0.5) * 0.4;
    larva.position.set(-1.4 + Math.random() * 1.6, 0.88, (Math.random() - 0.5) * 1.8);
    larva.userData = {
      type: 'larvaWiggle',
      baseX: larva.position.x,
      baseZ: larva.position.z,
      wiggleOffset: Math.random() * Math.PI * 2
    };
    animItems.push(larva);
    currentGroup.add(larva);
  }

  // Pré-Pupas Escurecidas (Fototaxia Negativa) Rastejando na Rampa de 35°
  const pupaeMat = new THREE.MeshStandardMaterial({ color: 0x271c19, roughness: 0.35 });
  for (let p = 0; p < 18; p++) {
    const pupae = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.16, 8), pupaeMat);
    const progress = Math.random();
    const px = 0.4 + progress * 1.45;
    const py = 0.65 + Math.tan(rampAng) * (px - 0.4);
    pupae.position.set(px, py + 0.04, (Math.random() - 0.5) * 1.8);
    pupae.rotation.z = -rampAng;
    pupae.userData = {
      type: 'pupaeCrawl',
      rampProgress: progress,
      zPos: pupae.position.z
    };
    animItems.push(pupae);
    currentGroup.add(pupae);
  }
}

// =========================================================================
// CONTROLES DE INTERATIVIDADE, CÂMERA E RENDER LOOP
// =========================================================================

function handleExplode(val) {
  const factor = val / 100;
  layerItems.forEach(item => {
    if (item && item.mesh) {
      item.mesh.position.y = item.baseY + (factor * item.factor);
    }
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

function toggleLights() {
  if (typeof window._isViewerLightsOn === 'undefined') window._isViewerLightsOn = true;
  window._isViewerLightsOn = !window._isViewerLightsOn;
  const on = window._isViewerLightsOn;
  if (window._viewerAmbient) window._viewerAmbient.intensity = on ? 0.85 : 0.18;
  if (window._viewerKeyLight) window._viewerKeyLight.intensity = on ? 1.25 : 0.20;
  if (window._viewerFillLight) window._viewerFillLight.intensity = on ? 0.55 : 0.05;
  const btn = document.getElementById('btn-lights');
  if (btn) {
    btn.classList.toggle('active', on);
    btn.innerHTML = on ? 'Luzes: ON' : 'Luzes: OFF';
  }
}

window.onManualCamChange = function() {
  isUserScrubbingCam = true;
  const sx = document.getElementById('cam-x');
  const sy = document.getElementById('cam-y');
  const sz = document.getElementById('cam-z');
  if (!sx || !sy || !sz) return;
  const x = parseFloat(sx.value);
  const y = parseFloat(sy.value);
  const z = parseFloat(sz.value);

  camera.position.set(x, y, z);
  updateCamUI(x, y, z);
  controls.update();
  setTimeout(() => { isUserScrubbingCam = false; }, 350);
};

function updateCamUI(x, y, z) {
  const sx = document.getElementById('cam-x');
  const sy = document.getElementById('cam-y');
  const sz = document.getElementById('cam-z');
  const vx = document.getElementById('val-cam-x');
  const vy = document.getElementById('val-cam-y');
  const vz = document.getElementById('val-cam-z');
  const readout = document.getElementById('cam-readout');

  if (vx) vx.textContent = x.toFixed(1) + 'm';
  if (vy) vy.textContent = y.toFixed(1) + 'm';
  if (vz) vz.textContent = z.toFixed(1) + 'm';
  if (readout) readout.textContent = `X: ${x.toFixed(1)}m | Y: ${y.toFixed(1)}m | Z: ${z.toFixed(1)}m`;

  if (!isUserScrubbingCam) {
    if (sx && document.activeElement !== sx) sx.value = x.toFixed(1);
    if (sy && document.activeElement !== sy) sy.value = y.toFixed(1);
    if (sz && document.activeElement !== sz) sz.value = z.toFixed(1);
  }
}

window.setCamView = function(viewType) {
  if (viewType === 'top') {
    camera.position.set(0, 14, 0.01);
    controls.target.set(0, 1.1, 0);
  } else if (viewType === 'iso') {
    camera.position.set(7, 5.5, 8.5);
    controls.target.set(0, 1.1, 0);
  } else if (viewType === 'front') {
    camera.position.set(0, 2.5, 10);
    controls.target.set(0, 1.1, 0);
  }
  controls.update();
  updateCamUI(camera.position.x, camera.position.y, camera.position.z);
};

function resetCam() {
  camera.position.set(7, 5.5, 8.5);
  controls.target.set(0, 1.1, 0);
  controls.update();
  updateCamUI(7, 5.5, 8.5);
}

// LOOP CINEMÁTICO DE ANIMAÇÃO E FÍSICA
function renderLoop() {
  requestAnimationFrame(renderLoop);

  if (isRotating && currentGroup) {
    currentGroup.rotation.y += 0.003;
  }

  const time = performance.now() * 0.001;

  // Atualização dos Itens Animados Específicos
  animItems.forEach(item => {
    if (!item.userData) return;

    // 1. Partículas de Umidade / Capilaridade Hügelkultur
    if (item.userData.type === 'moisture') {
      item.position.y += item.userData.vy;
      if (item.position.y > item.userData.maxY) {
        item.position.y = item.userData.baseY;
      }
    }
    // 2. Chamas em Vórtice Kon-Tiki
    else if (item.userData.type === 'vortexFlame') {
      item.userData.angle += 0.035;
      item.position.x = Math.cos(item.userData.angle) * item.userData.baseRad;
      item.position.z = Math.sin(item.userData.angle) * item.userData.baseRad;
      item.scale.y = 0.85 + Math.sin(time * 8 + item.userData.angle) * 0.35;
    }
    // 3. Pulsação de Brasa Kon-Tiki
    else if (item.userData.type === 'emberPulse' && item.material) {
      item.material.emissiveIntensity = item.userData.baseEmissive + Math.sin(time * 3.5) * 0.25;
    }
    // 4. Bolhas de Metano do Biodigestor
    else if (item.userData.type === 'bubble') {
      item.position.y += item.userData.vy;
      if (item.position.y > item.userData.maxY) {
        item.position.y = item.userData.minY;
      }
    }
    // 5. Larvas Vorazes BSFL (Wiggle senoidal)
    else if (item.userData.type === 'larvaWiggle') {
      item.position.x = item.userData.baseX + Math.sin(time * 12 + item.userData.wiggleOffset) * 0.025;
      item.position.z = item.userData.baseZ + Math.cos(time * 10 + item.userData.wiggleOffset) * 0.025;
    }
    // 6. Minhocas Eisenia fetida (Wiggle suave nos estratos)
    else if (item.userData.type === 'wormWiggle') {
      item.position.y = item.userData.baseY + Math.sin(time * 3 + item.userData.offset) * 0.015;
    }
    // 7. Pré-Pupas Rastejando na Rampa de 35°
    else if (item.userData.type === 'pupaeCrawl') {
      item.userData.rampProgress += 0.0035;
      if (item.userData.rampProgress > 1.0) item.userData.rampProgress = 0.0;
      const prog = item.userData.rampProgress;
      const rampAng = (35 * Math.PI) / 180;
      const px = 0.4 + prog * 1.45;
      const py = 0.65 + Math.tan(rampAng) * (px - 0.4);
      item.position.set(px, py + 0.04, item.userData.zPos);
    }
  });

  if (controls) controls.update();
  updateCamUI(camera.position.x, camera.position.y, camera.position.z);
  if (renderer && scene && camera) renderer.render(scene, camera);
}

// Exportações Globais para Compatibilidade com a UI do Artigo e Testes
window.scene = scene;
window.camera = camera;
window.renderer = renderer;
window.controls = controls;
window.currentGroup = currentGroup;
window.animItems = animItems;
window.layerItems = layerItems;
window.initViewer3D = initViewer3D;
window.switch3D = switch3D;
window.handleExplode = handleExplode;
window.toggleRot = toggleRot;
window.toggleWire = toggleWire;
window.toggleLights = toggleLights;
window.resetCam = resetCam;
window.setCamView = setCamView;
window.onManualCamChange = onManualCamChange;

window.addEventListener('DOMContentLoaded', initViewer3D);
