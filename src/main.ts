import './style.css';
import {
  ACESFilmicToneMapping,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Material,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getPart, type PartId } from './domain/parts';
import { currentStage, endTour, goToStage, nextStage, previousStage, startTour, type TourState } from './domain/tour';
import { PartInteractor } from './interaction/PartInteractor';
import { buildLesPaul, type BuiltGuitar } from './scene/buildGuitar';
import { CameraDirector, heroPose, type ViewPreset } from './scene/camera';
import { createPipeline, type RenderPipeline } from './scene/pipeline';
import {
  detectQualityTier,
  nextQuality,
  qualitySettings,
  type QualitySettings,
  type QualityTier,
} from './scene/quality';
import { createStudio, type Studio } from './scene/studio';
import { createGuitarTextures } from './scene/textures';
import { Interface, type InterfaceCallbacks } from './ui/Interface';

interface Experience {
  readonly renderer: WebGLRenderer;
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly controls: OrbitControls;
  readonly guitar: BuiltGuitar;
  readonly studio: Studio;
  readonly pipeline: RenderPipeline;
  readonly director: CameraDirector;
  readonly interactor: PartInteractor;
}

interface DebugState {
  readonly ready: boolean;
  readonly pinned: PartId | null;
  readonly hovered: PartId | null;
  readonly tour: TourState;
  readonly exploded: boolean;
  readonly quality: QualityTier;
}

const canvas = document.getElementById('stage');
if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Canvas #stage not found');

const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const ui = new Interface(buildCallbacks());

let experience: Experience | null = null;
let pinned: PartId | null = null;
let hovered: PartId | null = null;
let preview: PartId | null = null;
let tour: TourState = endTour();
let exploded = false;
let explodeAmount = 0;
let explodeTarget = 0;
let currentTier: QualityTier = detectQualityTier();
let alive = true;
let applyExplosionPending = false;

const originalMaterials = new Map<Material, { transparent: boolean; opacity: number; depthWrite: boolean }>();
const dimStates = new Map<PartId, boolean>();

bootstrap();

function bootstrap(): void {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas: canvas as HTMLCanvasElement,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (error) {
    ui.showFallback(error instanceof Error ? error.message : String(error));
    return;
  }

  let scene: Scene;
  let camera: PerspectiveCamera;
  let controls: OrbitControls;
  let guitar: BuiltGuitar;
  let studio: Studio;
  let pipeline: RenderPipeline;
  try {
    renderer.outputColorSpace = SRGBColorSpace;
    const gl = renderer.getContext();
    const rendererInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const gpuName = rendererInfo ? String(gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL)) : '';
    const qualityOverride = new URLSearchParams(window.location.search).get('quality');
    if (!qualityOverride && /swiftshader|software|llvmpipe/i.test(gpuName)) currentTier = 'lite';
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.96;
    renderer.setClearColor(0x000000, 0);

    const settings = qualitySettings(currentTier);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.dpr));
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    scene = new Scene();
    camera = new PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 420);
    camera.position.copy(heroPose().position).add(new Vector3(15, -6, 27));
    controls = new OrbitControls(camera, canvas as HTMLCanvasElement);
    controls.target.copy(heroPose().target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.enablePan = false;
    controls.minDistance = 12;
    controls.maxDistance = 150;
    controls.minPolarAngle = 0.22;
    controls.maxPolarAngle = 1.68;
    controls.rotateSpeed = 0.55;
    controls.zoomSpeed = 0.8;
    controls.update();

    const textures = createGuitarTextures(renderer.capabilities.getMaxAnisotropy());
    guitar = buildLesPaul({ textures });
    scene.add(guitar.root);
    studio = createStudio(scene, renderer, textures, currentTier);
    pipeline = createPipeline(renderer, scene, camera, settings);
  } catch (error) {
    ui.showFallback(error instanceof Error ? error.message : String(error));
    return;
  }

  const director = new CameraDirector(camera, controls);
  director.setReducedMotion(reducedMotion);

  const interactor = new PartInteractor(canvas as HTMLCanvasElement, camera, guitar, pipeline.outlinePass, {
    onHover: (partId, x, y) => {
      handleHover(partId, x, y);
    },
    onSelect: (partId) => {
      if (partId) {
        if (tour.active) exitTour(false);
        selectPart(partId);
      } else if (tour.active) {
        exitTour();
      } else {
        clearSelection();
      }
    },
  });

  experience = { renderer, scene, camera, controls, guitar, studio, pipeline, director, interactor };

  ui.setQuality(currentTier, qualitySettings(currentTier).label);
  ui.setPreset('hero');
  ui.setExploded(false);

  window.addEventListener('resize', onResize);
  window.visualViewport?.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
  (canvas as HTMLCanvasElement).addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    alive = false;
    ui.showFallback('The WebGL context was lost. Reload to rebuild the instrument.');
  });

  window.__lesPaul = {
    select: (id: string) => {
      const part = getPart(id);
      if (part) selectPart(part.id);
    },
    hover: (id: string | null, x = window.innerWidth * 0.58, y = window.innerHeight * 0.46) => {
      handleHover(id ? (getPart(id)?.id ?? null) : null, x, y);
    },
    clear: () => clearSelection(),
    tour: (index = 0) => startTourAt(index),
    next: () => setTour(nextStage(tour)),
    previous: () => setTour(previousStage(tour)),
    exitTour: () => exitTour(),
    explode: (on: boolean) => {
      setExploded(on);
      explodeAmount = on ? 1 : 0;
      experience?.guitar.applyExplosion(explodeAmount);
    },
    quality: (tier: QualityTier) => applyQuality(tier),
    view: (preset: ViewPreset) => {
      director.setPreset(preset);
      ui.setPreset(preset);
    },
    snap: () => {
      experience?.director.setReducedMotion(true);
    },
    bounds: (id: string) => {
      const part = getPart(id);
      const app = experience;
      if (!part || !app) return null;
      const box = app.guitar.getPartBounds(part.id);
      return box ? { min: box.min.toArray(), max: box.max.toArray() } : null;
    },
    camera: () => ({
      position: experience?.camera.position.toArray() ?? null,
      target: experience?.controls.target.toArray() ?? null,
    }),
    state: (): DebugState => ({
      ready: document.body.dataset.ready === 'true',
      pinned,
      hovered,
      tour,
      exploded,
      quality: currentTier,
    }),
  };

  let last = performance.now();
  let firstFrame = true;
  const loop = (now: number): void => {
    if (!alive) return;
    requestAnimationFrame(loop);
    const delta = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (document.hidden) return;
    const app = experience;
    if (!app) return;

    app.director.update(delta);
    app.controls.update();

    if (Math.abs(explodeAmount - explodeTarget) > 0.0008) {
      explodeAmount += (explodeTarget - explodeAmount) * Math.min(1, delta * 5.2);
      if (Math.abs(explodeAmount - explodeTarget) < 0.0008) explodeAmount = explodeTarget;
      app.guitar.applyExplosion(explodeAmount);
      applyExplosionPending = false;
    } else if (applyExplosionPending) {
      app.guitar.applyExplosion(explodeAmount);
      applyExplosionPending = false;
    }

    app.interactor.update();
    app.pipeline.render();

    if (firstFrame) {
      firstFrame = false;
      ui.setLoading(true);
      document.body.dataset.ready = 'true';
      app.director.flyTo(heroPose(), 2.4);
    }
  };

  requestAnimationFrame(loop);
}

