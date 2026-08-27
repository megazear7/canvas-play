const THREE_VERSION = '0.185.1';
const THREE_URL = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/build/three.module.js`;
const GLTF_LOADER_URL = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/examples/jsm/loaders/GLTFLoader.js`;
const MAP_CONTROLS_URL = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/examples/jsm/controls/MapControls.js`;
const SKELETON_UTILS_URL = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/examples/jsm/utils/SkeletonUtils.js`;
const KNIGHT_WALK_URL = '/images/knight/knight-walking.glb';
const KNIGHT_RUN_URL = '/images/knight/knight-running.glb';
const KNIGHT_IDLE_URL = '/images/knight/knight-alert.glb';
const KNIGHT_ATTACK_URL = '/images/knight/knight-attack.glb';
const KNIGHT_PORTRAIT_URL = '/images/knight/knight.png';
const ORC_LOOK_URL = '/images/orc/orc-look-around.glb';
const ORC_DEAD_URL = '/images/orc/orc-dead.glb';
const ORC_PORTRAIT_URL = '/images/orc/orc.png';
const SWISH_URLS = [1, 2, 3, 4].map((i) => `/sounds/sword/swish-${i}.mp3`);
const ROAR_URLS = [1, 2, 3, 4, 5, 6, 7].map((i) => `/sounds/orc/roar-${i}.mp3`);
const DEATH_URLS = [1, 2, 3, 4].map((i) => `/sounds/orc-death/death-${i}.wav`);
const STEPS_URL = '/sounds/steps/steps.mp3';
const WALK_URL = '/sounds/knight/walking.mp3';
const SERVICE_URL = '/sounds/knight/at-your-service.wav';
const AMBIENCE_URL = '/sounds/ambiance/field.wav';

