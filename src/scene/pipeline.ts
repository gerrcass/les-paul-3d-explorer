import {
  PerspectiveCamera,
  Scene,
  Vector2,
  type WebGLRenderer,
} from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import type { QualitySettings } from './quality';

export interface RenderPipeline {
  readonly outlinePass: OutlinePass;
  readonly render: () => void;
  readonly setSize: (width: number, height: number) => void;
  readonly setQuality: (settings: QualitySettings) => void;
  readonly dispose: () => void;
}

export function createPipeline(
  renderer: WebGLRenderer,
  scene: Scene,
  camera: PerspectiveCamera,
  quality: QualitySettings,
): RenderPipeline {
  const size = renderer.getSize(new Vector2());
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, quality.dpr));
  composer.setSize(size.x, size.y);

  composer.addPass(new RenderPass(scene, camera));

  const outlinePass = new OutlinePass(new Vector2(size.x, size.y), scene, camera);
  outlinePass.edgeStrength = 3.1;
  outlinePass.edgeGlow = 0.35;
  outlinePass.edgeThickness = 1.1;
  outlinePass.pulsePeriod = 0;
  outlinePass.visibleEdgeColor.setHex(0xffd08c);
  outlinePass.hiddenEdgeColor.setHex(0x422710);
  outlinePass.enabled = quality.outline;
  composer.addPass(outlinePass);

  const bloomPass = new UnrealBloomPass(new Vector2(size.x, size.y), 0.05, 0.4, 1);
  bloomPass.enabled = quality.bloom;
  composer.addPass(bloomPass);

  composer.addPass(new OutputPass());

  const render = (): void => {
    composer.render();
  };

  const setSize = (width: number, height: number): void => {
    composer.setSize(width, height);
    outlinePass.setSize(width, height);
    bloomPass.setSize(width, height);
  };

  const setQuality = (settings: QualitySettings): void => {
    composer.setPixelRatio(Math.min(window.devicePixelRatio, settings.dpr));
    outlinePass.enabled = settings.outline;
    bloomPass.enabled = settings.bloom;
    renderer.shadowMap.enabled = true;
  };

  const dispose = (): void => {
    composer.dispose();
  };

  return { outlinePass, render, setSize, setQuality, dispose };
}