function buildCallbacks(): InterfaceCallbacks {
  return {
    onSelectPart: (partId) => {
      if (tour.active) exitTour(false);
      selectPart(partId);
    },
    onClearSelection: () => {
      if (tour.active) exitTour();
      else clearSelection();
    },
    onFocusPart: (partId) => {
      const app = experience;
      if (!app) return;
      const bounds = app.guitar.getPartBounds(partId);
      if (bounds) app.director.framePart(partId, bounds);
    },
    onPreviewPart: (partId) => {
      preview = partId;
      refreshHighlight();
    },
    onToggleExplode: () => setExploded(!exploded),
    onPreset: (preset) => {
      if (exploded) setExploded(false, false);
      experience?.director.setPreset(preset);
      ui.setPreset(preset);
    },
    onCycleQuality: () => applyQuality(nextQuality(currentTier)),
    onTourStart: () => startTourAt(0),
    onTourNext: () => setTour(nextStage(tour)),
    onTourPrevious: () => setTour(previousStage(tour)),
    onTourExit: () => exitTour(),
    onTourStage: (index) => setTour(goToStage(tour, index)),
    onFocusStagePart: (partId) => {
      const app = experience;
      if (!app) return;
      const bounds = app.guitar.getPartBounds(partId);
      if (bounds) app.director.framePart(partId, bounds);
    },
  };
}

function selectPart(partId: PartId): void {
  const app = experience;
  if (!app) return;
  if (pinned === partId && !tour.active) {
    clearSelection();
    return;
  }
  pinned = partId;
  ui.setPinned(getPart(partId));
  ui.setHover(null);
  hovered = null;
  preview = null;
  refreshHighlight();
  const bounds = app.guitar.getPartBounds(partId);
  if (bounds) app.director.framePart(partId, bounds);
  ui.hideHint();
}

function clearSelection(): void {
  pinned = null;
  preview = null;
  ui.setPinned(null);
  if (!tour.active) {
    hovered = null;
    ui.setHover(null);
  }
  refreshHighlight();
}

function handleHover(partId: PartId | null, x: number, y: number): void {
  hovered = partId;
  ui.setHover(partId ? getPart(partId) : null, x, y);
  refreshHighlight();
}

function refreshHighlight(): void {
  const app = experience;
  if (!app) return;
  const ids: PartId[] = [];
  if (tour.active) {
    for (const partId of currentStage(tour)?.partIds ?? []) ids.push(partId);
  } else if (pinned) {
    ids.push(pinned);
  }
  if (preview && !ids.includes(preview)) ids.push(preview);
  if (hovered && !ids.includes(hovered)) ids.push(hovered);
  app.interactor.setHighlight(ids);
}

