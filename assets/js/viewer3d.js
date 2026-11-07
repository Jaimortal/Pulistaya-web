import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Available 3D Models in Pulistaya-web (Optimized, Campsite removed, Lobby Map primary)
const MODELS_DATA = {
  lobby: {
    title: 'Lobby Map',
    badge: 'Main Pre-Match Arena',
    path: 'assets/models/lobby.glb',
    description: 'The official pre-match waiting area and interactive spawn hub where players assemble and select their characters before the round starts.',
    estimatedPolys: '8,200 Polygons',
    fileSize: '1.5 MB'
  },
  compound: {
    title: 'Compound Map',
    badge: 'Neighborhood Arena',
    path: 'assets/models/compound.glb',
    description: 'The iconic residential compound featuring colorful Filipino houses, central gazebo umbrella, brick paths, and tactical hiding spots.',
    estimatedPolys: '32,000 Polygons',
    fileSize: '1.6 MB'
  },
  knight: {
    title: 'Knight Character',
    badge: 'Animated Hider Hero',
    path: 'assets/models/knight.glb',
    description: 'Cute chibi 3D Knight hider equipped with shield and sword, customizable skin colors, and unique survival abilities.',
    estimatedPolys: '4,500 Polygons',
    fileSize: '948 KB'
  },
  police: {
    title: 'Police Hunter',
    badge: 'Animated Seeker Hero',
    path: 'assets/models/police.glb',
    description: 'The seeker character armed with flashlight, radar scans, sprint mechanics, and stun projectiles to catch all hiders.',
    estimatedPolys: '4,200 Polygons',
    fileSize: '832 KB'
  }
};

class PulistayaViewer {
  constructor() {
    this.container = document.getElementById('canvas-container');
    if (!this.container) return;

    this.loadingEl = document.getElementById('viewer-loading');
    this.progressText = document.getElementById('loading-progress');
    this.autoRotateBtn = document.getElementById('btn-autorotate');
    this.resetBtn = document.getElementById('btn-reset-view');
    this.wireframeBtn = document.getElementById('btn-wireframe');
    this.fullscreenBtn = document.getElementById('btn-fullscreen');

    this.specName = document.getElementById('spec-model-name');
    this.specPolys = document.getElementById('spec-polygons');
    this.specSize = document.getElementById('spec-filesize');
    this.specDesc = document.getElementById('spec-description');

    this.animControlsContainer = document.getElementById('viewer-anim-controls');
    this.animBtnGroup = document.getElementById('anim-btn-group');

    // Default to Lobby Map
    this.currentModelKey = 'lobby';
    this.currentModel = null;
    this.mixer = null;
    this.clock = new THREE.Clock();
    this.currentAction = null;
    this.availableAnimations = [];
    this.isWireframe = false;

    // Disabled auto-rotate by default for zero idle GPU load
    this.isAutoRotate = false;
    this.renderRequested = false;

    this.initialCameraPos = new THREE.Vector3(15, 12, 18);
    this.initialTarget = new THREE.Vector3(0, 0, 0);

    this.initScene();
    this.setupLights();
    this.setupControls();
    this.setupEventListeners();
    this.loadModel(this.currentModelKey);
    this.startLoop();
  }

