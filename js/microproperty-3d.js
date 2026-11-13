/**
 * Advanced Research Projects // Simulador 3D Master Plan & Residência Bioclimática
 * Engenharia 100% Procedural em Three.js — Zero Dependências Externas
 * Estilo Visual: KIMI 3D Make // Architectural Blueprint Blue & White (#1953d4)
 * Escala Real: Lote 10,00 m × 31,25 m (312,50 m²) // Residência 60,00 m²
 *
 * Atualização:
 * - Interiores completamente remodelados como casa habitada de alto padrão
 * - Eliminação total de blocos amarelos, torres pretas e sobreposições
 * - Portas ajustadas rentes às paredes com circulação 100% desimpedida
 * - Modelagem botânica procedural rica (interiores, horta, microverdes e SAF)
 * - Modo Jogo FP com física, colisão por deslizamento, pulo e HUD de telemetria
 */

(function () {
  'use strict';

  // Variáveis Globais de Cena
  let scene, camera, renderer, controls;
  let masterGroup = new THREE.Group();
  let houseGroup = new THREE.Group();
  let cutWallsGroup = new THREE.Group();
  let fullWallsGroup = new THREE.Group();
  let roofGroup = new THREE.Group();
  let hardscapeGroup = new THREE.Group();
  let plantsGroup = new THREE.Group();
  let animParticles = [];
  let zoneHighlights = {};

  let currentTarget = { x: 0, y: 1.2, z: 15.6 };
  let cameraTargetPos = { x: 18, y: 22, z: 36 };
  let isRotating = false;
  let isWire = false;
  let showRoof = false;
  let isWallFull = false;
  let isLightsOn = true;
  let housePointLights = [];
  let ambientLightObj = null;
  let sunLightObj = null;
  let activeSector = 'all';
  let isUserScrubbingCam = false;

  // Variáveis Avançadas do Modo Jogo FP (Cinemática Suave e Câmera Dinâmica)
  let isFPMode = false;
  let fpPos = new THREE.Vector3(0, 1.68, -1.2);
  let fpBaseY = 0.0;
  let fpVelX = 0.0;
  let fpVelZ = 0.0;
  let fpVelY = 0.0;
  let fpTargetYaw = 0.0;
  let fpYaw = 0.0;
  let fpTargetPitch = -0.05;
  let fpPitch = -0.05;
  let fpCurrentHeight = 1.68;
  let fpTargetHeight = 1.68;
  let fpCurrentFov = 75;
  let fpTargetFov = 75;
  let bobCycle = 0.0;
  let bobOffsetY = 0.0;
  let bobOffsetX = 0.0;
  let bobTiltZ = 0.0;
  let strafeRoll = 0.0;
  let isOnGround = true;
  let isPointerLocked = false;
  let fpWallBoxes = [];
  let lastFrameTime = performance.now();
  let isMouseDownDrag = false;
  let lastMouseX = 0, lastMouseY = 0;

  const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false,
    crouch: false
  };

  // Telemetria dos Setores Bioclimáticos
  const SECTOR_DATA = {
    all: {
      title: "00 // MASTER PLAN GERAL (LOTE 312,50 m²)",
      desc: "Zoneamento integral do lote 10,00 × 31,25 m em Viamão/RS (clima Cfa). Frente Norte → Fundos Sul.",
      camPos: { x: 18, y: 22, z: 36 },
      lookAt: { x: 0, y: 1.2, z: 15.6 },
      badge: "LOTE 312,50 m² // CAPEX R$ 38.400 // RECEITA R$ 25.565/MÊS // LÍQUIDO R$ 22.135/MÊS",
      meta: "Zona 0 (Residência & Agroindústria 60 m²) + Zona 1 (Horta 150 m²) + Zona 2 (SAF 80 m²)"
    },
    casa: {
      title: "01 // RESIDÊNCIA BIOCLIMÁTICA HABITADA (60 m²)",
      desc: "Casa completa com 3 dormitórios, estar/jantar, BWC, cozinha Selo Arte e oficina técnica 100% procedurais.",
      camPos: { x: 0, y: 14.0, z: 4.0 },
      lookAt: { x: -1.25, y: 0.8, z: 4.0 },
      badge: "ZONA 0: 60 m² // CONFORTO TÉRMICO PASSIVO // DESIMPEDIMENTO SOLAR 36° NO INVERNO",
      meta: "Quarto 1 (8,96 m²), Quarto 2 (8,32 m²), Quarto 3 (8,32 m²), Sala (11,7 m²), Cozinha (10,9 m²), BWC (4,7 m²)."
    },
    oficina: {
      title: "02 // OFICINA TÉCNICA & MANUTENÇÃO BIOMECÂNICA (7 m²)",
      desc: "Espaço técnico frontal (2,50 × 2,80 m) com bancada pesada de marcenaria, morsa de ferro fundido e painel de ferramentas.",
      camPos: { x: 3.8, y: 3.5, z: 1.4 },
      lookAt: { x: 1.25, y: 0.9, z: 1.4 },
      badge: "BANCADA PESADA // MORSA MECÂNICA // INVERSORES & PAINEL DE FERRAMENTAS",
      meta: "Área de 7,0 m² com janela frontal para iluminação natural e porta técnica independente."
    },
    cisternas: {
      title: "03 // RESERVATÓRIOS & CAPTAÇÃO PLUVIAL (6.000 L)",
      desc: "Bateria de 3 cisternas verticais de 2.020 L cada (total 6.060 L) com barrilete PVC, drenos e captação pluvial 100%.",
      camPos: { x: 7.0, y: 4.8, z: 2.0 },
      lookAt: { x: 3.75, y: 1.2, z: 1.8 },
      badge: "CAPACIDADE: 6.060 L // CAPTAÇÃO ANUAL 180.000 L // AUTONOMIA HÍDRICA TOTAL",
      meta: "3 tanques de polietileno azul interligados por barrilete de PVC e filtro de descarte."
    },
    estufa: {
      title: "04 // ESTUFA DE MICROVERDES & BROTOS (8 m²)",
      desc: "Módulo vertical em alumínio estrutural e vidro (2,00 × 4,00 m) com 4 níveis de bancadas e iluminação LED fotossintética.",
      camPos: { x: 6.8, y: 4.5, z: 5.2 },
      lookAt: { x: 3.75, y: 1.1, z: 5.2 },
      badge: "PRODUÇÃO: 2.500 BANDEJAS/MÊS // TICKET B2B R$ 140/KG // RECEITA R$ 5.125/MÊS",
      meta: "Bancadas verticais de germinação: rabanete, mostarda, agrião e flores comestíveis."
    },
    horta: {
      title: "05 // ZONA 1: 12 CANTEIROS BIOINTENSIVOS & TÚNEIS BAIXOS (150 m²)",
      desc: "12 canteiros de 1,20 × 4,00 m protegidos por microtúneis anti-geada com hortaliças 3D ricas e 4 colmeias sem ferrão.",
      camPos: { x: 10.5, y: 10.5, z: 16.0 },
      lookAt: { x: 0, y: 0.8, z: 15.5 },
      badge: "150 m² DE CULTIVO // 12 CANTEIROS ELEVADOS // 4 COLMEIAS JATAÍ/MANDAÇAIA",
      meta: "Solo corrigido com pó de basalto e compostagem termofílica, drenagem profunda e aeração contínua."
    },
    saf: {
      title: "06 // ZONA 2: SAF SINTRÓPICO QUEBRA-VENTO MINUANO (80 m²)",
      desc: "Barreira quebra-vento no fundo Sul contra ventos polares, com estratos de Pecã, Citros e Café sombreado com baunilha.",
      camPos: { x: 9.5, y: 7.5, z: 27.5 },
      lookAt: { x: 0, y: 1.5, z: 27.2 },
      badge: "80 m² DE BIOMASSA // BARREIRA EÓLICA SUL // MADEIRA NOBRE & CITROS",
      meta: "Estratos emergente, alto, médio e baixo em consórcio sucessional acelerado."
    }
  };

  // =========================================================================
  // INICIALIZAÇÃO THREE.JS
  // =========================================================================
  function initMicroproperty3D() {
    const container = document.querySelector('.viewport-3d');
    const canvas = document.getElementById('canvas3d-article');
    if (!container || !canvas) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1953d4);
    scene.fog = new THREE.FogExp2(0x1953d4, 0.009);

    camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.15, 260);
    camera.position.set(cameraTargetPos.x, cameraTargetPos.y, cameraTargetPos.z);
    window.camera = camera;

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    window.controls = controls;
    window.scene = scene;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 1.8;
    controls.maxDistance = 80;
    controls.target.set(currentTarget.x, currentTarget.y, currentTarget.z);

    controls.addEventListener('start', () => {
      if (isFPMode) return;
      isUserScrubbingCam = false;
      cameraTargetPos.x = camera.position.x;
      cameraTargetPos.y = camera.position.y;
      cameraTargetPos.z = camera.position.z;
      currentTarget.x = controls.target.x;
      currentTarget.y = controls.target.y;
      currentTarget.z = controls.target.z;
    });

    controls.addEventListener('change', () => {
      if (isFPMode) return;
      if (!isUserScrubbingCam) {
        cameraTargetPos.x = camera.position.x;
        cameraTargetPos.y = camera.position.y;
        cameraTargetPos.z = camera.position.z;
        currentTarget.x = controls.target.x;
        currentTarget.y = controls.target.y;
        currentTarget.z = controls.target.z;
        updateCamUI(camera.position.x, camera.position.y, camera.position.z);
      }
    });

    // Luzes Técnicas de Estilo Blueprint Arquitetônico
    const ambient = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambient);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    sunLightObj = sunLight;
    sunLight.position.set(16, 32, 16);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 90;
    sunLight.shadow.camera.left = -22;
    sunLight.shadow.camera.right = 22;
    sunLight.shadow.camera.top = 38;
    sunLight.shadow.camera.bottom = -15;
    scene.add(sunLight);

    const fillWhite = new THREE.DirectionalLight(0xffffff, 0.6);
    fillWhite.position.set(-20, 15, -15);
    scene.add(fillWhite);

    // Iluminação interior quente para efeito de casa habitada
    const intLights = [
      { x: -0.8, y: 2.3, z: 1.8, color: 0xffedd5, int: 0.9, dist: 9 }, // Sala
      { x: 0.35, y: 2.3, z: 6.4, color: 0xffedd5, int: 0.9, dist: 9 }, // Cozinha
      { x: -3.4, y: 2.3, z: 1.4, color: 0xfef3c7, int: 0.8, dist: 8 }, // Quarto 1
      { x: -3.4, y: 2.3, z: 4.1, color: 0xfef3c7, int: 0.7, dist: 7 }, // Quarto 2
      { x: -3.4, y: 2.3, z: 6.7, color: 0xfef3c7, int: 0.7, dist: 7 }, // Quarto 3
      { x: 1.5,  y: 2.3, z: 3.8, color: 0xffffff, int: 0.8, dist: 6 }, // BWC
      { x: 1.25, y: 2.3, z: 1.4, color: 0xffffff, int: 0.8, dist: 7 }  // Oficina
    ];
    intLights.forEach(l => {
      const p = new THREE.PointLight(l.color, l.int, l.dist);
      p.position.set(l.x, l.y, l.z);
      houseGroup.add(p);
    });

    // Grid técnico blueprint
    const grid = new THREE.GridHelper(50, 50, 0xffffff, 0x5a91f5);
    grid.position.set(0, -0.01, 15.625);
    scene.add(grid);

    scene.add(masterGroup);
    masterGroup.add(hardscapeGroup);
    masterGroup.add(houseGroup);
    masterGroup.add(plantsGroup);
    masterGroup.add(roofGroup);

    houseGroup.add(cutWallsGroup);
    houseGroup.add(fullWallsGroup);
    fullWallsGroup.visible = false; // Inicia em modo corte

    zoneHighlights['casa'] = houseGroup;

    buildMasterPlanLayout();
    setupFPEventListeners(canvas);

    window.addEventListener('resize', onResize);
    lastFrameTime = performance.now();
    requestAnimationFrame(renderLoop);

    selectSector('all');
  }

  function onResize() {
    const container = document.querySelector('.viewport-3d');
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  // =========================================================================
  // MODELAGEM PROCEDURAL DO MASTER PLAN E DA RESIDÊNCIA
  // =========================================================================
  function buildMasterPlanLayout() {
    // 1. TERRENO BASE DO LOTE (10,00 × 31,25 m = 312,50 m²)
    const groundGeo = new THREE.BoxGeometry(10.0, 0.2, 31.25);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.set(0, -0.1, 15.625);
    ground.receiveShadow = true;
    masterGroup.add(ground);

    const borderEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(groundGeo),
      new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
    );
    borderEdges.position.copy(ground.position);
    masterGroup.add(borderEdges);

    buildLotHardscape();
    buildProceduralFloors();
    buildProceduralWalls();
    buildProceduralDoorsAndWindows();
    buildProceduralFurniture();
    buildCisternas();
    buildEstufaMicroverdes();
    buildAquaponiaRAS();
    buildHortaBiointensiva();
    buildSAFQuebraVento();
    buildTelhadoSolar();
  }

  // URBANISMO EXTERNO E ACESSOS
  function buildLotHardscape() {
    // Rua Camélia (Norte)
    const street = new THREE.Mesh(
      new THREE.BoxGeometry(12.0, 0.12, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
    );
    street.position.set(0, -0.06, -1.5);
    street.receiveShadow = true;
    hardscapeGroup.add(street);

    // Linha divisória da rua
    const streetLine = new THREE.Mesh(
      new THREE.BoxGeometry(12.0, 0.02, 0.12),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    streetLine.position.set(0, 0.005, -1.5);
    hardscapeGroup.add(streetLine);

    // Calçada frontal
    const sidewalk = new THREE.Mesh(
      new THREE.BoxGeometry(10.0, 0.16, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 })
    );
    sidewalk.position.set(0, -0.02, -0.45);
    sidewalk.receiveShadow = true;
    hardscapeGroup.add(sidewalk);

    // Mureta técnica de fachada
    const wallFrontL = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.85, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
    );
    wallFrontL.position.set(-3.0, 0.425, -0.1);
    const wallFrontR = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.85, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
    );
    wallFrontR.position.set(3.1, 0.425, -0.1);
    hardscapeGroup.add(wallFrontL, wallFrontR);

    // Portão de pedestres vazado em alumínio branco
    const gateP = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(0.95, 0.95, 0.04)),
      new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
    );
    gateP.position.set(-0.5, 0.475, -0.1);
    hardscapeGroup.add(gateP);

    // Caminhos de circulação permeável
    const pathMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    
    // Entrada frontal
    const pathEntry = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.8), pathMat);
    pathEntry.position.set(-0.5, 0.02, -0.25);
    hardscapeGroup.add(pathEntry);

    // Corredor leste (cisternas e estufa)
    const pathEast = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.03, 11.0), pathMat);
    pathEast.position.set(3.75, 0.015, 5.5);
    hardscapeGroup.add(pathEast);

    // Espinha central da horta
    const pathSpine = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.03, 15.5), pathMat);
    pathSpine.position.set(0, 0.015, 15.75);
    hardscapeGroup.add(pathSpine);

    // Acesso ao SAF
    const pathSAF = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.03, 7.0), pathMat);
    pathSAF.position.set(0, 0.015, 27.0);
    hardscapeGroup.add(pathSAF);
  }

  // PISOS PROCEDURAIS POR CÔMODO
  function buildProceduralFloors() {
    const woodFloorMat = new THREE.MeshStandardMaterial({ color: 0xba9a79, roughness: 0.45 }); // Freijó aconchegante
    const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });   // Porcelanato branco
    const epoxyMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3 });     // Epóxi sanitário
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });  // Concreto técnico

    // Quartos (madeira)
    const floorQ1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.05, 2.8), woodFloorMat);
    floorQ1.position.set(-3.4, 0.025, 1.4);
    const floorQ2 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.05, 2.6), woodFloorMat);
    floorQ2.position.set(-3.4, 0.025, 4.1);
    const floorQ3 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.05, 2.6), woodFloorMat);
    floorQ3.position.set(-3.4, 0.025, 6.7);

    // Sala de Estar e Jantar (madeira) - Z in [0.0, 2.8], X in [-1.8, 0.0]
    const floorSala = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 2.8), woodFloorMat);
    floorSala.position.set(-0.90, 0.025, 1.40);

    // Corredor de Distribuição (madeira) - Z in [2.8, 4.8], X in [-1.8, 0.5]
    const floorCorredor = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.05, 2.0), woodFloorMat);
    floorCorredor.position.set(-0.65, 0.025, 3.80);

    // BWC (porcelanato)
    const floorBWC = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 2.0), ceramicMat);
    floorBWC.position.set(1.5, 0.025, 3.8);

    // Cozinha (epóxi sanitário)
    const floorCoz = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.05, 3.2), epoxyMat);
    floorCoz.position.set(0.35, 0.025, 6.4);

    // Oficina (concreto)
    const floorOficina = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.05, 2.8), concreteMat);
    floorOficina.position.set(1.25, 0.025, 1.4);

    houseGroup.add(floorQ1, floorQ2, floorQ3, floorSala, floorCorredor, floorBWC, floorCoz, floorOficina);
  }

  // PAREDES PROCEDURAIS (Corte 1.40m e Completa 2.65m)
  function buildProceduralWalls() {
    const wallWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.2 });
    const fullWallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });

    const wallSpecs = [
      // Paredes Externas Norte (Z = 0):
      // Fachada Q1 com vão para Janela 5 (X in [-3.5, -2.1], w=1.4):
      { x: -4.25, z: 0.0, w: 1.5, d: 0.15 },
      { x: -1.95, z: 0.0, w: 0.3, d: 0.15 },
      { x: -1.40, z: 0.0, w: 0.8, d: 0.15 },
      // Vão porta principal: X in [-0.9, -0.1]
      // Fachada Oficina Norte com vão para Janela 4 (X in [0.55, 1.95], w=1.4):
      { x: 0.275, z: 0.0, w: 0.55, d: 0.15 },
      { x: 2.225, z: 0.0, w: 0.55, d: 0.15 },

      // Paredes Externas Oeste (X = -5.0):
      { x: -5.0, z: 0.40, w: 0.15, d: 0.8 },
      { x: -5.0, z: 2.75, w: 0.15, d: 1.5 },
      { x: -5.0, z: 5.40, w: 0.15, d: 1.4 },
      { x: -5.0, z: 7.65, w: 0.15, d: 0.7 },

      // Paredes Externas Sul (Z = 8.0):
      { x: -3.40, z: 8.0, w: 3.2, d: 0.15 },
      { x: -1.40, z: 8.0, w: 0.8, d: 0.15 },
      // Vão porta fundos: X in [-0.9, -0.1]
      // Fachada Cozinha Sul com vão para Janela 6 (X in [0.55, 1.95], w=1.4):
      { x: 0.275, z: 8.0, w: 0.55, d: 0.15 },
      { x: 2.225, z: 8.0, w: 0.55, d: 0.15 },

      // Paredes Externas Leste (X = 2.5):
      { x: 2.5, z: 1.4, w: 0.15, d: 2.8 },
      { x: 2.5, z: 5.4, w: 0.15, d: 5.2 },

      // Divisórias Internas:
      // Longitudinal Central (X = -1.8):
      { x: -1.8, z: 0.6, w: 0.15, d: 1.2 },
      { x: -1.8, z: 2.65, w: 0.15, d: 0.7 },
      { x: -1.8, z: 4.65, w: 0.15, d: 1.3 },
      { x: -1.8, z: 7.35, w: 0.15, d: 1.3 },

      // Transversais dos Quartos:
      { x: -3.4, z: 2.8, w: 3.2, d: 0.15 },
      { x: -3.4, z: 5.4, w: 3.2, d: 0.15 },

      // Divisória Oficina e Sala (X = 0.0):
      { x: 0.0, z: 0.95, w: 0.15, d: 1.9 }, // vão da porta em Z in [1.9, 2.7]

      // Divisórias do BWC:
      { x: 1.25, z: 2.8, w: 2.5, d: 0.15 },
      { x: 1.5, z: 4.8, w: 2.0, d: 0.15 },
      { x: 0.5, z: 4.25, w: 0.15, d: 1.1 }  // vão da porta em Z in [2.9, 3.7]
    ];

    fpWallBoxes = [];

    wallSpecs.forEach(spec => {
      // 1. Versão Corte (1.40 m)
      const cutH = 1.40;
      const cutWall = new THREE.Mesh(new THREE.BoxGeometry(spec.w, cutH, spec.d), wallWhiteMat);
      cutWall.position.set(spec.x, cutH / 2 + 0.02, spec.z);
      cutWall.castShadow = true;
      cutWall.receiveShadow = true;

      const cap = new THREE.Mesh(new THREE.BoxGeometry(spec.w + 0.02, 0.03, spec.d + 0.02), capMat);
      cap.position.set(spec.x, cutH + 0.035, spec.z);
      cutWallsGroup.add(cutWall, cap);

      // 2. Versão Parede Alta (2.65 m)
      const fullH = 2.65;
      const fullWall = new THREE.Mesh(new THREE.BoxGeometry(spec.w, fullH, spec.d), fullWallMat);
      fullWall.position.set(spec.x, fullH / 2 + 0.02, spec.z);
      fullWall.castShadow = true;
      fullWall.receiveShadow = true;
      fullWallsGroup.add(fullWall);

      fpWallBoxes.push({
        minX: spec.x - spec.w / 2,
        maxX: spec.x + spec.w / 2,
        minZ: spec.z - spec.d / 2,
        maxZ: spec.z + spec.d / 2
      });
    });

    // Vergas superiores para o modo Parede Alta (cobertura 100% dos vãos de portas)
    const lintelSpecs = [
      { x: -0.5, z: 0.0,  w: 1.00, d: 0.15 }, // Porta Norte (vão X in [-1.0, 0.0])
      { x: -0.5, z: 8.0,  w: 1.00, d: 0.15 }, // Porta Sul (vão X in [-1.0, 0.0])
      { x: -1.8, z: 1.75, w: 0.15, d: 1.10 }, // Porta Q1 (vão Z in [1.20, 2.30])
      { x: -1.8, z: 3.50, w: 0.15, d: 1.00 }, // Porta Q2 (vão Z in [3.00, 4.00])
      { x: -1.8, z: 6.00, w: 0.15, d: 1.40 }, // Porta Q3 (vão Z in [5.30, 6.70])
      { x: 0.0,  z: 2.35, w: 0.15, d: 0.90 }, // Porta Oficina (vão Z in [1.90, 2.80])
      { x: 0.5,  z: 3.25, w: 0.15, d: 0.90 }  // Porta BWC (vão Z in [2.80, 3.70])
    ];

    lintelSpecs.forEach(ls => {
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(ls.w, 0.55, ls.d), fullWallMat);
      lintel.position.set(ls.x, 2.375, ls.z);
      fullWallsGroup.add(lintel);
    });
  }

  // PORTAS E JANELAS PROCEDURAIS
  function buildProceduralDoorsAndWindows() {
    const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const doorLeafMat = new THREE.MeshStandardMaterial({ color: 0x4a3221, roughness: 0.6 }); // Freijó nobre escuro
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.1 });

    function createProceduralDoor(openAngle) {
      const group = new THREE.Group();
      // Batentes
      const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.34, 0.16), doorFrameMat);
      frameL.position.set(-0.38, 0.67, 0);
      const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.34, 0.16), doorFrameMat);
      frameR.position.set(0.38, 0.67, 0);
      group.add(frameL, frameR);

      // Folha encostada na parede
      const leafGroup = new THREE.Group();
      leafGroup.position.set(-0.36, 0, 0);

      const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.30, 0.035), doorLeafMat);
      leaf.position.set(0.36, 0.65, 0);
      leafGroup.add(leaf);

      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.02), handleMat);
      handle.position.set(0.66, 0.65, 0.035);
      leafGroup.add(handle);

      leafGroup.rotation.y = openAngle;
      group.add(leafGroup);
      return group;
    }

    // Instanciação das portas (todas abertas a 85-90 graus rentes às paredes)
    const doors = [
      { x: -0.5, z: 0.0, ry: 0, angle: -Math.PI / 2 + 0.08 },        // Entrada Norte
      { x: -0.5, z: 8.0, ry: 0, angle: Math.PI / 2 - 0.08 },         // Saída Quintal Sul
      { x: -1.8, z: 1.85, ry: Math.PI / 2, angle: Math.PI / 2 - 0.08 }, // Quarto 1
      { x: -1.8, z: 3.35, ry: Math.PI / 2, angle: Math.PI / 2 - 0.08 }, // Quarto 2
      { x: -1.8, z: 5.85, ry: Math.PI / 2, angle: Math.PI / 2 - 0.08 }, // Quarto 3
      { x: 0.0,  z: 2.35, ry: Math.PI / 2, angle: -Math.PI / 2 + 0.08 }, // Oficina (folha abre para dentro da oficina rente à parede sul)
      { x: 0.5,  z: 3.35, ry: Math.PI / 2, angle: Math.PI / 2 - 0.08 }  // BWC
    ];

    doors.forEach(d => {
      const door = createProceduralDoor(d.angle);
      door.position.set(d.x, 0, d.z);
      door.rotation.y = d.ry;
      cutWallsGroup.add(door);
    });

    // Janelas com peitoril e vidros duplos translúcidos
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.45,
      roughness: 0.05,
      transmission: 0.88
    });
    const sillMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

    function createProceduralWindow(width, isRotated) {
      const group = new THREE.Group();
      const sill = new THREE.Mesh(
        new THREE.BoxGeometry(isRotated ? 0.15 : width, 0.70, isRotated ? width : 0.15),
        sillMat
      );
      sill.position.y = 0.35;
      group.add(sill);

      const winH = 0.65;
      const frame = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(isRotated ? 0.08 : width, winH, isRotated ? width : 0.08)),
        new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
      );
      frame.position.y = 0.70 + winH / 2;

      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(isRotated ? 0.02 : width - 0.04, winH - 0.04, isRotated ? width - 0.04 : 0.02),
        glassMat
      );
      glass.position.y = 0.70 + winH / 2;

      group.add(frame, glass);
      return group;
    }

    const windows = [
      { x: -5.0, z: 1.4, w: 1.2, rot: true },  // Q1
      { x: -5.0, z: 4.1, w: 1.2, rot: true },  // Q2
      { x: -5.0, z: 6.7, w: 1.2, rot: true },  // Q3
      { x: 1.25, z: 0.0, w: 1.4, rot: false }, // Oficina
      { x: -2.8, z: 0.0, w: 1.4, rot: false }, // Quarto 1 Norte (ventilação cruzada bioclimática)
      { x: 1.25, z: 8.0, w: 1.4, rot: false }  // Cozinha
    ];

    windows.forEach(w => {
      const win = createProceduralWindow(w.w, w.rot);
      win.position.set(w.x, 0, w.z);
      cutWallsGroup.add(win);
    });
  }

  // =========================================================================
  // MOBILIÁRIO RESIDENCIAL HIPER-DETALHADO (CASA HABITADA)
  // =========================================================================
  function buildProceduralFurniture() {
    const oakMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.5 });      // Freijó/Carvalho nobre
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 });   // Laca branca acetinada
    const charcoalMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });// Tecido linho cinza mescla
    const navyMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6 });     // Duvet azul petróleo
    const mustardMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });  // Almofadas mostarda
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.2 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.1 });

    // 1. SALA DE ESTAR & JANTAR HIPER-DETALHADA (CONFORTO RESIDENCIAL & ZERO CLASH)
    const salaGroup = new THREE.Group();
    salaGroup.name = 'salaGroup';
    salaGroup.position.set(0, 0, 0);

    // Paleta de Materiais Residenciais da Sala
    const sofaFabricMat = new THREE.MeshStandardMaterial({ 
      color: 0x3e4c59,
      roughness: 0.88,
      metalness: 0.05
    });
    const woodPlinthMat = new THREE.MeshStandardMaterial({ 
      color: 0x6b4423,
      roughness: 0.45,
      metalness: 0.05
    });
    const brassLegMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b,
      roughness: 0.30,
      metalness: 0.85
    });
    const rugMat = new THREE.MeshStandardMaterial({ 
      color: 0xd4cdc5,
      roughness: 0.95
    });
    const rugBorderMat = new THREE.MeshStandardMaterial({ 
      color: 0x8c827a, 
      roughness: 0.90
    });
    const tvScreenMat = new THREE.MeshStandardMaterial({ 
      color: 0x050505,
      roughness: 0.08,
      metalness: 0.90
    });
    const tvGlowMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.15
    });
    const ceramicMat = new THREE.MeshStandardMaterial({ 
      color: 0xf8fafc, 
      roughness: 0.20 
    });
    const lampShadeMat = new THREE.MeshStandardMaterial({ 
      color: 0xfffbeb,
      roughness: 0.60
    });
    const terracottaMat = new THREE.MeshStandardMaterial({ 
      color: 0xb45309, 
      roughness: 0.80 
    });

    // A. Tapete Amplo Geométrico (1.30 m x 1.90 m)
    const rugBase = new THREE.Mesh(new THREE.BoxGeometry(1.30, 0.012, 1.90), rugMat);
    rugBase.position.set(-1.05, 0.006, 1.80);
    rugBase.receiveShadow = true;
    const rugBorder = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.004, 1.92), rugBorderMat);
    rugBorder.position.set(-1.05, 0.002, 1.80);
    salaGroup.add(rugBorder, rugBase);

    // B. Sofá Contemporâneo 3 Lugares Elevado (Positioned at Z = 1.56m for >= 48cm Door 1 clearance)
    const sofaGroup = new THREE.Group();
    sofaGroup.position.set(-1.30, 0, 1.56);

    const legGeo = new THREE.CylinderGeometry(0.018, 0.028, 0.14, 16);
    const legPositions = [
      { x: -0.32, z: -0.28, rx: -0.08, rz: -0.08 },
      { x:  0.32, z: -0.28, rx: -0.08, rz:  0.08 },
      { x: -0.32, z:  0.28, rx:  0.08, rz: -0.08 },
      { x:  0.32, z:  0.28, rx:  0.08, rz:  0.08 }
    ];
    legPositions.forEach(lp => {
      const leg = new THREE.Mesh(legGeo, woodPlinthMat);
      leg.position.set(lp.x, 0.07, lp.z);
      leg.rotation.set(lp.rx, 0, lp.rz);
      leg.castShadow = true;
      sofaGroup.add(leg);
    });

    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.05, 0.68), woodPlinthMat);
    plinth.scale.set(0.76 / 0.96, 1.0, 1.0);
    plinth.position.set(0, 0.165, 0);
    plinth.castShadow = true;
    sofaGroup.add(plinth);

    const seatDeck = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 0.68), sofaFabricMat);
    seatDeck.position.set(0, 0.23, 0);
    seatDeck.castShadow = true;
    sofaGroup.add(seatDeck);

    const backRest = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.44, 0.12), sofaFabricMat);
    backRest.position.set(0, 0.49, -0.28);
    backRest.rotation.x = -0.08;
    backRest.castShadow = true;
    sofaGroup.add(backRest);

    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.66), sofaFabricMat);
    armL.position.set(-0.35, 0.37, 0.01);
    armL.castShadow = true;
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.66), sofaFabricMat);
    armR.position.set(0.35, 0.37, 0.01);
    armR.castShadow = true;
    sofaGroup.add(armL, armR);

    const seatW = 0.21;
    for (let i = -1; i <= 1; i++) {
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(seatW - 0.01, 0.09, 0.50), sofaFabricMat);
      cushion.position.set(i * seatW, 0.31, 0.05);
      cushion.castShadow = true;
      sofaGroup.add(cushion);
    }

    for (let i = -1; i <= 1; i++) {
      const pillow = new THREE.Mesh(new THREE.BoxGeometry(seatW - 0.01, 0.28, 0.10), sofaFabricMat);
      pillow.position.set(i * seatW, 0.48, -0.20);
      pillow.rotation.x = -0.12;
      pillow.castShadow = true;
      sofaGroup.add(pillow);
    }

    const deco1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.06), mustardMat);
    deco1.position.set(-0.22, 0.42, -0.10);
    deco1.rotation.set(-0.10, 0.25, 0.15);
    const deco2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.06), mustardMat);
    deco2.position.set(0.22, 0.42, -0.10);
    deco2.rotation.set(-0.10, -0.25, -0.15);
    sofaGroup.add(deco1, deco2);
    salaGroup.add(sofaGroup);

    // C. Mesa de Centro Elegante (Bounds: X in [-1.48, -1.02], Z in [1.94, 2.30])
    const coffeeGroup = new THREE.Group();
    coffeeGroup.position.set(-1.25, 0, 2.12);

    const tableTopMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.03, 32), woodPlinthMat);
    tableTopMesh.scale.set(0.72, 1.0, 0.56);
    tableTopMesh.position.y = 0.28;
    tableTopMesh.castShadow = true;
    coffeeGroup.add(tableTopMesh);

    const tLegGeo = new THREE.CylinderGeometry(0.007, 0.005, 0.265, 12);
    const tLegPositions = [
      { x: -0.14, z: -0.10 }, { x: 0.14, z: -0.10 },
      { x: -0.14, z:  0.10 }, { x: 0.14, z:  0.10 }
    ];
    tLegPositions.forEach(tl => {
      const leg = new THREE.Mesh(tLegGeo, brassLegMat);
      leg.position.set(tl.x, 0.135, tl.z);
      coffeeGroup.add(leg);
    });

    const artBook = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.015, 0.14), new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 }));
    artBook.position.set(0.04, 0.302, -0.02);
    artBook.rotation.y = 0.25;
    const coffeeCup = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.045, 16), ceramicMat);
    coffeeCup.position.set(-0.08, 0.318, 0.03);
    coffeeGroup.add(artBook, coffeeCup);
    salaGroup.add(coffeeGroup);

    // D. Rack Baixo Suspenso na Parede 19 (Flush at X = -0.076, depth 0.20m, Z in [0.91, 1.79])
    const mediaGroup = new THREE.Group();
    mediaGroup.position.set(-0.176, 0.32, 1.35);

    const consoleCarcass = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.36, 0.88), woodPlinthMat);
    consoleCarcass.castShadow = true;
    mediaGroup.add(consoleCarcass);

    const cableGuide = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.01, 0.01), woodPlinthMat);
    cableGuide.scale.set(0.18 / 0.33, 1.0, 1.0);
    cableGuide.position.set(0, 0, 0);
    mediaGroup.add(cableGuide);

    const slattedDoor = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.32, 0.84),
      new THREE.MeshStandardMaterial({ color: 0x54361c, roughness: 0.6 })
    );
    slattedDoor.position.set(-0.0925, 0, 0);
    mediaGroup.add(slattedDoor);

    const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.54, 0.84), tvScreenMat);
    tvScreen.position.set(0.089, 0.54, 0);
    tvScreen.castShadow = true;

    const tvGlowPanel = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.52, 0.82), tvGlowMat);
    tvGlowPanel.position.set(0.075, 0.54, 0);

    const soundbar = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.045, 0.58), brassLegMat);
    soundbar.position.set(0, 0.2025, 0);
    soundbar.castShadow = true;

    mediaGroup.add(tvScreen, tvGlowPanel, soundbar);
    salaGroup.add(mediaGroup);

    // E. Estante Aberta Contemporânea (Flush com Parede Norte: Z in [0.075, 0.295], X in [-1.62, -1.08])
    const shelfGroup = new THREE.Group();
    shelfGroup.position.set(-1.35, 0, 0.185);

    const uprightGeo = new THREE.BoxGeometry(0.02, 1.30, 0.02);
    const u1 = new THREE.Mesh(uprightGeo, brassLegMat); u1.position.set(-0.25, 0.65, -0.09);
    const u2 = new THREE.Mesh(uprightGeo, brassLegMat); u2.position.set( 0.25, 0.65, -0.09);
    const u3 = new THREE.Mesh(uprightGeo, brassLegMat); u3.position.set(-0.25, 0.65,  0.09);
    const u4 = new THREE.Mesh(uprightGeo, brassLegMat); u4.position.set( 0.25, 0.65,  0.09);
    shelfGroup.add(u1, u2, u3, u4);

    const shelfBoardGeo = new THREE.BoxGeometry(0.52, 0.025, 0.20);
    const shelfLevels = [0.15, 0.50, 0.85, 1.20];
    shelfLevels.forEach(lvl => {
      const board = new THREE.Mesh(shelfBoardGeo, woodPlinthMat);
      board.position.y = lvl;
      board.castShadow = true;
      shelfGroup.add(board);
    });
    const bookSpacer = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.01, 0.01), woodPlinthMat);
    bookSpacer.scale.set(0.15 / 0.26, 1.0, 1.0);
    shelfGroup.add(bookSpacer);

    const bookColors = [0x1e3a8a, 0xb45309, 0x15803d, 0x334155, 0x7c2d12];
    for (let b = 0; b < 5; b++) {
      const bookH = 0.18 + (b % 3) * 0.03;
      const bookW = 0.03 + (b % 2) * 0.01;
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(bookW, bookH, 0.14),
        new THREE.MeshStandardMaterial({ color: bookColors[b], roughness: 0.6 })
      );
      book.position.set(-0.16 + b * 0.08, 0.15 + 0.0125 + bookH / 2, 0);
      book.castShadow = true;
      shelfGroup.add(book);
    }

    const ceramicVase = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 0.16, 20), ceramicMat);
    ceramicVase.position.set(-0.10, 0.50 + 0.0125 + 0.08, 0);
    ceramicVase.castShadow = true;
    const terracottaVase = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.14, 18), terracottaMat);
    terracottaVase.position.set(0.10, 0.85 + 0.0125 + 0.07, 0);
    terracottaVase.rotation.x = Math.PI;
    terracottaVase.castShadow = true;
    shelfGroup.add(ceramicVase, terracottaVase);
    salaGroup.add(shelfGroup);

    // F. Luminária de Chão Slender (Positioned at (-1.52, 0, 0.80), clear of sofa and bookshelf)
    const lampGroup = new THREE.Group();
    lampGroup.position.set(-1.52, 0, 0.80);

    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 24), brassLegMat);
    lampBase.position.y = 0.01;
    lampGroup.add(lampBase);

    const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.009, 1.40, 16), brassLegMat);
    lampStem.position.set(0, 0.70, 0);
    lampStem.castShadow = true;

    const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.26, 12), brassLegMat);
    lampArm.position.set(0.08, 1.40, 0.06);
    lampArm.rotation.set(0.30, 0, -0.80);

    const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.13, 0.14, 24, 1, true), lampShadeMat);
    lampShade.position.set(0.16, 1.35, 0.10);
    lampShade.castShadow = true;

    const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    lampBulb.position.set(0.16, 1.35, 0.10);

    lampGroup.add(lampStem, lampArm, lampShade, lampBulb);
    salaGroup.add(lampGroup);

    // G. Costela-de-Adão em Vaso Cerâmico (Relocated to Southwest Corner: (-1.48, 0, 2.52))
    const plantGroup = new THREE.Group();
    plantGroup.position.set(-1.48, 0, 2.52);

    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 12), woodPlinthMat);
      leg.position.set(Math.cos(angle) * 0.11, 0.07, Math.sin(angle) * 0.11);
      leg.castShadow = true;
      plantGroup.add(leg);
    }

    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.09, 0.28, 24), ceramicMat);
    pot.position.y = 0.24;
    pot.castShadow = true;
    plantGroup.add(pot);

    const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 20), new THREE.MeshStandardMaterial({ color: 0x22170f, roughness: 0.95 }));
    soil.position.y = 0.36;
    plantGroup.add(soil);

    const monsteraMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.35, side: THREE.DoubleSide });
    const leafStems = [
      { rx:  0.25, ry:  0.10, rz:  0.20, len: 0.28, h: 0.28 },
      { rx: -0.20, ry:  1.30, rz:  0.24, len: 0.30, h: 0.30 },
      { rx:  0.18, ry:  2.50, rz: -0.25, len: 0.26, h: 0.26 },
      { rx: -0.12, ry:  3.70, rz:  0.28, len: 0.32, h: 0.32 },
      { rx:  0.10, ry:  4.90, rz: -0.22, len: 0.28, h: 0.28 }
    ];
    leafStems.forEach(c => {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.008, c.h, 8), monsteraMat);
      stem.position.set(0, c.h / 2 + 0.36, 0);
      stem.rotation.set(c.rx, c.ry, c.rz);

      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.12, c.len, 5), monsteraMat);
      leaf.position.set(0, c.len / 2, 0);
      leaf.scale.set(1.1, 1.0, 0.08);
      stem.add(leaf);
      plantGroup.add(stem);
    });

    salaGroup.add(plantGroup);
    houseGroup.add(salaGroup);

    // =========================================================================
    // 2. COZINHA & AGROINDÚSTRIA SELO ARTE (13,76 m²) — REPROJETADA SEM COLISÕES
    // =========================================================================
    const cozGroup = new THREE.Group();
    cozGroup.name = 'cozinhaGroup';
    cozGroup.position.set(0, 0, 0);

    // Paleta de Materiais Específica da Cozinha Selo Arte
    const stainlessMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.88,
      roughness: 0.22
    });
    const stainlessDarkMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.90,
      roughness: 0.28
    });
    const chromeHandleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.98,
      roughness: 0.08
    });
    const ceramicBlackMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.06,
      metalness: 0.0 // Dielectric ceramic glass
    });
    const inductionGlowMat = new THREE.MeshStandardMaterial({
      color: 0xff3b14,
      emissive: 0xff2200,
      emissiveIntensity: 0.85,
      roughness: 0.2
    });
    const ovenGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      transmission: 0.65
    });
    const butcherBlockMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.42
    });
    const diningOakMat = new THREE.MeshStandardMaterial({
      color: 0xa16207,
      roughness: 0.38
    });
    const chairFabricMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.85
    });
    const honeyJarMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      roughness: 0.12,
      transmission: 0.75,
      transparent: true,
      opacity: 0.88
    });

    // A. LINHA DE BANCADA INOX ENCOSTADA NA PAREDE LESTE (Flush at X = 2.420m vs Plaster X = 2.425m)
    // A1. Refrigerator (X = 2.095m, width 0.65m -> max X = 2.420m)
    const fridgeGroup = new THREE.Group();
    const fridgeBody = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.85, 0.75), stainlessMat);
    fridgeBody.position.set(2.095, 0.925, 5.425);
    const fridgePlinth = new THREE.Mesh(new THREE.BoxGeometry(0.652, 0.08, 0.752), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 }));
    fridgePlinth.position.set(2.095, 0.04, 5.425);
    const fridgeDoorLow = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.98, 0.73), stainlessMat);
    fridgeDoorLow.position.set(1.760, 0.57, 5.425);
    const fridgeDoorUp = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.72, 0.73), stainlessMat);
    fridgeDoorUp.position.set(1.760, 1.45, 5.425);

    const handleLow = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.45, 12), chromeHandleMat);
    handleLow.position.set(1.730, 0.85, 5.72);
    const handleUp = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.35, 12), chromeHandleMat);
    handleUp.position.set(1.730, 1.35, 5.72);
    const dispenserPanel = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.20, 0.14), new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1 }));
    dispenserPanel.position.set(1.748, 1.50, 5.35);
    const dispenserLed = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.02, 0.08), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    dispenserLed.position.set(1.746, 1.56, 5.35);

    fridgeGroup.add(fridgeBody, fridgePlinth, fridgeDoorLow, fridgeDoorUp, handleLow, handleUp, dispenserPanel, dispenserLed);
    cozGroup.add(fridgeGroup);

    // A2. Sanitary Counter & Sink (Center X = 2.115m, max X = 2.420m)
    const sinkGroup = new THREE.Group();
    const counterCabinet = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.74, 1.15), stainlessMat);
    counterCabinet.position.set(2.115, 0.47, 6.425);
    const counterToeKick = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.10, 1.15), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 }));
    counterToeKick.position.set(2.140, 0.05, 6.425);
    const counterTopSlab = new THREE.Mesh(new THREE.BoxGeometry(0.61, 0.04, 1.15), stainlessMat);
    counterTopSlab.position.set(2.115, 0.86, 6.425);
    const splashBack = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 1.15), stainlessMat);
    splashBack.position.set(2.410, 0.90, 6.425);

    const basin1 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.36), stainlessDarkMat);
    basin1.position.set(2.090, 0.77, 6.16);
    const basin2 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.36), stainlessDarkMat);
    basin2.position.set(2.090, 0.77, 6.64);
    const drain1 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.005, 16), chromeHandleMat);
    drain1.position.set(2.090, 0.685, 6.16);
    const drain2 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.005, 16), chromeHandleMat);
    drain2.position.set(2.090, 0.685, 6.64);
    for (let g = 0; g < 4; g++) {
      const groove = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.004, 0.015), stainlessDarkMat);
      groove.position.set(2.090, 0.881, 5.90 + g * 0.035);
      sinkGroup.add(groove);
    }

    const faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 0.02, 16), chromeHandleMat);
    faucetBase.position.set(2.350, 0.89, 6.40);
    const faucetCol = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 16), chromeHandleMat);
    faucetCol.position.set(2.350, 1.01, 6.40);
    const faucetArch = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.011, 12, 24, Math.PI), chromeHandleMat);
    faucetArch.rotation.z = Math.PI / 2;
    faucetArch.position.set(2.270, 1.12, 6.40);
    const faucetSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.013, 0.05, 16), chromeHandleMat);
    faucetSpout.position.set(2.190, 1.095, 6.40);
    const faucetLever = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.07, 12), chromeHandleMat);
    faucetLever.rotation.x = Math.PI / 4;
    faucetLever.position.set(2.350, 0.98, 6.435);

    sinkGroup.add(counterCabinet, counterToeKick, counterTopSlab, splashBack, basin1, basin2, drain1, drain2, faucetBase, faucetCol, faucetArch, faucetSpout, faucetLever);
    cozGroup.add(sinkGroup);

    // A3. Cooktop de Indução, Forno Embutido e Coifa (Center X = 2.115m, max X = 2.420m)
    const cookGroup = new THREE.Group();
    const cookCabinet = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.74, 0.75), stainlessMat);
    cookCabinet.position.set(2.115, 0.47, 7.425);
    const cookTopSlab = new THREE.Mesh(new THREE.BoxGeometry(0.61, 0.04, 0.75), stainlessMat);
    cookTopSlab.position.set(2.115, 0.86, 7.425);
    const cookSplash = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.75), stainlessMat);
    cookSplash.position.set(2.410, 0.90, 7.425);

    const ovenFront = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.58, 0.65), stainlessMat);
    ovenFront.position.set(1.808, 0.45, 7.425);
    const ovenWindow = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.38, 0.48), ovenGlassMat);
    ovenWindow.position.set(1.796, 0.42, 7.425);
    const ovenHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.48, 12), chromeHandleMat);
    ovenHandle.rotation.x = Math.PI / 2;
    ovenHandle.position.set(1.785, 0.66, 7.425);
    for (let k of [-0.22, 0.22]) {
      const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.012, 16), chromeHandleMat);
      knob.rotation.z = Math.PI / 2;
      knob.position.set(1.795, 0.70, 7.425 + k);
      cookGroup.add(knob);
    }
    const ovenClock = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.02, 0.06), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    ovenClock.position.set(1.796, 0.70, 7.425);

    const hobGlass = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.006, 0.62), ceramicBlackMat);
    hobGlass.position.set(2.110, 0.884, 7.425);

    const ringCoords = [
      { x: 2.210, z: 7.28, r: 0.095 },
      { x: 2.010, z: 7.57, r: 0.095 },
      { x: 2.010, z: 7.28, r: 0.075 },
      { x: 2.210, z: 7.57, r: 0.075 }
    ];
    ringCoords.forEach(rc => {
      const ringMesh = new THREE.Mesh(new THREE.RingGeometry(rc.r - 0.005, rc.r, 24), inductionGlowMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(rc.x, 0.888, rc.z);
      cookGroup.add(ringMesh);
    });

    const hoodCanopy = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 0.74), stainlessMat);
    hoodCanopy.position.set(2.110, 1.73, 7.425);
    const hoodDuct = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.80, 0.30), stainlessMat);
    hoodDuct.position.set(2.270, 2.24, 7.425);
    for (let lz of [-0.20, 0.20]) {
      const ledSpot = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.005, 16), new THREE.MeshBasicMaterial({ color: 0xfffaed }));
      ledSpot.position.set(2.070, 1.618, 7.425 + lz);
      cookGroup.add(ledSpot);
    }
    const hoodTaskLight = new THREE.PointLight(0xfffaed, 0.45, 2.0);
    hoodTaskLight.position.set(2.070, 1.60, 7.425);
    cookGroup.add(hoodCanopy, hoodDuct, hoodTaskLight, cookCabinet, cookTopSlab, cookSplash, ovenFront, ovenWindow, ovenHandle, ovenClock, hobGlass);
    cozGroup.add(cookGroup);

    // B. ILHA CENTRAL DE PROCESSAMENTO SELO ARTE (X: 0.45, Z: 6.40)
    const islandGroup = new THREE.Group();
    const butcherTop = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.05, 1.20), butcherBlockMat);
    butcherTop.position.set(0.45, 0.875, 6.40);

    const legGeom = new THREE.BoxGeometry(0.04, 0.85, 0.04);
    for (let lx of [0.15, 0.75]) {
      for (let lz of [5.83, 6.97]) {
        const leg = new THREE.Mesh(legGeom, stainlessMat);
        leg.position.set(lx, 0.425, lz);
        const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 12), chromeHandleMat);
        foot.position.set(lx, 0.01, lz);
        islandGroup.add(leg, foot);
      }
    }
    for (let s = 0; s < 7; s++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.02, 1.10), stainlessMat);
      slat.position.set(0.20 + s * 0.08, 0.18, 6.40);
      islandGroup.add(slat);
    }
    const gnTray1 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.45), stainlessDarkMat);
    gnTray1.position.set(0.45, 0.23, 6.12);
    const gnTray2 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.45), stainlessDarkMat);
    gnTray2.position.set(0.45, 0.23, 6.68);
    islandGroup.add(gnTray1, gnTray2);

    const cuttingBoard = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.025, 0.24), new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.5 }));
    cuttingBoard.position.set(0.35, 0.912, 6.20);
    const chefKnife = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.035, 0.18), chromeHandleMat);
    chefKnife.position.set(0.55, 0.905, 6.20);
    islandGroup.add(cuttingBoard, chefKnife);

    for (let j = 0; j < 4; j++) {
      const jarBody = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.08, 16), honeyJarMat);
      jarBody.position.set(0.64, 0.94, 6.40 + (j - 1.5) * 0.10);
      const jarCap = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.015, 16), diningOakMat);
      jarCap.position.set(0.64, 0.985, 6.40 + (j - 1.5) * 0.10);
      const jarLabel = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.03, 16), new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 }));
      jarLabel.position.set(0.64, 0.94, 6.40 + (j - 1.5) * 0.10);
      islandGroup.add(jarBody, jarCap, jarLabel);
    }
    islandGroup.add(butcherTop);
    cozGroup.add(islandGroup);

    // C. MESA DE JANTAR ESCANDINAVA (0.70m x 1.15m at X: -0.85, Z: 5.40) E 4 CADEIRAS ERGONÔMICAS
    const diningGroup = new THREE.Group();
    const diningTableTop = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.035, 1.15), diningOakMat);
    diningTableTop.position.set(-0.85, 0.732, 5.40);
    diningGroup.add(diningTableTop);

    const diningLegCyl = new THREE.CylinderGeometry(0.018, 0.012, 0.715, 16);
    const diningLegPos = [
      { x: -1.15, z: 4.88, rotX: -0.05, rotZ: 0.05 },
      { x: -0.55, z: 4.88, rotX: -0.05, rotZ: -0.05 },
      { x: -1.15, z: 5.92, rotX: 0.05, rotZ: 0.05 },
      { x: -0.55, z: 5.92, rotX: 0.05, rotZ: -0.05 }
    ];
    diningLegPos.forEach(lp => {
      const leg = new THREE.Mesh(diningLegCyl, diningOakMat);
      leg.position.set(lp.x, 0.358, lp.z);
      leg.rotation.x = lp.rotX;
      leg.rotation.z = lp.rotZ;
      const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.012, 0.04, 16), new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 }));
      tip.position.set(lp.x, 0.02, lp.z);
      diningGroup.add(leg, tip);
    });

    function createErgonomicChair(cx, cz, isNorth) {
      const chair = new THREE.Group();
      chair.position.set(cx, 0, cz);

      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.045, 0.34), chairFabricMat);
      seat.position.set(0, 0.44, 0);

      const cLegGeom = new THREE.CylinderGeometry(0.013, 0.009, 0.42, 12);
      for (let dx of [-0.15, 0.15]) {
        for (let dz of [-0.13, 0.13]) {
          const cl = new THREE.Mesh(cLegGeom, diningOakMat);
          cl.position.set(dx, 0.21, dz);
          cl.rotation.z = (dx > 0 ? -1 : 1) * 0.06;
          cl.rotation.x = (dz > 0 ? 1 : -1) * 0.06;
          chair.add(cl);
        }
      }

      const backCurve = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16, 1, true, 0, Math.PI * 0.75), diningOakMat);
      backCurve.rotation.y = isNorth ? Math.PI * 0.625 : -Math.PI * 0.375;
      backCurve.position.set(0, 0.78, isNorth ? -0.14 : 0.14);

      for (let hx of [-0.12, 0.12]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.32, 12), diningOakMat);
        post.position.set(hx, 0.60, isNorth ? -0.14 : 0.14);
        chair.add(post);
      }

      chair.add(seat, backCurve);
      return chair;
    }

    // 4 Cadeiras: 2 Norte (cz = 4.60) e 2 Sul (cz = 6.16)
    cozGroup.add(createErgonomicChair(-1.10, 4.60, true));
    cozGroup.add(createErgonomicChair(-0.60, 4.60, true));
    cozGroup.add(createErgonomicChair(-1.10, 6.16, false));
    cozGroup.add(createErgonomicChair(-0.60, 6.16, false));

    cozGroup.add(diningGroup);
    houseGroup.add(cozGroup);

    // 3. QUARTO 1 (MASTER / CASAL // 8,96 m²)
    const bedQ1 = new THREE.Group();
    bedQ1.position.set(-3.4, 0, 1.4);

    const baseBedQ1 = new THREE.Mesh(new THREE.BoxGeometry(1.60, 0.28, 1.95), oakMat);
    baseBedQ1.position.set(0, 0.14, -0.28);
    const mattressQ1 = new THREE.Mesh(new THREE.BoxGeometry(1.54, 0.24, 1.90), whiteMat);
    mattressQ1.position.set(0, 0.38, -0.28);
    const headboardQ1 = new THREE.Mesh(new THREE.BoxGeometry(1.70, 0.85, 0.10), charcoalMat);
    headboardQ1.position.set(0, 0.55, -1.22);

    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const pilL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.36), pillowMat);
    pilL.position.set(-0.40, 0.52, -0.96);
    const pilR = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.36), pillowMat);
    pilR.position.set(0.40, 0.52, -0.96);
    const duvet = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.06, 1.25), navyMat);
    duvet.position.set(0, 0.51, 0.04);
    bedQ1.add(baseBedQ1, mattressQ1, headboardQ1, pilL, pilR, duvet);

    for (let side of [-1.05, 1.05]) {
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.36), whiteMat);
      stand.position.set(side, 0.21, -1.14);
      const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.04, 16), chromeMat);
      lampBase.position.set(side, 0.44, -1.14);
      const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.16, 16), new THREE.MeshBasicMaterial({ color: 0xfffbeb }));
      lampShade.position.set(side, 0.56, -1.14);
      bedQ1.add(stand, lampBase, lampShade);
    }

    const wardrobeQ1 = new THREE.Mesh(new THREE.BoxGeometry(1.50, 1.35, 0.44), whiteMat);
    wardrobeQ1.position.set(0, 0.675, 1.15);
    const mirrorQ1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.25, 0.02), chromeMat);
    mirrorQ1.position.set(0, 0.675, 0.92);
    bedQ1.name = 'quarto1Group';
    bedQ1.add(wardrobeQ1, mirrorQ1);
    houseGroup.add(bedQ1);

    // 4. QUARTOS 2 & 3 (DORMITÓRIOS E ESTUDOS // 8,32 m² CADA)
    function buildSingleBedroom(posZ, canonicalName) {
      const grp = new THREE.Group();
      grp.name = canonicalName;
      grp.position.set(-3.4, 0, posZ);

      // Cama solteiro elegante
      const bed = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.28, 1.98), oakMat);
      bed.position.set(-0.95, 0.14, 0);
      const mat = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.22, 1.92), whiteMat);
      mat.position.set(-0.95, 0.37, 0);
      const pil = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.10, 0.35), whiteMat);
      pil.position.set(-0.95, 0.50, -0.72);
      const sduvet = new THREE.Mesh(new THREE.BoxGeometry(0.90, 0.05, 1.25), navyMat);
      sduvet.position.set(-0.95, 0.49, 0.32);
      grp.add(bed, mat, pil, sduvet);

      // Escrivaninha de estudos
      const desk = new THREE.Mesh(new THREE.BoxGeometry(1.10, 0.72, 0.55), oakMat);
      desk.position.set(0.85, 0.36, 0.85);
      const laptop = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.24), steelMat);
      laptop.position.set(0.85, 0.73, 0.85);
      const chair = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.46, 0.42), charcoalMat);
      chair.position.set(0.85, 0.23, 0.38);
      grp.add(desk, laptop, chair);

      // Guarda-roupa
      const ward = new THREE.Mesh(new THREE.BoxGeometry(1.10, 1.35, 0.55), whiteMat);
      ward.position.set(0.85, 0.675, -0.85);
      grp.add(ward);

      return grp;
    }

    houseGroup.add(buildSingleBedroom(4.1, 'quarto2Group'));
    houseGroup.add(buildSingleBedroom(6.7, 'quarto3Group'));

    // 5. BANHEIRO BWC (4,70 m²)
    const bwcGroup = new THREE.Group();
    bwcGroup.name = 'banheiroGroup';
    bwcGroup.position.set(1.5, 0, 3.8);

    const toiletBase = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.40, 0.55), whiteMat);
    toiletBase.position.set(-0.55, 0.20, -0.65);
    const toiletTank = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.45, 0.22), whiteMat);
    toiletTank.position.set(-0.55, 0.58, -0.80);
    const flushBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.01, 16), chromeMat);
    flushBtn.position.set(-0.55, 0.81, -0.80);
    bwcGroup.add(toiletBase, toiletTank, flushBtn);

    const vanity = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.45, 0.48), oakMat);
    vanity.position.set(0.45, 0.45, -0.65);
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.10, 24), whiteMat);
    basin.position.set(0.45, 0.72, -0.65);
    const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.16, 16), chromeMat);
    faucet.position.set(0.45, 0.82, -0.78);
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.50, 0.02), chromeMat);
    mirror.position.set(0.45, 1.15, -0.92);
    bwcGroup.add(vanity, basin, faucet, mirror);

    const showerEnclosure = new THREE.Mesh(
      new THREE.BoxGeometry(0.88, 1.35, 0.88),
      new THREE.MeshPhysicalMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.35, transmission: 0.9 })
    );
    showerEnclosure.position.set(0.45, 0.675, 0.45);
    const showerHead = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.02, 16), chromeMat);
    showerHead.position.set(0.45, 1.30, 0.45);
    bwcGroup.add(showerEnclosure, showerHead);

    houseGroup.add(bwcGroup);

    // 6. OFICINA TÉCNICA (7,00 m²)
    const benchGroup = new THREE.Group();
    benchGroup.name = 'oficinaGroup';
    benchGroup.position.set(1.25, 0, 1.4);

    const benchBase = new THREE.Mesh(new THREE.BoxGeometry(1.80, 0.80, 0.75), steelMat);
    benchBase.position.set(0, 0.40, 0);
    const benchTop = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.06, 0.78), oakMat);
    benchTop.position.set(0, 0.83, 0);

    const toolDrawers = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.68, 0.68), new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.7 }));
    toolDrawers.position.set(-0.55, 0.40, 0);

    const viseBase = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.14), new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.85 }));
    viseBase.position.set(0.70, 0.92, -0.25);
    const viseScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.20, 16), chromeMat);
    viseScrew.rotation.z = Math.PI / 2;
    viseScrew.position.set(0.70, 0.92, -0.15);

    const inverter = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.65, 0.16), new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.3 }));
    inverter.position.set(0.85, 1.15, -0.34);
    const invDisplay = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.02), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    invDisplay.position.set(0.85, 1.25, -0.25);

    const pegboard = new THREE.Mesh(new THREE.BoxGeometry(1.20, 0.45, 0.03), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }));
    pegboard.position.set(-0.15, 1.15, -0.37);

    const hammer = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.03), chromeMat);
    hammer.position.set(-0.5, 1.15, -0.34);
    const wrench1 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.02), chromeMat);
    wrench1.position.set(-0.3, 1.15, -0.34);
    const wrench2 = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.14, 0.02), chromeMat);
    wrench2.position.set(-0.1, 1.15, -0.34);

    benchGroup.add(benchBase, benchTop, toolDrawers, viseBase, viseScrew, inverter, invDisplay, pegboard, hammer, wrench1, wrench2);
    houseGroup.add(benchGroup);
  }

  // MODELO DE PLANTA ORNAMENTAL INTERNA (COSTELA-DE-ADÃO // MONSTERA DELICIOSA)
  function createMonsteraPlant() {
    const group = new THREE.Group();
    // Vaso cerâmico branco
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.13, 0.38, 20), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 }));
    pot.position.y = 0.19;
    group.add(pot);

    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.4,
      side: THREE.DoubleSide
    });

    // 5 Hastes com folhas largas fenestradas
    const leafConfigs = [
      { rx: 0.35, ry: 0, rz: 0.2, len: 0.38, h: 0.38 },
      { rx: -0.3, ry: 1.2, rz: 0.25, len: 0.42, h: 0.42 },
      { rx: 0.25, ry: 2.4, rz: -0.3, len: 0.36, h: 0.35 },
      { rx: -0.2, ry: 3.6, rz: 0.35, len: 0.44, h: 0.45 },
      { rx: 0.1, ry: 4.8, rz: -0.25, len: 0.40, h: 0.40 }
    ];

    leafConfigs.forEach(c => {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, c.h, 8), leafMat);
      stem.position.set(0, c.h / 2 + 0.18, 0);
      stem.rotation.set(c.rx, c.ry, c.rz);

      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.16, c.len, 5), leafMat);
      leaf.position.set(0, c.len / 2, 0);
      leaf.scale.set(1.0, 1.0, 0.1);
      stem.add(leaf);

      group.add(stem);
    });

    return group;
  }

  // CISTERNAS PLUVIAIS (6.060 L)
  function buildCisternas() {
    const cisternGroup = new THREE.Group();
    cisternGroup.name = 'cisternGroup';
    cisternGroup.position.set(3.75, 0, 1.8);

    const pad = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 2.6), new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 }));
    pad.position.set(0, 0.075, 0);
    cisternGroup.add(pad);

    const tankMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.2 });
    const lidMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });

    for (let i = -0.85; i <= 0.85; i += 0.85) {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 1.55, 28), tankMat);
      tank.position.set(0, 0.92, i);
      tank.castShadow = true;

      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.60, 0.60, 0.08, 28), lidMat);
      lid.position.set(0, 1.72, i);

      const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.35, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      gauge.position.set(0.59, 0.92, i);

      cisternGroup.add(tank, lid, gauge);
    }

    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.1, 16), pipeMat);
    pipe.rotation.x = Math.PI / 2;
    pipe.position.set(0, 0.30, 0);
    cisternGroup.add(pipe);

    masterGroup.add(cisternGroup);
    zoneHighlights['cisternas'] = cisternGroup;
  }

  // ESTUFA DE MICROVERDES (8,0 m²) COM BOTÂNICA DE ALTA DENSIDADE
  function buildEstufaMicroverdes() {
    const estufaGroup = new THREE.Group();
    estufaGroup.name = 'estufaGroup';
    estufaGroup.position.set(3.75, 0, 5.2);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.35,
      roughness: 0.05,
      transmission: 0.88
    });
    const estufaBox = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.9, 4.0), glassMat);
    estufaBox.position.y = 0.95;
    estufaGroup.add(estufaBox);

    const frameEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(2.0, 1.9, 4.0)),
      new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
    );
    frameEdges.position.y = 0.95;
    estufaGroup.add(frameEdges);

    const shelfMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8 });
    const greenSproutMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });
    const purpleSproutMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.5 });
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });

    // 4 Níveis de bandejas com microverdes detalhados
    for (let lvl = 0.35; lvl <= 1.55; lvl += 0.40) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.02, 3.6), shelfMat);
      shelf.position.set(0, lvl, 0);

      // Bandejas divididas (verdes e púrpuras)
      const tray1 = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.04, 3.4), greenSproutMat);
      tray1.position.set(-0.42, lvl + 0.03, 0);
      const tray2 = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.04, 3.4), purpleSproutMat);
      tray2.position.set(0.42, lvl + 0.03, 0);

      const led = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 3.2), ledMat);
      led.position.set(0, lvl + 0.22, 0);

      estufaGroup.add(shelf, tray1, tray2, led);
    }

    masterGroup.add(estufaGroup);
    zoneHighlights['estufa'] = estufaGroup;
  }

  // AQUAPONIA RAS 3.000 L & BIODIGESTOR
  function buildAquaponiaRAS() {
    const aquaGroup = new THREE.Group();
    aquaGroup.name = 'aquaponiaGroup';
    aquaGroup.position.set(3.75, 0, 7.8);

    const fishTankMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.75, roughness: 0.2 });
    const waterMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });

    const tankPositions = [
      { x: -0.55, z: -0.5 },
      { x: 0.55,  z: -0.5 },
      { x: 0.0,   z: 0.5 }
    ];

    tankPositions.forEach(pos => {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.95, 24), fishTankMat);
      tank.position.set(pos.x, 0.475, pos.z);
      const water = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.88, 24), waterMat);
      water.position.set(pos.x, 0.44, pos.z);

      // Silhuetas de peixes nadando em órbita
      for (let f = 0; f < 3; f++) {
        const fish = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 4), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
        fish.rotation.x = Math.PI / 2;
        fish.position.set(pos.x + 0.25 * Math.cos(f * 2.1), 0.5, pos.z + 0.25 * Math.sin(f * 2.1));
        aquaGroup.add(fish);
      }

      aquaGroup.add(tank, water);
    });

    const connPipe = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 0.04), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    connPipe.position.set(0, 0.5, -0.5);
    aquaGroup.add(connPipe);

    const bioBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.8, 24), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 }));
    bioBase.position.set(0, 0.4, 1.4);
    const bioDome = new THREE.Mesh(new THREE.SphereGeometry(0.56, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 }));
    bioDome.position.set(0, 0.8, 1.4);
    aquaGroup.add(bioBase, bioDome);

    masterGroup.add(aquaGroup);
    zoneHighlights['aqua'] = aquaGroup;
  }

  // HORTA BIOINTENSIVA (150 m²) COM PLANTAS 3D DETALHADAS & MELIPONÁRIO
  function buildHortaBiointensiva() {
    const hortaGroup = new THREE.Group();
    hortaGroup.name = 'hortaGroup';
    hortaGroup.position.set(0, 0, 16.0);

    const soilMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.95 });
    const tunnelMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.26, roughness: 0.1 });

    // Materiais botânicos
    const lettuceGreenMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.5 });
    const lettuceRedMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 });
    const kaleMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const carrotLeafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 });

    // 4 InstancedMeshes botânicos para as hortaliças (72 plantas por cultura = 288 plantas 3D)
    const geomLettuceGreen = new THREE.SphereGeometry(0.12, 8, 6);
    geomLettuceGreen.scale(1.1, 0.7, 1.1);
    const geomLettuceRed = new THREE.SphereGeometry(0.11, 8, 6);
    geomLettuceRed.scale(1.0, 0.8, 1.0);
    const geomKale = new THREE.ConeGeometry(0.14, 0.22, 6);
    geomKale.scale(1.2, 0.9, 1.2);
    const geomCarrot = new THREE.CylinderGeometry(0.08, 0.02, 0.20, 6);

    const instLettuceGreen = new THREE.InstancedMesh(geomLettuceGreen, lettuceGreenMat, 72);
    const instLettuceRed = new THREE.InstancedMesh(geomLettuceRed, lettuceRedMat, 72);
    const instKale = new THREE.InstancedMesh(geomKale, kaleMat, 72);
    const instCarrot = new THREE.InstancedMesh(geomCarrot, carrotLeafMat, 72);

    const instMeshes = [instLettuceGreen, instLettuceRed, instKale, instCarrot];
    const instCounters = [0, 0, 0, 0];
    const dummy = new THREE.Object3D();

    // 12 Canteiros elevados com vegetação realista em fileiras
    for (let col of [-2.4, 2.4]) {
      for (let r = 0; r < 6; r++) {
        const bedZ = -5.0 + r * 2.0;

        // Solo fofo biointensivo
        const bed = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.22, 1.2), soilMat);
        bed.position.set(col, 0.11, bedZ);

        const frame = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(3.6, 0.22, 1.2)),
          new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
        );
        frame.position.copy(bed.position);

        // Modelo botânico procedural instanciado (24 plantas por canteiro)
        const cropType = (r + (col > 0 ? 1 : 0)) % 4;
        const targetInst = instMeshes[cropType];

        for (let fx = -1.4; fx <= 1.4; fx += 0.40) {
          for (let fz = -0.35; fz <= 0.35; fz += 0.35) {
            const idx = instCounters[cropType]++;
            if (idx < 72) {
              dummy.position.set(col + fx, 0.25, bedZ + fz);
              dummy.rotation.set(0, 0, 0);
              dummy.scale.set(1, 1, 1);
              dummy.updateMatrix();
              targetInst.setMatrixAt(idx, dummy.matrix);
            }
          }
        }

        // Microtúnel em arco translúcido anti-geada
        const tunnel = new THREE.Mesh(new THREE.CylinderGeometry(0.60, 0.60, 3.5, 16, 1, false, 0, Math.PI), tunnelMat);
        tunnel.rotation.z = Math.PI / 2;
        tunnel.position.set(col, 0.22, bedZ);

        hortaGroup.add(bed, frame, tunnel);
      }
    }

    instMeshes.forEach(im => {
      im.instanceMatrix.needsUpdate = true;
      hortaGroup.add(im);
    });

    // Meliponário com 4 caixas racionais
    const hiveMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const hivePositions = [-3.8, -1.3, 1.3, 3.8];
    hivePositions.forEach(hx => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 12), new THREE.MeshStandardMaterial({ color: 0x334155 }));
      post.position.set(hx, 0.45, 6.2);
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.28), hiveMat);
      box.position.set(hx, 0.95, 6.2);
      hortaGroup.add(post, box);

      // Abelhas douradas voando
      for (let b = 0; b < 4; b++) {
        const bee = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
        bee.position.set(hx, 1.0, 6.2);
        bee.userData = { orbitR: 0.18 + Math.random() * 0.15, angle: Math.random() * Math.PI * 2, cx: hx, cz: 6.2, cy: 1.0 };
        animParticles.push(bee);
        hortaGroup.add(bee);
      }
    });

    masterGroup.add(hortaGroup);
    zoneHighlights['horta'] = hortaGroup;
  }

  // SAF SINTRÓPICO QUEBRA-VENTO (80 m²) COM ESTRATOS BOTÂNICOS
  function buildSAFQuebraVento() {
    const safGroup = new THREE.Group();
    safGroup.name = 'safGroup';
    safGroup.position.set(0, 0, 27.25);

    const safFloor = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.15, 7.5), new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.9 }));
    safFloor.position.y = 0.08;
    safGroup.add(safFloor);

    // 11 Árvores multiestrato com troncos texturizados e frutos
    const treePositions = [
      { x: -3.6, z: 2.2, color: 0x15803d, r: 1.35, h: 4.8, type: 'pecan' },
      { x: -1.8, z: 2.5, color: 0x166534, r: 1.20, h: 4.4, type: 'pecan' },
      { x: 0.8,  z: 2.2, color: 0x15803d, r: 1.25, h: 4.6, type: 'pecan' },
      { x: 3.2,  z: 2.4, color: 0x166534, r: 1.15, h: 4.2, type: 'pecan' },
      { x: -3.0, z: -0.8, color: 0x22c55e, r: 0.95, h: 3.0, type: 'citrus' },
      { x: 0.0,  z: -0.5, color: 0x22c55e, r: 1.00, h: 3.2, type: 'citrus' },
      { x: 2.8,  z: -0.9, color: 0x16a34a, r: 0.90, h: 2.8, type: 'citrus' },
      { x: -1.5, z: -2.4, color: 0x4ade80, r: 0.65, h: 1.8, type: 'coffee' },
      { x: 1.5,  z: -2.3, color: 0x4ade80, r: 0.65, h: 1.8, type: 'coffee' },
      { x: -3.2, z: 0.8,  color: 0x166534, r: 1.10, h: 3.8, type: 'citrus' },
      { x: 2.2,  z: 0.7,  color: 0x15803d, r: 1.15, h: 4.0, type: 'citrus' }
    ];

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.85 });
    const fruitCitrusMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 }); // Laranja/Bergamota
    const fruitCoffeeMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 }); // Grãos de café rubi

    // InstancedMesh para frutos do SAF (30 citros + 16 café)
    const instOranges = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 6, 6), fruitCitrusMat, 30);
    const instCoffee = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 6, 6), fruitCoffeeMat, 16);
    let orangeIdx = 0;
    let coffeeIdx = 0;
    const dummy = new THREE.Object3D();

    treePositions.forEach(tp => {
      // Tronco ramificado
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, tp.h * 0.48, 8), trunkMat);
      trunk.position.set(tp.x, (tp.h * 0.48) / 2, tp.z);
      safGroup.add(trunk);

      // Copa multifacetada densa
      const leafMat = new THREE.MeshStandardMaterial({
        color: tp.color,
        roughness: 0.65,
        flatShading: true,
        side: THREE.DoubleSide
      });

      const c1 = new THREE.Mesh(new THREE.IcosahedronGeometry(tp.r, 1), leafMat);
      c1.position.set(tp.x, tp.h * 0.65, tp.z);
      c1.scale.set(1.05, 1.25, 1.05);

      const c2 = new THREE.Mesh(new THREE.IcosahedronGeometry(tp.r * 0.70, 1), leafMat);
      c2.position.set(tp.x + 0.1, tp.h * 0.86, tp.z - 0.1);

      safGroup.add(c1, c2);

      // Frutos instanciados nas copas
      if (tp.type === 'citrus') {
        for (let fr = 0; fr < 6; fr++) {
          const ang = fr * 1.05;
          dummy.position.set(tp.x + Math.cos(ang) * (tp.r * 0.8), tp.h * 0.62 + (fr % 2) * 0.2, tp.z + Math.sin(ang) * (tp.r * 0.8));
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          if (orangeIdx < 30) instOranges.setMatrixAt(orangeIdx++, dummy.matrix);
        }
      } else if (tp.type === 'coffee') {
        for (let cf = 0; cf < 8; cf++) {
          const ang = cf * 0.8;
          dummy.position.set(tp.x + Math.cos(ang) * (tp.r * 0.75), tp.h * 0.55 + (cf % 3) * 0.15, tp.z + Math.sin(ang) * (tp.r * 0.75));
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          if (coffeeIdx < 16) instCoffee.setMatrixAt(coffeeIdx++, dummy.matrix);
        }
      }
    });

    instOranges.instanceMatrix.needsUpdate = true;
    instCoffee.instanceMatrix.needsUpdate = true;
    safGroup.add(instOranges, instCoffee);

    masterGroup.add(safGroup);
    zoneHighlights['saf'] = safGroup;
  }

  // COBERTURA BIOCLIMÁTICA COM TELHADO SOLAR 7,7 kWp
  function buildTelhadoSolar() {
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4, side: THREE.DoubleSide });

    const roofL = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.08, 8.4), roofMat);
    roofL.position.set(-3.1, 2.05, 4.0);
    roofL.rotation.z = Math.PI / 8;

    const roofR = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.08, 8.4), roofMat);
    roofR.position.set(0.6, 2.05, 4.0);
    roofR.rotation.z = -Math.PI / 8;

    for (let gz of [0.0, 8.0]) {
      const gable = new THREE.Mesh(new THREE.ConeGeometry(3.9, 1.25, 4), roofMat);
      gable.position.set(-1.25, 2.05, gz);
      gable.rotation.y = Math.PI / 4;
      roofGroup.add(gable);
    }

    const solarMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.15 });
    for (let rx = 0; rx < 2; rx++) {
      for (let rz = 0.5; rz <= 7.5; rz += 1.05) {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 0.8), solarMat);
        panel.position.set(-0.3 + rx * 1.2, 2.5 - rx * 0.45, rz);
        panel.rotation.z = -Math.PI / 8;
        roofGroup.add(panel);
      }
    }

    roofGroup.add(roofL, roofR);
    roofGroup.visible = showRoof;
  }

  // =========================================================================
  // SISTEMA DO MODO JOGO FP (PRIMEIRA PESSOA)
  // =========================================================================
  window.toggleFPMode = function (forceState) {
    if (typeof forceState === 'boolean') {
      isFPMode = forceState;
    } else {
      isFPMode = !isFPMode;
    }

    const hud = document.getElementById('fp-hud');
    const btnFP = document.getElementById('btn-fp');
    const camBar = document.querySelector('.stage-3d-cam');

    if (isFPMode) {
      controls.enabled = false;
      isRotating = false;
      const rotBtn = document.getElementById('btn-rot');
      if (rotBtn) rotBtn.classList.remove('active');

      // Calibração de Posição Inicial na Calçada Norte
      fpPos.set(0, 1.68, -1.2);
      fpBaseY = 0.0;
      fpVelX = 0.0;
      fpVelZ = 0.0;
      fpVelY = 0.0;
      fpTargetYaw = 0.0;
      fpYaw = 0.0;
      fpTargetPitch = -0.05;
      fpPitch = -0.05;
      fpCurrentHeight = 1.68;
      fpTargetHeight = 1.68;
      fpCurrentFov = 75;
      fpTargetFov = 75;
      camera.fov = 75;
      camera.updateProjectionMatrix();

      bobCycle = 0.0;
      bobOffsetY = 0.0;
      bobOffsetX = 0.0;
      bobTiltZ = 0.0;
      strafeRoll = 0.0;
      isOnGround = true;

      keys.forward = false;
      keys.backward = false;
      keys.left = false;
      keys.right = false;
      keys.sprint = false;
      keys.jump = false;
      keys.crouch = false;

      setWallHeight(true);

      if (hud) hud.style.display = 'flex';
      if (btnFP) btnFP.classList.add('active');
      if (camBar) camBar.style.opacity = '0.4';

      const canvas = document.getElementById('canvas3d-article');
      try {
        if (canvas && canvas.requestPointerLock) {
          const promise = canvas.requestPointerLock();
          if (promise && promise.catch) promise.catch(() => {});
        }
      } catch (err) {}
    } else {
      try {
        if (document.exitPointerLock) document.exitPointerLock();
      } catch (e) {}
      controls.enabled = true;
      camera.rotation.z = 0.0;
      camera.fov = 45;
      camera.updateProjectionMatrix();

      if (hud) hud.style.display = 'none';
      if (btnFP) btnFP.classList.remove('active');
      if (camBar) camBar.style.opacity = '1.0';

      selectSector(activeSector);
    }
  };

  window.toggleWallHeight = function () {
    setWallHeight(!isWallFull);
  };

  function setWallHeight(full) {
    isWallFull = full;
    cutWallsGroup.visible = !isWallFull;
    fullWallsGroup.visible = isWallFull;

    const btnWall = document.getElementById('btn-wall');
    if (btnWall) btnWall.classList.toggle('active', isWallFull);
  }

  function setupFPEventListeners(canvas) {
    window.addEventListener('keydown', (e) => {
      if (!isFPMode) return;
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.sprint = true;
          break;
        case 'Space':
          keys.jump = true;
          e.preventDefault();
          break;
        case 'KeyC':
        case 'ControlLeft':
        case 'ControlRight':
          keys.crouch = true;
          break;
        case 'KeyL':
          window.toggleLights();
          break;
        case 'Escape':
          toggleFPMode(false);
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.sprint = false;
          break;
        case 'Space':
          keys.jump = false;
          break;
        case 'KeyC':
        case 'ControlLeft':
        case 'ControlRight':
          keys.crouch = false;
          break;
      }
    });

    document.addEventListener('pointerlockchange', () => {
      isPointerLocked = (document.pointerLockElement === canvas);
    });

    canvas.addEventListener('click', () => {
      if (isFPMode && !isPointerLocked && canvas.requestPointerLock) {
        try {
          const promise = canvas.requestPointerLock();
          if (promise && promise.catch) promise.catch(() => {});
        } catch (err) {}
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!isFPMode) return;
      if (isPointerLocked) {
        // Sensibilidade calibrada para suavidade precisa sem saltos de quadro
        fpTargetYaw -= e.movementX * 0.0020;
        fpTargetPitch -= e.movementY * 0.0020;
        fpTargetPitch = Math.max(-1.48, Math.min(1.48, fpTargetPitch));
      } else if (isMouseDownDrag) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        fpTargetYaw -= dx * 0.0030;
        fpTargetPitch -= dy * 0.0030;
        fpTargetPitch = Math.max(-1.48, Math.min(1.48, fpTargetPitch));
      }
    });

    canvas.addEventListener('mousedown', (e) => {
      if (!isFPMode) return;
      isMouseDownDrag = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      isMouseDownDrag = false;
    });

    const touchMap = [
      { id: 'touch-w', prop: 'forward' },
      { id: 'touch-s', prop: 'backward' },
      { id: 'touch-a', prop: 'left' },
      { id: 'touch-d', prop: 'right' },
      { id: 'touch-jump', prop: 'jump' },
      { id: 'touch-crouch', prop: 'crouch' }
    ];

    touchMap.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) {
        el.addEventListener('touchstart', (e) => { e.preventDefault(); keys[item.prop] = true; }, { passive: false });
        el.addEventListener('touchend', (e) => { e.preventDefault(); keys[item.prop] = false; }, { passive: false });
        el.addEventListener('mousedown', () => { keys[item.prop] = true; });
        el.addEventListener('mouseup', () => { keys[item.prop] = false; });
      }
    });
  }

  // CINEMÁTICA, COLISÃO DESLIZANTE E CÂMERA DINÂMICA DO MODO FP
  function updateFPControls(dt) {
    // 1. Suavização de Rotação da Câmera (Damped Angular Lerp)
    const rotSmooth = Math.min(1.0, 26.0 * dt);
    fpYaw += (fpTargetYaw - fpYaw) * rotSmooth;
    fpPitch += (fpTargetPitch - fpPitch) * rotSmooth;

    // 2. Altura dos Olhos com Agachamento Suave
    fpTargetHeight = keys.crouch ? 1.08 : 1.68;
    fpCurrentHeight += (fpTargetHeight - fpCurrentHeight) * Math.min(1.0, 12.0 * dt);

    // 3. Vetores de Direção (XZ) a partir de fpYaw
    const forwardX = Math.sin(fpYaw);
    const forwardZ = Math.cos(fpYaw);
    const rightX = Math.cos(fpYaw);
    const rightZ = -Math.sin(fpYaw);

    let moveX = 0;
    let moveZ = 0;

    if (keys.forward) {
      moveX += forwardX;
      moveZ += forwardZ;
    }
    if (keys.backward) {
      moveX -= forwardX;
      moveZ -= forwardZ;
    }
    if (keys.left) {
      moveX -= rightX;
      moveZ -= rightZ;
    }
    if (keys.right) {
      moveX += rightX;
      moveZ += rightZ;
    }

    const inputLen = Math.hypot(moveX, moveZ);
    if (inputLen > 0.001) {
      moveX /= inputLen;
      moveZ /= inputLen;
    }

    // 4. Velocidade Alvo e Aceleração Cinemática com Inércia
    const targetSpeed = keys.crouch ? 1.85 : (keys.sprint ? 6.2 : 3.5);
    const wishVelX = moveX * targetSpeed;
    const wishVelZ = moveZ * targetSpeed;

    const accel = isOnGround ? (inputLen > 0.001 ? 26.0 : 16.0) : 7.0;
    fpVelX += (wishVelX - fpVelX) * Math.min(1.0, accel * dt);
    fpVelZ += (wishVelZ - fpVelZ) * Math.min(1.0, accel * dt);

    // 5. Resolução de Colisão Deslizante Contínua (Sliding Collision)
    const stepX = fpVelX * dt;
    const stepZ = fpVelZ * dt;
    const r = 0.22; // Raio anatômico ideal para transição fluida por vãos de porta (80 cm)

    const nextX = Math.max(-4.65, Math.min(4.65, fpPos.x + stepX));
    let canMoveX = true;
    for (let b of fpWallBoxes) {
      if (nextX + r > b.minX && nextX - r < b.maxX &&
          fpPos.z + r > b.minZ && fpPos.z - r < b.maxZ) {
        canMoveX = false;
        break;
      }
    }
    if (canMoveX) {
      fpPos.x = nextX;
    } else {
      fpVelX = 0;
    }

    const nextZ = Math.max(-1.85, Math.min(30.6, fpPos.z + stepZ));
    let canMoveZ = true;
    for (let b of fpWallBoxes) {
      if (fpPos.x + r > b.minX && fpPos.x - r < b.maxX &&
          nextZ + r > b.minZ && nextZ - r < b.maxZ) {
        canMoveZ = false;
        break;
      }
    }
    if (canMoveZ) {
      fpPos.z = nextZ;
    } else {
      fpVelZ = 0;
    }

    // 6. Pulo e Gravidade Realista
    if (keys.jump && isOnGround && !keys.crouch) {
      fpVelY = 4.3;
      isOnGround = false;
    }

    if (!isOnGround) {
      fpVelY -= 14.5 * dt;
      fpBaseY += fpVelY * dt;
      if (fpBaseY <= 0.0) {
        fpBaseY = 0.0;
        fpVelY = 0.0;
        isOnGround = true;
      }
    }

    // 7. Head Bobbing Dinâmico e Respiração Procedural
    const currentSpeed = Math.hypot(fpVelX, fpVelZ);
    if (isOnGround && currentSpeed > 0.15) {
      bobCycle += currentSpeed * dt * 4.4;
      const ampY = keys.crouch ? 0.012 : (keys.sprint ? 0.040 : 0.022);
      const ampX = keys.crouch ? 0.007 : (keys.sprint ? 0.020 : 0.010);
      bobOffsetY = Math.sin(bobCycle) * ampY;
      bobOffsetX = Math.cos(bobCycle * 0.5) * ampX;
      bobTiltZ = Math.sin(bobCycle * 0.5) * (keys.sprint ? 0.009 : 0.004);
    } else {
      bobOffsetY += (0 - bobOffsetY) * Math.min(1.0, 8.0 * dt);
      bobOffsetX += (0 - bobOffsetX) * Math.min(1.0, 8.0 * dt);
      bobTiltZ += (0 - bobTiltZ) * Math.min(1.0, 8.0 * dt);
      if (isOnGround) {
        // Respiração sutil em repouso
        const breathe = Math.sin(performance.now() * 0.0018) * 0.003;
        bobOffsetY += breathe;
      }
    }

    // 8. Strafe Banking Suave (Inclinação lateral em curvas/strafe)
    const targetRoll = (keys.left ? 0.014 : 0) + (keys.right ? -0.014 : 0);
    strafeRoll += (targetRoll - strafeRoll) * Math.min(1.0, 10.0 * dt);

    // 9. FOV Dinâmico (Sensação de Aceleração e Sprint)
    fpTargetFov = (keys.sprint && currentSpeed > 2.5) ? 82 : (keys.crouch ? 72 : 75);
    fpCurrentFov += (fpTargetFov - fpCurrentFov) * Math.min(1.0, 6.0 * dt);
    if (Math.abs(camera.fov - fpCurrentFov) > 0.04) {
      camera.fov = fpCurrentFov;
      camera.updateProjectionMatrix();
    }

    // 10. Posicionamento e Orientação Final da Câmera
    fpPos.y = fpBaseY + fpCurrentHeight + bobOffsetY;
    camera.position.set(
      fpPos.x + bobOffsetX,
      fpPos.y,
      fpPos.z
    );

    const lookTarget = new THREE.Vector3(
      camera.position.x + Math.sin(fpYaw) * Math.cos(fpPitch),
      camera.position.y + Math.sin(fpPitch),
      camera.position.z + Math.cos(fpYaw) * Math.cos(fpPitch)
    );
    camera.lookAt(lookTarget);
    camera.rotation.z += (strafeRoll + bobTiltZ);

    updateCamUI(fpPos.x, fpPos.y, fpPos.z);
    updateFPZoneTag(fpPos.x, fpPos.z);
  }

  function updateFPZoneTag(x, z) {
    const zoneTag = document.getElementById('fp-zone-tag');
    if (!zoneTag) return;

    let zoneName = "MASTER PLAN // TERRENO 312,50 m²";

    if (z < -0.1) {
      zoneName = "RUA CAMÉLIA // CALÇADA NORTE";
    } else if (z >= 0.0 && z <= 8.0) {
      if (x >= -5.0 && x < -1.8) {
        if (z < 2.8) zoneName = "QUARTO 1 // SUÍTE CASAL (8,96 m²)";
        else if (z < 5.4) zoneName = "QUARTO 2 // ESTUDOS & HOME OFFICE (8,32 m²)";
        else zoneName = "QUARTO 3 // DORMITÓRIO (8,32 m²)";
      } else if (x >= -1.8 && x < 0.0) {
        if (z < 2.8) zoneName = "SALA DE ESTAR & JANTAR (11,7 m²)";
        else if (z < 4.8) zoneName = "CORREDOR DE CIRCULAÇÃO & HALL";
        else zoneName = "COZINHA & AGROINDÚSTRIA SELO ARTE (10,9 m²)";
      } else if (x >= 0.0 && x <= 2.5) {
        if (z < 2.8) zoneName = "OFICINA TÉCNICA // BANCADA & MORSA (7 m²)";
        else if (z < 4.8) zoneName = "BANHEIRO // BWC COMPLETO (4,7 m²)";
        else zoneName = "COZINHA & AGROINDÚSTRIA SELO ARTE (10,9 m²)";
      } else {
        if (z < 3.2) zoneName = "ÁREA EXTERNA // CISTERNAS PLUVIAIS 6.060 L";
        else if (z < 7.5) zoneName = "ESTUFA DE MICROVERDES & BROTOS (8 m²)";
        else zoneName = "AQUAPONIA RAS 3.000 L & BIODIGESTOR";
      }
    } else if (z > 8.0 && z <= 11.0) {
      zoneName = "PÁTIO BIOTÉCNICO // TRANSIÇÃO ZONA 0 → 1";
    } else if (z > 11.0 && z <= 23.5) {
      if (x < -2.8) zoneName = "MELIPONÁRIO // 4 COLMEIAS JATAÍ & MANDAÇAIA";
      else zoneName = "ZONA 1 // 12 CANTEIROS BIOINTENSIVOS (150 m²)";
    } else if (z > 23.5) {
      zoneName = "ZONA 2 // SAF SINTRÓPICO QUEBRA-VENTO SUL (80 m²)";
    }

    zoneTag.textContent = "LOCAL // " + zoneName;
  }

  // =========================================================================
  // CONTROLE MANUAL DE CÂMERA XYZ (PADRÃO BLUEPRINT)
  // =========================================================================
  window.onManualCamChange = function () {
    if (isFPMode) return;
    isUserScrubbingCam = true;
    const sx = document.getElementById('cam-x');
    const sy = document.getElementById('cam-y');
    const sz = document.getElementById('cam-z');
    if (!sx || !sy || !sz) return;
    const x = parseFloat(sx.value);
    const y = parseFloat(sy.value);
    const z = parseFloat(sz.value);

    cameraTargetPos.x = x;
    cameraTargetPos.y = y;
    cameraTargetPos.z = z;
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

    if (!isUserScrubbingCam && !isFPMode) {
      if (sx && document.activeElement !== sx) sx.value = x.toFixed(1);
      if (sy && document.activeElement !== sy) sy.value = y.toFixed(1);
      if (sz && document.activeElement !== sz) sz.value = z.toFixed(1);
    }
  }

  // LOOP DE RENDERIZAÇÃO
  function renderLoop(now) {
    requestAnimationFrame(renderLoop);
    const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
    lastFrameTime = now;

    if (isFPMode) {
      updateFPControls(dt);
    } else {
      if (!isUserScrubbingCam) {
        camera.position.x += (cameraTargetPos.x - camera.position.x) * 0.08;
        camera.position.y += (cameraTargetPos.y - camera.position.y) * 0.08;
        camera.position.z += (cameraTargetPos.z - camera.position.z) * 0.08;
      }

      controls.target.x += (currentTarget.x - controls.target.x) * 0.08;
      controls.target.y += (currentTarget.y - controls.target.y) * 0.08;
      controls.target.z += (currentTarget.z - controls.target.z) * 0.08;

      controls.update();

      if (isRotating && activeSector === 'all') {
        masterGroup.rotation.y += 0.002;
      } else if (activeSector !== 'all') {
        masterGroup.rotation.y += (0 - masterGroup.rotation.y) * 0.05;
      }

      updateCamUI(camera.position.x, camera.position.y, camera.position.z);
    }

    // Animação das abelhas do meliponário
    for (let p of animParticles) {
      if (p.userData.orbitR) {
        p.userData.angle += 0.05;
        p.position.x = p.userData.cx + Math.cos(p.userData.angle) * p.userData.orbitR;
        p.position.z = p.userData.cz + Math.sin(p.userData.angle) * p.userData.orbitR;
      }
    }

    renderer.render(scene, camera);
  }

  // NAVEGAÇÃO ENTRE OS SETORES
  window.selectSector = function (sectorKey) {
    if (isFPMode) toggleFPMode(false);

    activeSector = sectorKey;
    const data = SECTOR_DATA[sectorKey] || SECTOR_DATA['all'];

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById('tab-' + sectorKey);
    if (btn) btn.classList.add('active');

    const titleEl = document.getElementById('viewer-title');
    const descEl = document.getElementById('viewer-desc');
    const badgeEl = document.getElementById('viewer-badge');
    const metaEl = document.getElementById('viewer-meta');

    if (titleEl) titleEl.textContent = data.title;
    if (descEl) descEl.textContent = data.desc;
    if (badgeEl) badgeEl.textContent = data.badge;
    if (metaEl) {
      metaEl.innerHTML = `<span>${data.meta}</span><span style="font-weight:700;letter-spacing:0.12em;color:#ffffff;">BORN TO BUILD &gt;&gt;&gt;</span>`;
    }

    cameraTargetPos = { x: data.camPos.x, y: data.camPos.y, z: data.camPos.z };
    currentTarget = { x: data.lookAt.x, y: data.lookAt.y, z: data.lookAt.z };

    Object.keys(zoneHighlights).forEach(key => {
      const grp = zoneHighlights[key];
      if (!grp) return;
      if (sectorKey === 'all' || sectorKey === key) {
        grp.traverse(child => {
          if (child.isMesh && child.material) {
            child.material.opacity = child.material.userData_origOpacity || child.material.opacity;
            child.visible = true;
          }
        });
      } else {
        grp.traverse(child => {
          if (child.isMesh && child.material) {
            if (!child.material.userData_origOpacity) {
              child.material.userData_origOpacity = child.material.opacity;
            }
            child.material.transparent = true;
            child.material.opacity = 0.35;
          }
        });
      }
    });
  };

  
  window.toggleLights = function () {
    isLightsOn = !isLightsOn;
    housePointLights.forEach(p => {
      p.intensity = isLightsOn ? (p.userData.origInt || 0.8) : 0.0;
    });
    if (ambientLightObj) {
      ambientLightObj.intensity = isLightsOn ? 0.95 : 0.22;
    }
    if (sunLightObj) {
      sunLightObj.intensity = isLightsOn ? 1.4 : 0.25;
    }
    masterGroup.traverse(node => {
      if (node.isPointLight && node.userData && node.userData.origInt) {
        node.intensity = isLightsOn ? node.userData.origInt : 0.0;
      }
    });
    const btn = document.getElementById('btn-lights');
    if (btn) {
      btn.classList.toggle('active', isLightsOn);
      btn.innerHTML = isLightsOn ? 'Luzes: ON' : 'Luzes: OFF';
    }
    const touchBtn = document.getElementById('fp-touch-light');
    if (touchBtn) {
      touchBtn.innerHTML = isLightsOn ? 'Luz: ON' : 'Luz: OFF';
    }
    const hudRoom = document.getElementById('fp-zone-name');
    if (hudRoom && isFPMode) {
      const clean = hudRoom.textContent.replace(/ \[(ON|OFF|Luz ON|Luz OFF)\]/g, '');
      hudRoom.textContent = clean + (isLightsOn ? ' [Luz ON]' : ' [Luz OFF]');
    }
    return isLightsOn;
  };

  window.toggleRoof = function () {
    showRoof = !showRoof;
    if (roofGroup) roofGroup.visible = showRoof;
    const btn = document.getElementById('btn-roof');
    if (btn) btn.classList.toggle('active', showRoof);
  };

  window.toggleRotation = function () {
    if (isFPMode) return;
    isRotating = !isRotating;
    const btn = document.getElementById('btn-rot');
    if (btn) btn.classList.toggle('active', isRotating);
  };

  window.toggleWireframe = function () {
    isWire = !isWire;
    masterGroup.traverse(child => {
      if (child.isMesh && child.material) {
        child.material.wireframe = isWire;
      }
    });
    const btn = document.getElementById('btn-wire');
    if (btn) btn.classList.toggle('active', isWire);
  };

  window.resetCamera = function () {
    if (isFPMode) toggleFPMode(false);
    selectSector('all');
  };

  window.setCameraView = function (viewType) {
    if (isFPMode) toggleFPMode(false);
    if (viewType === 'top') {
      cameraTargetPos = { x: 0, y: 38, z: 15.65 };
      currentTarget = { x: 0, y: 0, z: 15.625 };
    } else if (viewType === 'iso') {
      cameraTargetPos = { x: 18, y: 22, z: 36 };
      currentTarget = { x: 0, y: 1.2, z: 15.6 };
    } else if (viewType === 'front') {
      cameraTargetPos = { x: 0, y: 5.5, z: -8.0 };
      currentTarget = { x: 0, y: 1.5, z: 6.0 };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMicroproperty3D);
  } else {
    initMicroproperty3D();
  }
})();