export default class CpgKnight extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = `
      <style>
        :host {
          position: fixed;
          inset: 0;
          display: block;
        }
        canvas {
          position: absolute;
          inset: 0;
          display: block;
          width: 100%;
          height: 100%;
        }
        .loader {
          position: absolute;
          inset: 0;
          z-index: 40;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          background: radial-gradient(ellipse at 50% 38%, #1b2b20 0%, #0a100d 72%);
          color: #eef4ee;
          transition: opacity 0.55s ease, visibility 0.55s ease;
        }
        .loader.hidden {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
        .loader-mark {
          position: relative;
          width: 96px;
          height: 96px;
          display: grid;
          place-items: center;
        }
        .loader-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid rgba(57, 255, 106, 0.14);
          border-top-color: #39ff6a;
          animation: loader-spin 0.85s linear infinite;
        }
        .loader-crest {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          overflow: hidden;
          background: #2a312c;
          box-shadow:
            0 0 0 1px rgba(57, 255, 106, 0.35),
            0 10px 28px rgba(0, 0, 0, 0.35);
          animation: loader-pulse 1.6s ease-in-out infinite;
        }
        .loader-crest img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 50% 8%;
          transform: scale(1.85);
          transform-origin: 50% 10%;
        }
        .loader-title {
          font: 650 12px/1 ui-sans-serif, system-ui, sans-serif;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #39ff6a;
        }
        .loader-bar {
          width: min(280px, 70vw);
          height: 4px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
        }
        .loader-fill {
          height: 100%;
          width: 8%;
          border-radius: inherit;
          background: linear-gradient(90deg, #1f8a3a, #39ff6a);
          transition: width 0.28s ease;
        }
        .loader-copy {
          font: 400 14px/1.35 ui-sans-serif, system-ui, sans-serif;
          color: rgba(255, 255, 255, 0.72);
          min-height: 1.2em;
        }
        @keyframes loader-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes loader-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        .marquee {
          position: absolute;
          z-index: 25;
          display: none;
          border: 1px solid rgba(57, 255, 106, 0.9);
          background: rgba(57, 255, 106, 0.12);
          pointer-events: none;
        }
        .toast-stack {
          position: absolute;
          left: 50%;
          bottom: 28px;
          z-index: 30;
          width: 620px;
          height: 140px;
          transform: translateX(-50%);
          pointer-events: none;
        }
        .toast-stack:has(.toast) {
          pointer-events: auto;
        }
        .toast {
          position: absolute;
          left: 50%;
          bottom: 0;
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 268px;
          padding: 10px 46px 10px 10px;
          border-radius: 22px;
          color: #f4f7f4;
          background:
            linear-gradient(180deg, rgba(22, 28, 24, 0.94), rgba(9, 12, 11, 0.9));
          border: 1px solid rgba(57, 255, 106, 0.32);
          box-shadow:
            0 22px 60px rgba(0, 0, 0, 0.38),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset,
            0 0 28px rgba(57, 255, 106, 0.1);
          backdrop-filter: blur(18px) saturate(1.2);
          -webkit-backdrop-filter: blur(18px) saturate(1.2);
          transform: translateX(-50%) translate(calc(var(--i, 0) * 14px), calc(var(--i, 0) * -10px)) rotate(calc(var(--i, 0) * -6deg));
          opacity: 1;
          pointer-events: auto;
          transition: transform 0.42s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: calc(5 - var(--i, 0));
        }
        .toast-stack.multi:hover .toast {
          transform: translateX(-50%) translateX(calc((var(--i, 0) - 0.5) * 300px)) rotate(0deg);
        }
        .toast.enemy {
          border-color: rgba(255, 72, 72, 0.55);
          box-shadow:
            0 22px 60px rgba(0, 0, 0, 0.38),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset,
            0 0 28px rgba(255, 64, 64, 0.18);
        }
        .toast.enemy .toast-label {
          color: #ff5a5a;
        }
        .toast.enemy .toast-portrait-wrap {
          box-shadow:
            0 0 0 1px rgba(255, 72, 72, 0.5),
            0 8px 18px rgba(0, 0, 0, 0.28);
        }
        .toast-portrait-wrap {
          width: 72px;
          height: 72px;
          border-radius: 16px;
          overflow: hidden;
          flex-shrink: 0;
          background: #2a312c;
          box-shadow:
            0 0 0 1px rgba(57, 255, 106, 0.35),
            0 8px 18px rgba(0, 0, 0, 0.28);
        }
        .toast-portrait {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 50% 8%;
          transform: scale(1.85);
          transform-origin: 50% 10%;
        }
        .toast-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-right: 8px;
        }
        .toast-label {
          font: 600 10px/1 ui-sans-serif, system-ui, sans-serif;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #39ff6a;
        }
        .toast-name {
          font: 650 22px/1.1 ui-sans-serif, system-ui, sans-serif;
          letter-spacing: -0.03em;
        }
        .toast-close {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.86);
          cursor: pointer;
          transition: background 0.18s ease, transform 0.18s ease;
        }
        .toast-close:hover {
          background: rgba(255, 255, 255, 0.16);
          transform: scale(1.06);
        }
        .toast-close:active {
          transform: scale(0.96);
        }
      </style>
      <canvas></canvas>
      <div class="marquee"></div>
      <div class="loader">
        <div class="loader-mark">
          <div class="loader-ring"></div>
          <div class="loader-crest">
            <img src="${KNIGHT_PORTRAIT_URL}" alt="">
          </div>
        </div>
        <div class="loader-title">The Field</div>
        <div class="loader-bar"><div class="loader-fill"></div></div>
        <div class="loader-copy">Preparing the field…</div>
      </div>
      <div class="toast-stack"></div>
    `;
    this.canvas = this.shadow.querySelector('canvas');
    this.loaderEl = this.shadow.querySelector('.loader');
    this.loaderFill = this.shadow.querySelector('.loader-fill');
    this.loaderCopy = this.shadow.querySelector('.loader-copy');
    this.toastStack = this.shadow.querySelector('.toast-stack');
    this.marqueeEl = this.shadow.querySelector('.marquee');
    this.rafId = null;
    this.clock = null;
    this.facingOffset = 0;
    this.attackRange = 1.9;
    this.keys = {};
    this.audioCtx = null;
    this.audioBuffers = new Map();
    this.moveSoundKind = null;
    this.moveSource = null;
    this.moveGain = null;
    this.ambienceSource = null;
    this.obstacles = [];
    this.knightRadius = 0.55;
    this.orcRadius = 0.78;
    this.assetsReady = false;
    this.loaderStep = 0;
    this.loaderSteps = 7;
    this.knights = [];
    this.orcs = [];
    this.selectedKnights = [];
    this.selectedEnemy = null;
    this.knightTemplate = null;
    this.orcTemplate = null;
    this.knightClips = {};
    this.orcClips = {};
    this.knightGroundY = 0;
    this.orcGroundY = 0;
    this.pointerDown = null;
    this.dragBox = null;
    this.SkeletonUtils = null;
  }

  connectedCallback() {
    this.pathRadius = parseFloat(this.getAttribute('path-radius')) || 4;
    this.walkSpeed = parseFloat(this.getAttribute('walk-speed')) || 1.15;
    this.runSpeed = parseFloat(this.getAttribute('run-speed')) || 4.2;
    this.panSpeed = parseFloat(this.getAttribute('pan-speed')) || 8;
    this.init();
  }

  disconnectedCallback() {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.onPointerDown);
      this.canvas.removeEventListener('pointermove', this.onPointerMove);
      this.canvas.removeEventListener('pointerup', this.onPointerUp);
    }
    this.setMoveSound(null);
    if (this.ambienceSource) {
      try {
        this.ambienceSource.stop();
      } catch (err) {
        // already stopped
      }
      this.ambienceSource = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  async init() {
    try {
      await this.ensureImportMap();
      const THREE = await import(THREE_URL);
      const { GLTFLoader } = await import(GLTF_LOADER_URL);
      const { MapControls } = await import(MAP_CONTROLS_URL);
      const SkeletonUtils = await import(SKELETON_UTILS_URL);
      this.THREE = THREE;
      this.SkeletonUtils = SkeletonUtils;

      this.setupScene(THREE, MapControls);
      this.setupSelection(THREE);
      this.setupCameraKeys();
      this.setupAudio();
      this.clock = new THREE.Clock();
      this.onResize = this.onResize.bind(this);
      window.addEventListener('resize', this.onResize);
      this.loop();
      this.setLoader('Loading knight…', 0.04);
      await this.loadKnightAssets(THREE, GLTFLoader);
      this.advanceLoader('Loading animations…');
      await this.loadExtraClips(GLTFLoader);
      this.spawnKnights();
      this.setLoader('Loading orc…');
      await this.loadOrcAssets(THREE, GLTFLoader);
      this.spawnOrcs();
      this.advanceLoader('Loading sounds…');
      await this.preloadSounds();
      this.addBushes(THREE);
      this.assetsReady = true;
      this.hideLoader();
    } catch (err) {
      console.error(err);
      this.setLoader('Could not load the scene.');
    }
  }

  setLoader(label, fraction) {
    if (label && this.loaderCopy) {
      this.loaderCopy.textContent = label;
    }
    if (typeof fraction === 'number' && this.loaderFill) {
      const pct = Math.max(0, Math.min(1, fraction));
      this.loaderFill.style.width = `${Math.round(pct * 100)}%`;
    }
  }

  advanceLoader(label) {
    this.loaderStep = Math.min(this.loaderSteps, this.loaderStep + 1);
    this.setLoader(label, this.loaderStep / this.loaderSteps);
  }

  hideLoader() {
    this.setLoader('Ready', 1);
    if (!this.loaderEl) {
      return;
    }
    this.loaderEl.classList.add('hidden');
    setTimeout(() => {
      if (this.loaderEl) {
        this.loaderEl.remove();
        this.loaderEl = null;
      }
    }, 600);
  }

  ensureImportMap() {
    if (document.querySelector('script[type="importmap"]')) {
      return;
    }
    const script = document.createElement('script');
    script.type = 'importmap';
    script.textContent = JSON.stringify({
      imports: {
        three: THREE_URL,
        'three/addons/': `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/examples/jsm/`
      }
    });
    const firstModule = document.querySelector('script[type="module"]');
    if (firstModule) {
      firstModule.parentNode.insertBefore(script, firstModule);
    } else {
      document.head.appendChild(script);
    }
  }

  setupScene(THREE, MapControls) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 40, 90);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    this.camera.position.set(7, 7.2, 11);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.controls = new MapControls(this.camera, this.canvas);
    this.controls.target.set(0, 0.7, 0);
    this.controls.enableDamping = true;
    this.controls.enableRotate = false;
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 28;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.12;
    this.controls.mouseButtons.LEFT = -1;
    this.controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
    this.controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
    this.controls.update();

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    this.scene.add(new THREE.HemisphereLight(0xe8f4ff, 0x3d6b2f, 1.4));

    const sun = new THREE.DirectionalLight(0xfff4d6, 2.8);
    sun.position.set(8, 14, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 40;
    sun.shadow.camera.left = -12;
    sun.shadow.camera.right = 12;
    sun.shadow.camera.top = 12;
    sun.shadow.camera.bottom = -12;
    this.scene.add(sun);

    const fill = new THREE.DirectionalLight(0xcfe8ff, 1.1);
    fill.position.set(-6, 5, -4);
    this.scene.add(fill);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({
        color: 0x3d9b4a,
        roughness: 0.92,
        metalness: 0.0
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  setupSelection(THREE) {
    this.raycaster = new THREE.Raycaster();
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
  }

  setupCameraKeys() {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  setupAudio() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new Ctx();
    this.audioBuffers = new Map();
  }

  async preloadSounds() {
    const urls = [...SWISH_URLS, ...ROAR_URLS, ...DEATH_URLS, STEPS_URL, WALK_URL, SERVICE_URL, AMBIENCE_URL];
    let loaded = 0;
    await Promise.all(urls.map(async (url) => {
      try {
        const response = await fetch(url);
        const data = await response.arrayBuffer();
        const buffer = await this.audioCtx.decodeAudioData(data.slice(0));
        this.audioBuffers.set(url, buffer);
      } catch (err) {
        console.error('Failed to load sound', url, err);
      } finally {
        loaded += 1;
        const base = this.loaderStep / this.loaderSteps;
        this.setLoader(`Loading sounds… ${loaded}/${urls.length}`, base + (loaded / urls.length) / this.loaderSteps);
      }
    }));
    this.advanceLoader('Ready');
  }

  unlockAudio() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  startAmbience() {
    if (this.ambienceSource || !this.audioCtx || this.audioCtx.state === 'suspended') {
      return;
    }
    const played = this.playBuffer(AMBIENCE_URL, { loop: true, volume: 0.38 });
    if (played) {
      this.ambienceSource = played.source;
    }
  }

  onKeyDown(event) {
    this.unlockAudio();
    this.keys[event.code] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
      event.preventDefault();
    }
  }

  onKeyUp(event) {
    this.keys[event.code] = false;
  }

  allUnits() {
    return [...this.knights, ...this.orcs];
  }

  makeRing(color) {
    const THREE = this.THREE;
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.48, 0.68, 48),
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.04;
    ring.visible = false;
    this.scene.add(ring);
    return ring;
  }

  prepareSkinnedModel(model) {
    const meshes = [];
    const materials = [];
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        meshes.push(child);
        if (child.material) {
          const list = Array.isArray(child.material) ? child.material : [child.material];
          list.forEach((material) => {
            material.metalness = 0.15;
            material.roughness = 0.65;
            if (material.emissive) {
              material.emissiveIntensity = 0.08;
            }
            material.needsUpdate = true;
            materials.push({
              material,
              emissiveIntensity: material.emissiveIntensity
            });
          });
        }
      }
    });
    const box = new this.THREE.Box3().setFromObject(model);
    model.position.y -= box.min.y;
    return { meshes, materials, groundY: model.position.y };
  }

  bindClips(mixer, clips) {
    const actions = {};
    Object.keys(clips).forEach((name) => {
      if (clips[name]) {
        actions[name] = mixer.clipAction(clips[name]);
      }
    });
    return actions;
  }

  createUnit({ kind, model, clips, x, z, radius, mode, pathAngle = 0 }) {
    const { meshes, materials, groundY } = this.prepareSkinnedModel(model);
    model.position.x = x;
    model.position.z = z;
    model.position.y = groundY;
    this.scene.add(model);
    const mixer = new this.THREE.AnimationMixer(model);
    const unit = {
      kind,
      model,
      mixer,
      actions: this.bindClips(mixer, clips),
      currentAction: null,
      meshes,
      materials,
      radius,
      mode,
      target: null,
      waypoints: [],
      selected: false,
      ring: this.makeRing(kind === 'knight' ? 0x39ff6a : 0xff5a5a),
      pathAngle,
      pathRadius: this.pathRadius,
      dead: false,
      attackElapsed: 0,
      attackHit: false,
      swishPlayed: false,
      chaseTarget: null,
      groundY
    };
    mixer.addEventListener('finished', (event) => {
      if (event.action === unit.actions.attack && unit.mode === 'attack') {
        unit.mode = 'hold';
        unit.chaseTarget = null;
        this.playAction(unit, 'idle');
      }
    });
    if (kind === 'knight') {
      this.playAction(unit, mode === 'patrol' ? 'walk' : 'idle');
    } else {
      this.playAction(unit, 'look');
    }
    unit.mixer.update(0);
    unit.model.updateMatrixWorld(true);
    return unit;
  }

  spawnKnights() {
    const clone = () => this.SkeletonUtils.clone(this.knightTemplate);
    this.knights.push(this.createUnit({
      kind: 'knight',
      model: clone(),
      clips: this.knightClips,
      x: Math.cos(0) * this.pathRadius,
      z: Math.sin(0) * this.pathRadius,
      radius: this.knightRadius,
      mode: 'patrol',
      pathAngle: 0
    }));
    this.knights.push(this.createUnit({
      kind: 'knight',
      model: clone(),
      clips: this.knightClips,
      x: Math.cos(Math.PI) * this.pathRadius,
      z: Math.sin(Math.PI) * this.pathRadius,
      radius: this.knightRadius,
      mode: 'patrol',
      pathAngle: Math.PI
    }));
  }

  spawnOrcs() {
    for (let i = 0; i < 3; i++) {
      const spot = this.findClearSpot(this.orcRadius, 1.6);
      const model = this.SkeletonUtils.clone(this.orcTemplate);
      const orc = this.createUnit({
        kind: 'orc',
        model,
        clips: this.orcClips,
        x: spot.x,
        z: spot.z,
        radius: this.orcRadius,
        mode: 'look'
      });
      orc.model.rotation.y = Math.random() * Math.PI * 2;
      this.orcs.push(orc);
    }
  }

  findClearSpot(radius, pad = 1.4) {
    for (let i = 0; i < 100; i++) {
      const x = (Math.random() - 0.5) * 14;
      const z = (Math.random() - 0.5) * 14;
      if (Math.hypot(x, z) > 7.6) {
        continue;
      }
      if (!this.overlapsWorld(x, z, radius, pad)) {
        return { x, z };
      }
    }
    return { x: 6.5, z: -5.5 };
  }

  overlapsWorld(x, z, radius, pad) {
    for (const unit of this.allUnits()) {
      if (Math.hypot(x - unit.model.position.x, z - unit.model.position.z) < radius + unit.radius + pad) {
        return true;
      }
    }
    for (const o of this.obstacles) {
      if (Math.hypot(x - o.x, z - o.z) < radius + o.r + pad) {
        return true;
      }
    }
    for (const knight of this.knights) {
      if (knight.mode === 'patrol' && Math.abs(Math.hypot(x, z) - knight.pathRadius) < radius + this.knightRadius + 0.55) {
        return true;
      }
    }
    return false;
  }

  setUnitSelected(unit, selected) {
    unit.selected = selected;
    unit.ring.visible = selected;
    unit.materials.forEach(({ material, emissiveIntensity }) => {
      material.emissiveIntensity = selected
        ? Math.max(emissiveIntensity, 0.12) + 0.55
        : emissiveIntensity;
    });
  }

  clearEnemySelection() {
    if (this.selectedEnemy) {
      this.setUnitSelected(this.selectedEnemy, false);
      this.selectedEnemy = null;
    }
  }

  selectKnights(knights, { playVoice = true } = {}) {
    this.clearEnemySelection();
    this.knights.forEach((knight) => {
      this.setUnitSelected(knight, knights.includes(knight));
    });
    this.selectedKnights = knights.slice();
    if (playVoice && knights.length) {
      this.playBuffer(SERVICE_URL, { volume: 1 });
    }
    this.refreshToasts();
  }

  selectEnemy(orc) {
    if (this.selectedKnights.length) {
      return;
    }
    this.knights.forEach((knight) => this.setUnitSelected(knight, false));
    this.selectedKnights = [];
    if (this.selectedEnemy && this.selectedEnemy !== orc) {
      this.setUnitSelected(this.selectedEnemy, false);
    }
    this.selectedEnemy = orc;
    this.setUnitSelected(orc, true);
    if (!orc.dead) {
      this.playRandom(ROAR_URLS, 1);
    }
    this.refreshToasts();
  }

  deselectAll() {
    this.knights.forEach((knight) => this.setUnitSelected(knight, false));
    this.selectedKnights = [];
    this.clearEnemySelection();
    this.refreshToasts();
  }

  deselectUnit(unit) {
    if (unit.kind === 'knight') {
      this.selectKnights(this.selectedKnights.filter((k) => k !== unit), { playVoice: false });
      return;
    }
    if (this.selectedEnemy === unit) {
      this.clearEnemySelection();
      this.refreshToasts();
    }
  }

  makeToastCard(kind, unit) {
    const isOrc = kind === 'orc';
    const toast = document.createElement('div');
    toast.className = isOrc ? 'toast enemy' : 'toast';
    toast.innerHTML = `
      <div class="toast-portrait-wrap">
        <img class="toast-portrait" src="${isOrc ? ORC_PORTRAIT_URL : KNIGHT_PORTRAIT_URL}" alt="${isOrc ? 'Enemy' : 'Knight'}">
      </div>
      <div class="toast-meta">
        <div class="toast-label">${isOrc ? 'Enemy' : 'Selected'}</div>
        <div class="toast-name">${isOrc ? 'Enemy' : 'Knight'}</div>
      </div>
      <button class="toast-close" type="button" aria-label="Deselect">
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      </button>
    `;
    toast.querySelector('.toast-close').addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.deselectUnit(unit);
    });
    return toast;
  }

  refreshToasts() {
    this.toastStack.innerHTML = '';
    if (this.selectedEnemy) {
      this.toastStack.classList.remove('multi');
      const card = this.makeToastCard('orc', this.selectedEnemy);
      card.style.setProperty('--i', 0);
      this.toastStack.appendChild(card);
      return;
    }
    this.toastStack.classList.toggle('multi', this.selectedKnights.length > 1);
    this.selectedKnights.forEach((knight, i) => {
      const card = this.makeToastCard('knight', knight);
      card.style.setProperty('--i', i);
      this.toastStack.appendChild(card);
    });
  }

  screenPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      nx: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      ny: -((event.clientY - rect.top) / rect.height) * 2 + 1
    };
  }

  unitScreenPos(unit) {
    const v = new this.THREE.Vector3();
    v.copy(unit.model.position);
    v.y += 0.9;
    v.project(this.camera);
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (v.x * 0.5 + 0.5) * rect.width,
      y: (-v.y * 0.5 + 0.5) * rect.height
    };
  }

  hitUnit(event, units) {
    const p = this.screenPoint(event);
    this.raycaster.setFromCamera(new this.THREE.Vector2(p.nx, p.ny), this.camera);
    let best = null;
    let bestDist = Infinity;
    for (const unit of units) {
      unit.model.updateMatrixWorld(true);
      const hits = this.raycaster.intersectObject(unit.model, true);
      if (hits.length && hits[0].distance < bestDist) {
        best = unit;
        bestDist = hits[0].distance;
      }
    }
    if (best) {
      return best;
    }
    let bestScreen = 42;
    for (const unit of units) {
      const s = this.unitScreenPos(unit);
      const dist = Math.hypot(s.x - p.x, s.y - p.y);
      if (dist < bestScreen) {
        best = unit;
        bestScreen = dist;
      }
    }
    return best;
  }

  updateMarquee(a, b) {
    const left = Math.min(a.x, b.x);
    const top = Math.min(a.y, b.y);
    const width = Math.abs(a.x - b.x);
    const height = Math.abs(a.y - b.y);
    this.marqueeEl.style.display = 'block';
    this.marqueeEl.style.left = `${left}px`;
    this.marqueeEl.style.top = `${top}px`;
    this.marqueeEl.style.width = `${width}px`;
    this.marqueeEl.style.height = `${height}px`;
  }

  hideMarquee() {
    this.marqueeEl.style.display = 'none';
  }

  knightsInBox(a, b) {
    const left = Math.min(a.x, b.x);
    const right = Math.max(a.x, b.x);
    const top = Math.min(a.y, b.y);
    const bottom = Math.max(a.y, b.y);
    return this.knights.filter((knight) => {
      const p = this.unitScreenPos(knight);
      return p.x >= left && p.x <= right && p.y >= top && p.y <= bottom;
    });
  }

  onPointerDown(event) {
    this.unlockAudio();
    const p = this.screenPoint(event);
    const knight = this.hitUnit(event, this.knights);
    const orc = knight ? null : this.hitUnit(event, this.orcs);
    this.pointerDown = { x: p.x, y: p.y, clientX: event.clientX, clientY: event.clientY, knight, orc };
    this.dragBox = null;
    if (!knight && !orc) {
      this.controls.enabled = false;
    }
  }

  onPointerMove(event) {
    if (!this.pointerDown || this.pointerDown.knight || this.pointerDown.orc) {
      return;
    }
    const p = this.screenPoint(event);
    const dx = p.x - this.pointerDown.x;
    const dy = p.y - this.pointerDown.y;
    if (!this.dragBox && dx * dx + dy * dy > 36) {
      this.dragBox = { start: { x: this.pointerDown.x, y: this.pointerDown.y } };
    }
    if (this.dragBox) {
      this.dragBox.current = { x: p.x, y: p.y };
      this.updateMarquee(this.dragBox.start, this.dragBox.current);
    }
  }

  onPointerUp(event) {
    this.controls.enabled = true;
    if (!this.pointerDown || !this.assetsReady) {
      this.hideMarquee();
      this.pointerDown = null;
      this.dragBox = null;
      return;
    }

    if (this.dragBox) {
      const knights = this.knightsInBox(this.dragBox.start, this.dragBox.current);
      if (knights.length) {
        this.selectKnights(knights);
      } else {
        this.deselectAll();
      }
      this.hideMarquee();
      this.pointerDown = null;
      this.dragBox = null;
      return;
    }

    const dx = event.clientX - this.pointerDown.clientX;
    const dy = event.clientY - this.pointerDown.clientY;
    const start = this.pointerDown;
    this.pointerDown = null;
    if (dx * dx + dy * dy > 16) {
      return;
    }

    if (start.knight) {
      this.selectKnights([start.knight]);
      return;
    }
    if (start.orc) {
      if (this.selectedKnights.length) {
        this.commandAttack(start.orc);
      } else {
        this.selectEnemy(start.orc);
      }
      return;
    }

    if (!this.selectedKnights.length) {
      this.deselectAll();
      return;
    }

    const p = this.screenPoint(event);
    this.raycaster.setFromCamera(new this.THREE.Vector2(p.nx, p.ny), this.camera);
    const point = new this.THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.groundPlane, point)) {
      this.commandMove(point.x, point.z);
    }
  }

  commandMove(x, z) {
    const selected = this.selectedKnights;
    selected.forEach((knight, i) => {
      const spread = selected.length > 1 ? 0.95 : 0;
      const angle = (i / selected.length) * Math.PI * 2 + 0.2;
      this.runTo(knight, x + Math.cos(angle) * spread, z + Math.sin(angle) * spread);
    });
  }

  commandAttack(orc) {
    if (orc.dead) {
      return;
    }
    this.selectedKnights.forEach((knight) => this.startChase(knight, orc));
  }

  runTo(unit, x, z) {
    if (unit.mode === 'attack') {
      return;
    }
    unit.target = { x, z };
    unit.chaseTarget = null;
    unit.mode = 'run';
    unit.waypoints = this.buildPath(unit, x, z);
    this.playAction(unit, 'run');
  }

  startChase(unit, orc) {
    if (orc.dead || unit.mode === 'attack') {
      return;
    }
    unit.chaseTarget = orc;
    unit.mode = 'chase';
    unit.waypoints = this.buildPath(unit, orc.model.position.x, orc.model.position.z, { ignoreUnit: orc });
    this.playAction(unit, 'run');
  }

  startAttack(unit, orc) {
    unit.mode = 'attack';
    unit.chaseTarget = orc;
    unit.attackElapsed = 0;
    unit.attackHit = false;
    unit.swishPlayed = false;
    const dx = orc.model.position.x - unit.model.position.x;
    const dz = orc.model.position.z - unit.model.position.z;
    unit.model.rotation.y = Math.atan2(dx, dz) + this.facingOffset;
    this.playAction(unit, 'attack');
  }

  killOrc(orc) {
    if (orc.dead) {
      return;
    }
    orc.dead = true;
    orc.mode = 'dead';
    this.playAction(orc, 'dead');
    this.playRandom(DEATH_URLS, 1);
    this.knights.forEach((knight) => {
      if (knight.chaseTarget === orc && knight.mode !== 'attack') {
        knight.chaseTarget = null;
        knight.waypoints = [];
        knight.target = null;
        knight.mode = 'hold';
        this.playAction(knight, 'idle');
      }
    });
  }

  playBuffer(url, { loop = false, volume = 1, delay = 0, fadeIn = 0 } = {}) {
    this.unlockAudio();
    const buffer = this.audioBuffers.get(url);
    if (!this.audioCtx || !buffer) {
      return null;
    }
    const source = this.audioCtx.createBufferSource();
    const gain = this.audioCtx.createGain();
    source.buffer = buffer;
    source.loop = loop;
    const startAt = this.audioCtx.currentTime + delay;
    if (fadeIn > 0) {
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.linearRampToValueAtTime(volume, startAt + fadeIn);
    } else {
      gain.gain.value = volume;
    }
    source.connect(gain);
    gain.connect(this.audioCtx.destination);
    source.start(startAt);
    return { source, gain };
  }

  playRandom(urls, volume = 1, delay = 0) {
    const url = urls[Math.floor(Math.random() * urls.length)];
    this.playBuffer(url, { volume, delay });
  }

  fadeOutSource(source, gain, fade = 0.32) {
    if (!source) {
      return;
    }
    const now = this.audioCtx ? this.audioCtx.currentTime : 0;
    if (gain && this.audioCtx) {
      const current = Math.max(gain.gain.value, 0.0001);
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(current, now);
      gain.gain.linearRampToValueAtTime(0.0001, now + fade);
    }
    setTimeout(() => {
      try {
        source.stop();
      } catch (err) {
        // already stopped
      }
    }, fade * 1000 + 40);
  }

  setMoveSound(kind) {
    if (kind === this.moveSoundKind) {
      return;
    }
    this.moveSoundKind = kind;
    this.fadeOutSource(this.moveSource, this.moveGain, 0.32);
    this.moveSource = null;
    this.moveGain = null;
    if (!kind) {
      return;
    }
    const url = kind === 'run' ? STEPS_URL : WALK_URL;
    const volume = kind === 'run' ? 0.72 : 0.58;
    const played = this.playBuffer(url, { loop: true, volume, fadeIn: 0.28 });
    if (played) {
      this.moveSource = played.source;
      this.moveGain = played.gain;
    } else {
      this.moveSoundKind = null;
    }
  }

  syncMoveSound() {
    let kind = null;
    if (this.knights.some((k) => k.mode === 'run' || k.mode === 'chase')) {
      kind = 'run';
    } else if (this.knights.some((k) => k.mode === 'patrol')) {
      kind = 'walk';
    }
    this.setMoveSound(kind);
  }

  playAction(unit, name) {
    const THREE = this.THREE;
    const next = unit.actions[name] || unit.actions.walk || unit.actions.look;
    if (!next || next === unit.currentAction) {
      return;
    }
    const once = name === 'attack' || name === 'dead';
    next.reset();
    next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
    next.clampWhenFinished = once;
    next.setEffectiveWeight(1);
    next.play();
    if (unit.currentAction) {
      unit.currentAction.crossFadeTo(next, once ? 0.08 : 0.18, false);
    }
    unit.currentAction = next;
  }

  addBushes(THREE) {
    this.obstacles = [];
    const geometry = new THREE.SphereGeometry(1, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x1a8a32,
      roughness: 0.88,
      metalness: 0.0
    });
    const count = 6;
    let attempts = 0;
    while (this.obstacles.length < count && attempts < 140) {
      attempts += 1;
      const r = 0.58 + Math.random() * 0.42;
      const x = (Math.random() - 0.5) * 16;
      const z = (Math.random() - 0.5) * 16;
      if (Math.hypot(x, z) > 8.2 || this.overlapsWorld(x, z, r, 1.45)) {
        continue;
      }
      const bush = new THREE.Mesh(geometry, material);
      bush.position.set(x, 0, z);
      bush.scale.setScalar(r);
      bush.castShadow = true;
      bush.receiveShadow = true;
      this.scene.add(bush);
      this.obstacles.push({ x, z, r, mesh: bush });
    }
  }

  isBlocked(x, z, { ignoreUnit = null, ignoreTarget = null, radius = this.knightRadius } = {}) {
    for (const o of this.obstacles) {
      if (Math.hypot(x - o.x, z - o.z) < o.r + radius + 0.12) {
        return true;
      }
    }
    for (const unit of this.allUnits()) {
      if (unit === ignoreUnit || unit === ignoreTarget || unit.dead) {
        continue;
      }
      if (Math.hypot(x - unit.model.position.x, z - unit.model.position.z) < unit.radius + radius + 0.08) {
        return true;
      }
    }
    return false;
  }

  lineClear(ax, az, bx, bz, opts) {
    const dist = Math.hypot(bx - ax, bz - az);
    const steps = Math.max(2, Math.ceil(dist / 0.2));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (this.isBlocked(ax + (bx - ax) * t, az + (bz - az) * t, opts)) {
        return false;
      }
    }
    return true;
  }

  nudgeOutOfObstacles(x, z, radius) {
    for (let n = 0; n < 10; n++) {
      let moved = false;
      for (const o of this.obstacles) {
        const dx = x - o.x;
        const dz = z - o.z;
        const d = Math.hypot(dx, dz);
        const minD = radius + o.r + 0.1;
        if (d < minD) {
          const nx = d < 1e-5 ? 1 : dx / d;
          const nz = d < 1e-5 ? 0 : dz / d;
          x += nx * (minD - d);
          z += nz * (minD - d);
          moved = true;
        }
      }
      if (!moved) {
        break;
      }
    }
    return { x, z };
  }

  simplifyPath(points, opts) {
    if (points.length <= 2) {
      return points;
    }
    const out = [points[0]];
    let i = 0;
    while (i < points.length - 1) {
      let far = i + 1;
      for (let j = i + 2; j < points.length; j++) {
        if (this.lineClear(points[i].x, points[i].z, points[j].x, points[j].z, opts)) {
          far = j;
        } else {
          break;
        }
      }
      out.push(points[far]);
      i = far;
    }
    return out;
  }

  buildPath(unit, goalX, goalZ, extraOpts = {}) {
    const opts = { ignoreUnit: unit, radius: unit.radius, ...extraOpts };
    const start = { x: unit.model.position.x, z: unit.model.position.z };
    const goal = this.nudgeOutOfObstacles(goalX, goalZ, unit.radius);
    if (this.lineClear(start.x, start.z, goal.x, goal.z, opts)) {
      return [goal];
    }

    const cell = 0.45;
    const min = -12;
    const size = Math.round(24 / cell);
    const toIdx = (x, z) => {
      const i = Math.max(0, Math.min(size - 1, Math.round((x - min) / cell)));
      const j = Math.max(0, Math.min(size - 1, Math.round((z - min) / cell)));
      return [i, j];
    };
    const toWorld = (i, j) => ({ x: min + i * cell, z: min + j * cell });

    const blocked = new Uint8Array(size * size);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const w = toWorld(i, j);
        if (this.isBlocked(w.x, w.z, opts)) {
          blocked[i * size + j] = 1;
        }
      }
    }

    const nearestFree = (i, j) => {
      if (!blocked[i * size + j]) {
        return [i, j];
      }
      for (let radius = 1; radius < 14; radius++) {
        for (let di = -radius; di <= radius; di++) {
          for (let dj = -radius; dj <= radius; dj++) {
            const ni = i + di;
            const nj = j + dj;
            if (ni < 0 || nj < 0 || ni >= size || nj >= size) {
              continue;
            }
            if (!blocked[ni * size + nj]) {
              return [ni, nj];
            }
          }
        }
      }
      return [i, j];
    };

    let [si, sj] = nearestFree(...toIdx(start.x, start.z));
    let [gi, gj] = nearestFree(...toIdx(goal.x, goal.z));

    const open = [[si, sj]];
    const gScore = new Float32Array(size * size);
    gScore.fill(1e9);
    gScore[si * size + sj] = 0;
    const cameI = new Int16Array(size * size);
    const cameJ = new Int16Array(size * size);
    cameI.fill(-1);
    const inOpen = new Uint8Array(size * size);
    inOpen[si * size + sj] = 1;
    const heuristic = (i, j) => {
      const dx = Math.abs(i - gi);
      const dz = Math.abs(j - gj);
      return Math.max(dx, dz) + 0.414 * Math.min(dx, dz);
    };

    let found = false;
    while (open.length) {
      let best = 0;
      let bestF = Infinity;
      for (let n = 0; n < open.length; n++) {
        const [i, j] = open[n];
        const f = gScore[i * size + j] + heuristic(i, j);
        if (f < bestF) {
          bestF = f;
          best = n;
        }
      }
      const [ci, cj] = open.splice(best, 1)[0];
      inOpen[ci * size + cj] = 0;
      if (ci === gi && cj === gj) {
        found = true;
        break;
      }
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          if (!di && !dj) {
            continue;
          }
          const ni = ci + di;
          const nj = cj + dj;
          if (ni < 0 || nj < 0 || ni >= size || nj >= size) {
            continue;
          }
          if (blocked[ni * size + nj]) {
            continue;
          }
          if (di && dj && (blocked[(ci + di) * size + cj] || blocked[ci * size + (cj + dj)])) {
            continue;
          }
          const step = di && dj ? 1.414 : 1;
          const tentative = gScore[ci * size + cj] + step;
          const idx = ni * size + nj;
          if (tentative < gScore[idx]) {
            gScore[idx] = tentative;
            cameI[idx] = ci;
            cameJ[idx] = cj;
            if (!inOpen[idx]) {
              open.push([ni, nj]);
              inOpen[idx] = 1;
            }
          }
        }
      }
    }

    if (!found) {
      return [goal];
    }

    const rev = [];
    let ci = gi;
    let cj = gj;
    while (!(ci === si && cj === sj)) {
      rev.push(toWorld(ci, cj));
      const idx = ci * size + cj;
      const pi = cameI[idx];
      const pj = cameJ[idx];
      if (pi < 0) {
        break;
      }
      ci = pi;
      cj = pj;
    }
    rev.reverse();
    if (!rev.length || Math.hypot(rev[rev.length - 1].x - goal.x, rev[rev.length - 1].z - goal.z) > 0.2) {
      rev.push(goal);
    }
    return this.simplifyPath([start, ...rev], opts).slice(1);
  }

  followWaypoints(unit, dt, speed, arriveDist) {
    if (!unit.waypoints.length) {
      return true;
    }
    const wp = unit.waypoints[0];
    const dx = wp.x - unit.model.position.x;
    const dz = wp.z - unit.model.position.z;
    const dist = Math.hypot(dx, dz);
    const threshold = unit.waypoints.length === 1 ? arriveDist : 0.28;
    if (dist <= threshold) {
      unit.waypoints.shift();
      return unit.waypoints.length === 0;
    }
    const step = Math.min(speed * dt, dist);
    unit.model.position.x += (dx / dist) * step;
    unit.model.position.z += (dz / dist) * step;
    unit.model.rotation.y = Math.atan2(dx, dz) + this.facingOffset;
    return false;
  }

  separateFrom(unit, ox, oz, otherRadius) {
    const p = unit.model.position;
    const dx = p.x - ox;
    const dz = p.z - oz;
    const d = Math.hypot(dx, dz);
    const minD = unit.radius + otherRadius;
    if (d >= minD) {
      return;
    }
    if (d < 1e-5) {
      p.x += minD;
      return;
    }
    const push = (minD - d) / d;
    p.x += dx * push;
    p.z += dz * push;
  }

  resolveCollisions(unit, { ignoreUnit = null } = {}) {
    for (const o of this.obstacles) {
      this.separateFrom(unit, o.x, o.z, o.r);
    }
    for (const other of this.allUnits()) {
      if (other === unit || other === ignoreUnit || other.dead) {
        continue;
      }
      this.separateFrom(unit, other.model.position.x, other.model.position.z, other.radius);
    }
  }

  loadClip(loader, url) {
    return new Promise((resolve) => {
      loader.load(
        url,
        (gltf) => resolve((gltf.animations && gltf.animations[0]) || null),
        undefined,
        () => resolve(null)
      );
    });
  }

  loadKnightAssets(THREE, GLTFLoader) {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(
        KNIGHT_WALK_URL,
        (gltf) => {
          this.knightTemplate = gltf.scene;
          const clips = gltf.animations || [];
          this.knightClips.walk = clips.find((clip) => /walk/i.test(clip.name)) || clips[0];
          resolve();
        },
        (progress) => {
          if (!progress.total) {
            return;
          }
          const pct = Math.round((progress.loaded / progress.total) * 100);
          this.setLoader(`Loading knight… ${pct}%`, (progress.loaded / progress.total) / this.loaderSteps);
        },
        reject
      );
    });
  }

  async loadExtraClips(GLTFLoader) {
    const loader = new GLTFLoader();
    this.knightClips.run = await this.loadClip(loader, KNIGHT_RUN_URL);
    this.advanceLoader('Loading idle…');
    this.knightClips.idle = await this.loadClip(loader, KNIGHT_IDLE_URL);
    this.advanceLoader('Loading attack…');
    this.knightClips.attack = await this.loadClip(loader, KNIGHT_ATTACK_URL);
    this.advanceLoader('Loading orc…');
  }

  async loadOrcAssets(THREE, GLTFLoader) {
    const loader = new GLTFLoader();
    const gltf = await new Promise((resolve, reject) => {
      loader.load(
        ORC_LOOK_URL,
        resolve,
        (progress) => {
          if (!progress.total) {
            return;
          }
          const base = this.loaderStep / this.loaderSteps;
          this.setLoader('Loading orc…', base + (progress.loaded / progress.total) / this.loaderSteps);
        },
        reject
      );
    });
    this.orcTemplate = gltf.scene;
    this.orcClips.look = (gltf.animations && gltf.animations[0]) || null;
    this.advanceLoader('Loading orc…');
    this.orcClips.dead = await this.loadClip(loader, ORC_DEAD_URL);
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  panCamera(dt) {
    const THREE = this.THREE;
    let x = 0;
    let z = 0;
    if (this.keys.KeyW || this.keys.ArrowUp) z += 1;
    if (this.keys.KeyS || this.keys.ArrowDown) z -= 1;
    if (this.keys.KeyA || this.keys.ArrowLeft) x -= 1;
    if (this.keys.KeyD || this.keys.ArrowRight) x += 1;
    if (!x && !z) {
      return;
    }
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() < 0.0001) {
      forward.set(0, 0, -1);
    }
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const move = right.multiplyScalar(x).add(forward.multiplyScalar(z));
    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(this.panSpeed * dt);
      this.camera.position.add(move);
      this.controls.target.add(move);
    }
  }

  updateUnit(unit, dt) {
    if (unit.kind === 'orc') {
      if (!unit.dead) {
        this.resolveCollisions(unit);
      }
      unit.model.position.y = unit.groundY;
      unit.ring.position.x = unit.model.position.x;
      unit.ring.position.z = unit.model.position.z;
      unit.mixer.update(dt);
      return;
    }

    if (unit.mode === 'chase' && unit.chaseTarget && !unit.chaseTarget.dead) {
      const orc = unit.chaseTarget;
      const dx = orc.model.position.x - unit.model.position.x;
      const dz = orc.model.position.z - unit.model.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist <= this.attackRange) {
        this.startAttack(unit, orc);
      } else {
        if (!unit.waypoints.length) {
          unit.waypoints = this.buildPath(unit, orc.model.position.x, orc.model.position.z, { ignoreUnit: orc });
        }
        this.followWaypoints(unit, dt, this.runSpeed, 0.35);
        this.resolveCollisions(unit, { ignoreUnit: orc });
      }
    } else if (unit.mode === 'run' && unit.target) {
      const arrived = this.followWaypoints(unit, dt, this.runSpeed, 0.16);
      this.resolveCollisions(unit);
      if (arrived || !unit.waypoints.length) {
        const dx = unit.target.x - unit.model.position.x;
        const dz = unit.target.z - unit.model.position.z;
        if (Math.hypot(dx, dz) < 0.2 || arrived) {
          unit.target = null;
          unit.waypoints = [];
          unit.mode = 'hold';
          this.playAction(unit, 'idle');
        }
      }
    } else if (unit.mode === 'attack') {
      unit.attackElapsed += dt;
      if (!unit.swishPlayed && unit.attackElapsed >= 0.88) {
        unit.swishPlayed = true;
        this.playRandom(SWISH_URLS, 2.6);
      }
      if (!unit.attackHit && unit.attackElapsed >= 0.95 && unit.chaseTarget) {
        unit.attackHit = true;
        this.killOrc(unit.chaseTarget);
      }
      this.resolveCollisions(unit, { ignoreUnit: unit.chaseTarget });
    } else if (unit.mode === 'patrol') {
      unit.pathAngle += (this.walkSpeed / unit.pathRadius) * dt;
      unit.model.position.x = Math.cos(unit.pathAngle) * unit.pathRadius;
      unit.model.position.z = Math.sin(unit.pathAngle) * unit.pathRadius;
      unit.model.rotation.y = -unit.pathAngle + this.facingOffset;
      this.resolveCollisions(unit);
    } else {
      this.resolveCollisions(unit);
    }

    unit.model.position.y = unit.groundY;
    unit.ring.position.x = unit.model.position.x;
    unit.ring.position.z = unit.model.position.z;
    unit.mixer.update(dt);
  }

  updateMovement(dt) {
    if (!this.assetsReady) {
      return;
    }
    this.knights.forEach((knight) => this.updateUnit(knight, dt));
    this.orcs.forEach((orc) => this.updateUnit(orc, dt));
  }

  loop() {
    this.rafId = requestAnimationFrame(() => this.loop());
    const dt = this.clock.getDelta();
    if (this.assetsReady) {
      this.syncMoveSound();
      if (!this.ambienceSource) {
        this.startAmbience();
      }
    }
    this.panCamera(dt);
    this.updateMovement(dt);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

customElements.define('cpg-knight', CpgKnight);