  initScene() {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 500;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c1017);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.2, 500);
    this.camera.position.set(15, 12, 18);

    // Maximum lightweight renderer configuration
    this.renderer = new THREE.WebGLRenderer({
      antialias: false, // Disabled for extreme performance boost
      powerPreference: 'high-performance',
      precision: 'mediump',
      stencil: false,
      depth: true,
      alpha: false
    });

    this.renderer.setSize(width, height);
    // Locked to 1.0 (prevents 4K overdraw on laptops/retina screens)
    this.renderer.setPixelRatio(1.0);
    this.renderer.shadowMap.enabled = false;

    this.container.appendChild(this.renderer.domElement);

    // Lightweight Ground Grid
    this.gridHelper = new THREE.GridHelper(40, 20, 0xEA580C, 0x1b2332);
    this.gridHelper.position.y = -0.02;
    this.scene.add(this.gridHelper);
  }

  setupLights() {
    // Balanced lighting setup: crisp visibility without shader overhead
    this.hemiLight = new THREE.HemisphereLight(0xfff5ea, 0x121722, 1.2);
    this.hemiLight.position.set(0, 30, 0);
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight(0xffeedd, 1.3);
    this.keyLight.position.set(20, 30, 15);
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(0x6080a0, 0.6);
    this.fillLight.position.set(-15, 15, -15);
    this.scene.add(this.fillLight);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 100;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.02;
    this.controls.autoRotate = this.isAutoRotate;
    this.controls.autoRotateSpeed = 0.8;

    // Trigger render on camera change
    this.controls.addEventListener('change', () => this.requestRender());
  }

  requestRender() {
    this.renderRequested = true;
  }

  loadModel(key) {
    const data = MODELS_DATA[key];
    if (!data) return;

    this.currentModelKey = key;
    this.showLoading(true);

    // Update Specs
    if (this.specName) this.specName.textContent = data.title;
    if (this.specPolys) this.specPolys.textContent = data.estimatedPolys;
    if (this.specSize) this.specSize.textContent = data.fileSize;
    if (this.specDesc) this.specDesc.textContent = data.description;

    const loader = new GLTFLoader();

    loader.load(
      data.path,
      (gltf) => {
        // Cleanup previous animations
        if (this.mixer) {
          this.mixer.stopAllAction();
          this.mixer = null;
        }

        // Cleanup previous geometry
        if (this.currentModel) {
          this.scene.remove(this.currentModel);
          this.disposeObject(this.currentModel);
        }

        const root = gltf.scene;
        this.currentModel = root;

        // Auto center and place on ground
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        root.position.x = -center.x;
        root.position.z = -center.z;
        root.position.y = -box.min.y;

        // Aggressive optimizations: frontside only, mediump, frustum culling
        root.traverse((child) => {
          if (child.isMesh) {
            child.frustumCulled = true;
            if (child.material) {
              child.material.wireframe = this.isWireframe;
              child.material.side = THREE.FrontSide;
              child.material.precision = 'mediump';
            }
          }
        });

        this.scene.add(root);

        // Adjust camera framing based on model size
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.camera.fov * (Math.PI / 180);
        let cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * 0.72;
        cameraDistance = Math.max(cameraDistance, 3.2);

        const targetY = size.y * 0.38;
        this.controls.target.set(0, targetY, 0);

        this.camera.position.set(
          cameraDistance * 0.75,
          cameraDistance * 0.52 + targetY,
          cameraDistance * 0.8
        );

        this.initialCameraPos.copy(this.camera.position);
        this.initialTarget.set(0, targetY, 0);

        // Handle Animations for characters
        this.handleAnimations(gltf.animations, root);

        this.controls.update();
        this.showLoading(false);
        this.requestRender();
      },
      (xhr) => {
        if (xhr.lengthComputable && this.progressText) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          this.progressText.textContent = `${percent}%`;
        }
      },
      (error) => {
        console.error('Error loading 3D model:', error);
        if (this.progressText) {
          this.progressText.textContent = 'Failed to load';
        }
        this.showLoading(false);
      }
    );
  }

  handleAnimations(animations, root) {
    if (!animations || animations.length === 0) {
      if (this.animControlsContainer) {
        this.animControlsContainer.style.display = 'none';
      }
      return;
    }

    this.mixer = new THREE.AnimationMixer(root);
    this.availableAnimations = animations;

    if (this.animControlsContainer && this.animBtnGroup) {
      this.animControlsContainer.style.display = 'flex';
      this.animBtnGroup.innerHTML = '';

      animations.forEach((clip, index) => {
        const btn = document.createElement('button');
        btn.className = `anim-pill-btn ${index === 0 ? 'active' : ''}`;
        btn.textContent = clip.name.charAt(0).toUpperCase() + clip.name.slice(1);
        btn.addEventListener('click', () => {
          this.animBtnGroup.querySelectorAll('.anim-pill-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.playAnimation(clip.name);
        });
        this.animBtnGroup.appendChild(btn);
      });
    }

    if (animations.length > 0) {
      this.playAnimation(animations[0].name);
    }
  }

  playAnimation(name) {
    if (!this.mixer) return;
    const clip = THREE.AnimationClip.findByName(this.availableAnimations, name);
    if (clip) {
      const newAction = this.mixer.clipAction(clip);
      if (this.currentAction) {
        this.currentAction.crossFadeTo(newAction, 0.25, true);
      }
      newAction.reset().play();
      this.currentAction = newAction;
      this.requestRender();
    }
  }

  showLoading(show) {
    if (!this.loadingEl) return;
    if (show) {
      this.loadingEl.classList.remove('hidden');
      if (this.progressText) this.progressText.textContent = 'Loading...';
    } else {
      setTimeout(() => {
        this.loadingEl.classList.add('hidden');
      }, 100);
    }
  }

  disposeObject(obj) {
    obj.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }

  setupEventListeners() {
    // Model Selection Buttons
    const modelButtons = document.querySelectorAll('.model-option-btn');
    modelButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const modelKey = btn.getAttribute('data-model');
        if (modelKey && modelKey !== this.currentModelKey) {
          modelButtons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.loadModel(modelKey);
        }
      });
    });

    // Auto-Rotate Button
    if (this.autoRotateBtn) {
      this.autoRotateBtn.addEventListener('click', () => {
        this.isAutoRotate = !this.isAutoRotate;
        this.controls.autoRotate = this.isAutoRotate;
        this.autoRotateBtn.classList.toggle('active', this.isAutoRotate);
        this.requestRender();
      });
    }

    // Reset View Button
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.camera.position.copy(this.initialCameraPos);
        this.controls.target.copy(this.initialTarget);
        this.controls.update();
        this.requestRender();
      });
    }

    // Wireframe Toggle Button
    if (this.wireframeBtn) {
      this.wireframeBtn.addEventListener('click', () => {
        this.isWireframe = !this.isWireframe;
        this.wireframeBtn.classList.toggle('active', this.isWireframe);
        if (this.currentModel) {
          this.currentModel.traverse((child) => {
            if (child.isMesh && child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((m) => (m.wireframe = this.isWireframe));
              } else {
                child.material.wireframe = this.isWireframe;
              }
            }
          });
        }
        this.requestRender();
      });
    }

    // Fullscreen Toggle
    if (this.fullscreenBtn) {
      const viewerWrapper = document.querySelector('.viewer-wrapper');
      this.fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          viewerWrapper.requestFullscreen?.().catch((err) => console.log(err));
        } else {
          document.exitFullscreen?.().catch((err) => console.log(err));
        }
      });
    }

    // Window Resize Handling
    window.addEventListener('resize', () => {
      if (!this.container) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
      this.requestRender();
    });
  }

  startLoop = () => {
    const loop = () => {
      requestAnimationFrame(loop);

      const delta = this.clock.getDelta();
      let needsRender = this.renderRequested;

      // When animations or autoRotate run, render continuously
      if (this.mixer) {
        this.mixer.update(delta);
        needsRender = true;
      }

      if (this.controls.autoRotate) {
        needsRender = true;
      }

      // Update controls damping
      if (this.controls.update()) {
        needsRender = true;
      }

      if (needsRender) {
        this.renderer.render(this.scene, this.camera);
        this.renderRequested = false;
      }
    };
    loop();
  };
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new PulistayaViewer();
});