function startTourAt(index: number): void {
  tour = startTour(index);
  applyTour();
}

function setTour(next: TourState): void {
  tour = next;
  applyTour();
}

function applyTour(): void {
  const app = experience;
  if (!app) return;
  const stage = currentStage(tour);
  if (!stage) {
    exitTour();
    return;
  }

  pinned = null;
  ui.setPinned(null);
  ui.setStage(stage, tour.index);
  setDimmed(new Set(stage.partIds));
  refreshHighlight();

  const primary = stage.partIds[0];
  if (stage.id === 'strings' || stage.id === 'amplifier') {
    app.director.setPreset('hero');
    ui.setPreset('hero');
  } else if (primary) {
    const bounds = app.guitar.getPartBounds(primary);
    if (bounds) app.director.framePart(primary, bounds);
  } else {
    app.director.setPreset('hero');
    ui.setPreset('hero');
  }
}

function exitTour(resetView = true): void {
  const app = experience;
  tour = endTour();
  pinned = null;
  ui.setPinned(null);
  ui.setStage(null);
  setDimmed(null);
  refreshHighlight();
  if (app && resetView) {
    app.director.setPreset('hero');
    ui.setPreset('hero');
  }
}

function setDimmed(active: ReadonlySet<PartId> | null): void {
  const app = experience;
  if (!app) return;
  for (const [partId, meshes] of app.guitar.partMaterials) {
    const dim = active !== null && !active.has(partId);
    if (dimStates.get(partId) === dim) continue;
    dimStates.set(partId, dim);
    for (const material of meshes) {
      if (!originalMaterials.has(material)) {
        originalMaterials.set(material, {
          transparent: material.transparent,
          opacity: material.opacity,
          depthWrite: material.depthWrite,
        });
      }
      const original = originalMaterials.get(material);
      if (!original) continue;
      material.transparent = dim ? true : original.transparent;
      material.opacity = dim ? 0.12 : original.opacity;
      material.depthWrite = dim ? false : original.depthWrite;
      material.needsUpdate = true;
    }
  }
}

function setExploded(on: boolean, moveCamera = true): void {
  const app = experience;
  exploded = on;
  explodeTarget = on ? 1 : 0;
  applyExplosionPending = true;
  ui.setExploded(on);
  if (moveCamera && app) {
    const preset: ViewPreset = on ? 'exploded' : 'hero';
    app.director.setPreset(preset);
    ui.setPreset(preset);
  }
}

function applyQuality(tier: QualityTier): void {
  const app = experience;
  if (!app) return;
  currentTier = tier;
  const settings: QualitySettings = qualitySettings(tier);
  app.renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.dpr));
  app.renderer.setSize(window.innerWidth, window.innerHeight, false);
  app.pipeline.setQuality(settings);
  app.pipeline.setSize(window.innerWidth, window.innerHeight);
  app.studio.setShadowQuality(settings.shadowMapSize);
  ui.setQuality(tier, settings.label);
}

function onResize(): void {
  const app = experience;
  if (!app) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  app.camera.aspect = width / height;
  app.camera.updateProjectionMatrix();
  app.renderer.setPixelRatio(Math.min(window.devicePixelRatio, qualitySettings(currentTier).dpr));
  app.renderer.setSize(width, height, false);
  app.pipeline.setSize(width, height);
}

function onKeyDown(event: KeyboardEvent): void {
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    if (event.key === 'Escape') target.blur();
    return;
  }
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  if (event.key === 'Escape') {
    if (tour.active) exitTour();
    else if (ui.isIndexOpen()) ui.setIndexOpen(false);
    else clearSelection();
    return;
  }
  if (event.key === 'ArrowRight' && tour.active) {
    event.preventDefault();
    setTour(nextStage(tour));
    return;
  }
  if (event.key === 'ArrowLeft' && tour.active) {
    event.preventDefault();
    setTour(previousStage(tour));
    return;
  }
  if (event.key === 'e' || event.key === 'E') {
    setExploded(!exploded);
    return;
  }
  if (event.key === 's' || event.key === 'S') {
    startTourAt(0);
    return;
  }
  if (event.key === 'h' || event.key === 'H') {
    experience?.director.setPreset('hero');
    ui.setPreset('hero');
    return;
  }
  if (event.key === '/') {
    event.preventDefault();
    ui.focusSearch();
  }
}

declare global {
  interface Window {
    __lesPaul?: {
      select: (id: string) => void;
      hover: (id: string | null, x?: number, y?: number) => void;
      clear: () => void;
      tour: (index?: number) => void;
      next: () => void;
      previous: () => void;
      exitTour: () => void;
      explode: (on: boolean) => void;
      quality: (tier: QualityTier) => void;
      view: (preset: ViewPreset) => void;
      state: () => DebugState;
      snap: () => void;
      bounds: (id: string) => { min: number[]; max: number[] } | null;
      camera: () => { position: number[] | null; target: number[] | null };
    };
  }
}
