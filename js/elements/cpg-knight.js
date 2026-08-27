const THREE_VERSION = '0.185.1';
const THREE_URL = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/build/three.module.js`;
const GLTF_LOADER_URL = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/examples/jsm/loaders/GLTFLoader.js`;
const MAP_CONTROLS_URL = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/examples/jsm/controls/MapControls.js`;
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
        .toast {
          position: absolute;
          left: 50%;
          bottom: 28px;
          z-index: 30;
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
          transform: translate(-50%, calc(100% + 56px));
          opacity: 0;
          pointer-events: none;
          transition:
            transform 0.52s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.32s ease;
        }
        .toast.visible {
          transform: translate(-50%, 0);
          opacity: 1;
          pointer-events: auto;
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
      <div class="toast" aria-hidden="true">
        <div class="toast-portrait-wrap">
          <img class="toast-portrait" src="${KNIGHT_PORTRAIT_URL}" alt="Knight">
        </div>
        <div class="toast-meta">
          <div class="toast-label">Selected</div>
          <div class="toast-name">Knight</div>
        </div>
        <button class="toast-close" type="button" aria-label="Deselect knight">
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    `;
    this.canvas = this.shadow.querySelector('canvas');
    this.loaderEl = this.shadow.querySelector('.loader');
    this.loaderFill = this.shadow.querySelector('.loader-fill');
    this.loaderCopy = this.shadow.querySelector('.loader-copy');
    this.toastEl = this.shadow.querySelector('.toast');
    this.toastPortrait = this.shadow.querySelector('.toast-portrait');
    this.toastLabel = this.shadow.querySelector('.toast-label');
    this.toastName = this.shadow.querySelector('.toast-name');
    this.closeBtn = this.shadow.querySelector('.toast-close');
    this.toastKind = null;
    this.rafId = null;
    this.clock = null;
    this.mixer = null;
    this.knight = null;
    this.pathAngle = 0;
    this.groundY = 0;
    this.facingOffset = 0;
    this.selected = false;
    this.knightMeshes = [];
    this.knightMaterials = [];
    this.selectionRing = null;
    this.raycaster = null;
    this.groundPlane = null;
    this.pointerDown = null;
    this.mode = 'patrol';
    this.target = null;
    this.actions = {};
    this.currentAction = null;
    this.orc = null;
    this.orcMixer = null;
    this.orcActions = {};
    this.orcCurrentAction = null;
    this.orcMeshes = [];
    this.orcDead = false;
    this.orcSelected = false;
    this.orcGroundY = 0;
    this.swishPlayed = false;
    this.attackRange = 1.9;
    this.attackElapsed = 0;
    this.attackHit = false;
    this.keys = {};
    this.audioCtx = null;
    this.audioBuffers = new Map();
    this.moveSoundKind = null;
    this.moveSource = null;
    this.moveGain = null;
    this.ambienceSource = null;
    this.obstacles = [];
    this.waypoints = [];
    this.knightRadius = 0.55;
    this.orcRadius = 0.78;
    this.assetsReady = false;
    this.loaderStep = 0;
    this.loaderSteps = 7;
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
      this.canvas.removeEventListener('pointerup', this.onPointerUp);
    }
    if (this.closeBtn) {
      this.closeBtn.removeEventListener('click', this.onCloseClick);
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
      this.THREE = THREE;

      this.setupScene(THREE, MapControls);
      this.setupSelection(THREE);
      this.setupCameraKeys();
      this.setupAudio();
      this.clock = new THREE.Clock();
      this.onResize = this.onResize.bind(this);
      window.addEventListener('resize', this.onResize);
      this.loop();
      this.setLoader('Loading knight…', 0.04);
      await this.loadKnight(THREE, GLTFLoader);
      this.advanceLoader('Loading animations…');
      await this.loadExtraClips(GLTFLoader);
      this.setLoader('Loading orc…');
      await this.loadOrc(THREE, GLTFLoader);
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
    this.controls.update();

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.45));

    const hemi = new THREE.HemisphereLight(0xe8f4ff, 0x3d6b2f, 1.4);
    this.scene.add(hemi);

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

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.48, 0.68, 48),
      new THREE.MeshBasicMaterial({
        color: 0x39ff6a,
        side: THREE.DoubleSide
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.04;
    ring.visible = false;
    this.selectionRing = ring;
    this.scene.add(ring);
  }

  setupSelection(THREE) {
    this.raycaster = new THREE.Raycaster();
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onCloseClick = this.onCloseClick.bind(this);
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.closeBtn.addEventListener('click', this.onCloseClick);
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

  onCloseClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.toastKind === 'orc') {
      this.orcSelected = false;
      if (this.selected) {
        this.showToast('knight');
      } else {
        this.hideToast();
      }
      return;
    }
    this.setSelected(false);
  }

  onPointerDown(event) {
    this.unlockAudio();
    this.pointerDown = { x: event.clientX, y: event.clientY };
  }

  onPointerUp(event) {
    if (!this.pointerDown || !this.knight) {
      return;
    }

    const dx = event.clientX - this.pointerDown.x;
    const dy = event.clientY - this.pointerDown.y;
    this.pointerDown = null;
    if (dx * dx + dy * dy > 16) {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const mouse = new this.THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.knightMeshes, true);
    if (hits.length > 0) {
      this.setSelected(true);
      this.playBuffer(SERVICE_URL, { volume: 1 });
      return;
    }

    if (this.orc && this.orcMeshes.length) {
      const orcHits = this.raycaster.intersectObjects(this.orcMeshes, true);
      if (orcHits.length > 0) {
        this.selectOrc();
        return;
      }
    }

    if (!this.selected) {
      return;
    }

    const point = new this.THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.groundPlane, point)) {
      this.runTo(point.x, point.z);
    }
  }

  showToast(kind) {
    this.toastKind = kind;
    const isOrc = kind === 'orc';
    this.toastEl.classList.toggle('enemy', isOrc);
    this.toastEl.classList.add('visible');
    this.toastEl.setAttribute('aria-hidden', 'false');
    this.toastPortrait.src = isOrc ? ORC_PORTRAIT_URL : KNIGHT_PORTRAIT_URL;
    this.toastPortrait.alt = isOrc ? 'Enemy' : 'Knight';
    this.toastLabel.textContent = isOrc ? 'Enemy' : 'Selected';
    this.toastName.textContent = isOrc ? 'Enemy' : 'Knight';
    this.closeBtn.setAttribute('aria-label', isOrc ? 'Deselect enemy' : 'Deselect knight');
  }

  hideToast() {
    this.toastKind = null;
    this.toastEl.classList.remove('visible', 'enemy');
    this.toastEl.setAttribute('aria-hidden', 'true');
  }

  selectOrc() {
    this.orcSelected = true;
    this.showToast('orc');
    if (!this.orcDead) {
      this.playRandom(ROAR_URLS, 1);
      if (this.selected) {
        this.startChase();
      }
    }
  }

  setSelected(selected) {
    this.selected = selected;
    if (this.selectionRing) {
      this.selectionRing.visible = selected;
    }
    this.knightMaterials.forEach(({ material, emissiveIntensity }) => {
      material.emissiveIntensity = selected
        ? Math.max(emissiveIntensity, 0.12) + 0.55
        : emissiveIntensity;
    });
    if (selected) {
      this.orcSelected = false;
      this.showToast('knight');
    } else if (this.toastKind === 'knight') {
      this.hideToast();
    }
    if (!selected && this.mode !== 'attack') {
      this.target = null;
      this.waypoints = [];
      this.mode = 'hold';
      this.playAction('idle');
    }
  }

  runTo(x, z) {
    if (this.mode === 'attack') {
      return;
    }
    this.target = { x, z };
    this.mode = 'run';
    this.waypoints = this.buildPath(x, z);
    this.playAction('run');
  }

  startChase() {
    if (this.orcDead || this.mode === 'attack' || !this.orc) {
      return;
    }
    this.mode = 'chase';
    this.waypoints = this.buildPath(this.orc.position.x, this.orc.position.z, { ignoreOrc: true });
    this.playAction('run');
  }

  startAttack() {
    this.mode = 'attack';
    this.attackElapsed = 0;
    this.attackHit = false;
    if (this.orc) {
      const dx = this.orc.position.x - this.knight.position.x;
      const dz = this.orc.position.z - this.knight.position.z;
      this.knight.rotation.y = Math.atan2(dx, dz) + this.facingOffset;
    }
    this.playAction('attack');
    this.swishPlayed = false;
  }

  killOrc() {
    if (this.orcDead || !this.orc) {
      return;
    }
    this.orcDead = true;
    this.playOrcAction('dead');
    this.playRandom(DEATH_URLS, 1);
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
    if (this.mode === 'run' || this.mode === 'chase') {
      kind = 'run';
    } else if (this.mode === 'patrol') {
      kind = 'walk';
    }
    this.setMoveSound(kind);
  }

  playAction(name) {
    const THREE = this.THREE;
    const next = this.actions[name] || this.actions.walk;
    if (!next || next === this.currentAction) {
      return;
    }
    const once = name === 'attack';
    next.reset();
    next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
    next.clampWhenFinished = once;
    next.setEffectiveWeight(1);
    next.play();
    if (this.currentAction) {
      this.currentAction.crossFadeTo(next, once ? 0.08 : 0.18, false);
    }
    this.currentAction = next;
  }

  playOrcAction(name) {
    const THREE = this.THREE;
    const next = this.orcActions[name];
    if (!next || next === this.orcCurrentAction) {
      return;
    }
    const once = name === 'dead';
    next.reset();
    next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
    next.clampWhenFinished = once;
    next.setEffectiveWeight(1);
    next.play();
    if (this.orcCurrentAction) {
      this.orcCurrentAction.crossFadeTo(next, 0.12, false);
    }
    this.orcCurrentAction = next;
  }

  addBushes(THREE) {
    this.obstacles = [];
    const geometry = new THREE.SphereGeometry(1, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x1a8a32,
      roughness: 0.88,
      metalness: 0.0
    });

    const knightStart = {
      x: Math.cos(this.pathAngle) * this.pathRadius,
      z: Math.sin(this.pathAngle) * this.pathRadius
    };
    const orcPos = this.orc
      ? { x: this.orc.position.x, z: this.orc.position.z }
      : { x: -5.4, z: 3.2 };

    const count = 6;
    let attempts = 0;
    while (this.obstacles.length < count && attempts < 120) {
      attempts += 1;
      const r = 0.58 + Math.random() * 0.42;
      const x = (Math.random() - 0.5) * 16;
      const z = (Math.random() - 0.5) * 16;
      if (Math.hypot(x, z) > 8.2) {
        continue;
      }
      if (Math.hypot(x - knightStart.x, z - knightStart.z) < r + this.knightRadius + 1.5) {
        continue;
      }
      if (Math.hypot(x - orcPos.x, z - orcPos.z) < r + this.orcRadius + 1.5) {
        continue;
      }
      if (Math.abs(Math.hypot(x, z) - this.pathRadius) < r + this.knightRadius + 0.6) {
        continue;
      }
      if (this.obstacles.some((o) => Math.hypot(x - o.x, z - o.z) < r + o.r + 0.5)) {
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

  isBlocked(x, z, { ignoreOrc = false } = {}) {
    const radius = this.knightRadius;
    for (const o of this.obstacles) {
      if (Math.hypot(x - o.x, z - o.z) < o.r + radius + 0.12) {
        return true;
      }
    }
    if (!ignoreOrc && this.orc && !this.orcDead) {
      if (Math.hypot(x - this.orc.position.x, z - this.orc.position.z) < this.orcRadius + radius + 0.08) {
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

  buildPath(goalX, goalZ, opts = {}) {
    const start = { x: this.knight.position.x, z: this.knight.position.z };
    const goal = this.nudgeOutOfObstacles(goalX, goalZ, this.knightRadius);
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

  followWaypoints(dt, speed, arriveDist) {
    if (!this.waypoints.length) {
      return true;
    }
    const wp = this.waypoints[0];
    const dx = wp.x - this.knight.position.x;
    const dz = wp.z - this.knight.position.z;
    const dist = Math.hypot(dx, dz);
    const threshold = this.waypoints.length === 1 ? arriveDist : 0.28;
    if (dist <= threshold) {
      this.waypoints.shift();
      return this.waypoints.length === 0;
    }
    const step = Math.min(speed * dt, dist);
    this.knight.position.x += (dx / dist) * step;
    this.knight.position.z += (dz / dist) * step;
    this.knight.rotation.y = Math.atan2(dx, dz) + this.facingOffset;
    return false;
  }

  separateFrom(ox, oz, otherRadius) {
    const p = this.knight.position;
    const dx = p.x - ox;
    const dz = p.z - oz;
    const d = Math.hypot(dx, dz);
    const minD = this.knightRadius + otherRadius;
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

  resolveCollisions({ ignoreOrc = false } = {}) {
    for (const o of this.obstacles) {
      this.separateFrom(o.x, o.z, o.r);
    }
    if (!ignoreOrc && this.orc && !this.orcDead) {
      this.separateFrom(this.orc.position.x, this.orc.position.z, this.orcRadius);
    }
  }

  prepareSkinnedModel(model, meshList) {
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        meshList.push(child);
        if (child.material) {
          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];
          materials.forEach((material) => {
            material.metalness = 0.15;
            material.roughness = 0.65;
            if (material.emissive) {
              material.emissiveIntensity = 0.08;
            }
            material.needsUpdate = true;
          });
        }
      }
    });
    const box = new this.THREE.Box3().setFromObject(model);
    model.position.y -= box.min.y;
    return model.position.y;
  }

  loadKnight(THREE, GLTFLoader) {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        KNIGHT_WALK_URL,
        (gltf) => {
          const model = gltf.scene;
          this.knightMeshes = [];
          this.knightMaterials = [];
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              this.knightMeshes.push(child);
              if (child.material) {
                const materials = Array.isArray(child.material)
                  ? child.material
                  : [child.material];
                materials.forEach((material) => {
                  material.metalness = 0.15;
                  material.roughness = 0.65;
                  if (material.emissive) {
                    material.emissiveIntensity = 0.08;
                  }
                  material.needsUpdate = true;
                  this.knightMaterials.push({
                    material,
                    emissiveIntensity: material.emissiveIntensity
                  });
                });
              }
            }
          });

          const box = new THREE.Box3().setFromObject(model);
          model.position.y -= box.min.y;
          this.groundY = model.position.y;

          this.knight = model;
          this.scene.add(model);

          this.mixer = new THREE.AnimationMixer(model);
          this.mixer.addEventListener('finished', (event) => {
            if (event.action === this.actions.attack && this.mode === 'attack') {
              this.mode = 'hold';
              this.playAction('idle');
            }
          });
          const clips = gltf.animations || [];
          const walkClip = clips.find((clip) => /walk/i.test(clip.name)) || clips[0];
          if (walkClip) {
            this.actions.walk = this.mixer.clipAction(walkClip);
            this.playAction('walk');
          }

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

  async loadExtraClips(GLTFLoader) {
    const loader = new GLTFLoader();
    const runClip = await this.loadClip(loader, KNIGHT_RUN_URL);
    this.advanceLoader('Loading idle…');
    const idleClip = await this.loadClip(loader, KNIGHT_IDLE_URL);
    this.advanceLoader('Loading attack…');
    const attackClip = await this.loadClip(loader, KNIGHT_ATTACK_URL);
    this.advanceLoader('Loading orc…');
    if (runClip && this.mixer) {
      this.actions.run = this.mixer.clipAction(runClip);
    }
    if (idleClip && this.mixer) {
      this.actions.idle = this.mixer.clipAction(idleClip);
    }
    if (attackClip && this.mixer) {
      this.actions.attack = this.mixer.clipAction(attackClip);
    }
  }

  async loadOrc(THREE, GLTFLoader) {
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
    const model = gltf.scene;
    this.orcMeshes = [];
    this.orcGroundY = this.prepareSkinnedModel(model, this.orcMeshes);
    model.position.x = -5.4;
    model.position.z = 3.2;
    model.rotation.y = Math.PI * 0.35;
    this.orc = model;
    this.scene.add(model);

    this.orcMixer = new THREE.AnimationMixer(model);
    const lookClip = (gltf.animations && gltf.animations[0]) || null;
    if (lookClip) {
      this.orcActions.look = this.orcMixer.clipAction(lookClip);
      this.playOrcAction('look');
    }

    this.advanceLoader('Loading orc…');
    const deadClip = await this.loadClip(loader, ORC_DEAD_URL);
    if (deadClip && this.orcMixer) {
      this.orcActions.dead = this.orcMixer.clipAction(deadClip);
    }
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

  updateMovement(dt) {
    if (!this.assetsReady || !this.knight) {
      return;
    }

    if (this.mode === 'chase' && this.orc && !this.orcDead) {
      const dx = this.orc.position.x - this.knight.position.x;
      const dz = this.orc.position.z - this.knight.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist <= this.attackRange) {
        this.startAttack();
      } else {
        if (!this.waypoints.length) {
          this.waypoints = this.buildPath(this.orc.position.x, this.orc.position.z, { ignoreOrc: true });
        }
        this.followWaypoints(dt, this.runSpeed, 0.35);
        this.resolveCollisions({ ignoreOrc: true });
      }
    } else if (this.mode === 'run' && this.target) {
      const arrived = this.followWaypoints(dt, this.runSpeed, 0.16);
      this.resolveCollisions();
      if (arrived || !this.waypoints.length) {
        const dx = this.target.x - this.knight.position.x;
        const dz = this.target.z - this.knight.position.z;
        if (Math.hypot(dx, dz) < 0.2 || arrived) {
          this.target = null;
          this.waypoints = [];
          this.mode = 'hold';
          this.playAction('idle');
        }
      }
    } else if (this.mode === 'attack') {
      this.attackElapsed += dt;
      if (!this.swishPlayed && this.attackElapsed >= 0.88) {
        this.swishPlayed = true;
        this.playRandom(SWISH_URLS, 2.6);
      }
      if (!this.attackHit && this.attackElapsed >= 0.95) {
        this.attackHit = true;
        this.killOrc();
      }
      this.resolveCollisions({ ignoreOrc: true });
    } else if (this.mode === 'patrol') {
      this.pathAngle += (this.walkSpeed / this.pathRadius) * dt;
      this.knight.position.x = Math.cos(this.pathAngle) * this.pathRadius;
      this.knight.position.z = Math.sin(this.pathAngle) * this.pathRadius;
      this.knight.rotation.y = -this.pathAngle + this.facingOffset;
      this.resolveCollisions();
    } else {
      this.resolveCollisions();
    }

    this.knight.position.y = this.groundY;
    if (this.selectionRing) {
      this.selectionRing.position.x = this.knight.position.x;
      this.selectionRing.position.z = this.knight.position.z;
    }
    if (this.orc) {
      this.orc.position.y = this.orcGroundY;
    }
  }

  loop() {
    this.rafId = requestAnimationFrame(() => this.loop());
    const dt = this.clock.getDelta();

    if (this.mixer) {
      this.mixer.update(dt);
    }
    if (this.orcMixer) {
      this.orcMixer.update(dt);
    }

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
