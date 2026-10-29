import {
  Box3,
  MathUtils,
  PerspectiveCamera,
  Sphere,
  Vector3,
} from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { PartId } from '../domain/parts';

export type ViewPreset = 'hero' | 'body' | 'neck' | 'hardware' | 'exploded';

export interface CameraPose {
  readonly position: Vector3;
  readonly target: Vector3;
}

const MOBILE_HERO: CameraPose = {
  position: new Vector3(14, 18, 88),
  target: new Vector3(0, 16, 0),
};

export const VIEW_PRESETS: Readonly<Record<ViewPreset, CameraPose>> = {
  hero: { position: new Vector3(18, 14.5, 72), target: new Vector3(0, 12, 0) },
  body: { position: new Vector3(6.5, 3, 36), target: new Vector3(0, 0.8, 0.5) },
  neck: { position: new Vector3(10, 21, 46), target: new Vector3(0, 19.5, 1.2) },
  hardware: { position: new Vector3(4, 4, 30), target: new Vector3(0, 2.6, 1.2) },
  exploded: { position: new Vector3(72, 16, 50), target: new Vector3(0, 12, 0) },
};

const BACK_PARTS = new Set<PartId>(['control-cavity-cover']);
const SIDE_PARTS = new Set<PartId>(['output-jack']);
const HIGH_PARTS = new Set<PartId>([
  'headstock',
  'headstock-veneer',
  'logo',
  'tuners',
  'truss-rod-cover',
  'nut',
]);

export function heroPose(): CameraPose {
  if (typeof window !== 'undefined' && window.innerWidth <= 760) return MOBILE_HERO;
  return VIEW_PRESETS.hero;
}

export function focusDirection(partId: PartId): Vector3 {
  if (BACK_PARTS.has(partId)) return new Vector3(-0.45, 0.08, -1).normalize();
  if (SIDE_PARTS.has(partId)) return new Vector3(1, 0.1, 0.18).normalize();
  if (HIGH_PARTS.has(partId)) return new Vector3(0.55, 0.1, 1).normalize();
  return new Vector3(0.42, 0.14, 1).normalize();
}

export class CameraDirector {
  private readonly camera: PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly fromPosition = new Vector3();
  private readonly toPosition = new Vector3();
  private readonly fromTarget = new Vector3();
  private readonly toTarget = new Vector3();
  private elapsed = 0;
  private duration = 0;
  private animating = false;
  private reducedMotion = false;

  constructor(camera: PerspectiveCamera, controls: OrbitControls) {
    this.camera = camera;
    this.controls = controls;
    controls.addEventListener('start', this.cancel);
  }

  setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
  }

  flyTo(pose: CameraPose, duration = 1.15): void {
    this.fromPosition.copy(this.camera.position);
    this.fromTarget.copy(this.controls.target);
    this.toPosition.copy(pose.position);
    this.toTarget.copy(pose.target);
    this.elapsed = 0;
    this.duration = this.reducedMotion ? 0 : duration;
    this.animating = true;
    if (this.duration === 0) this.finish();
  }

  setPreset(preset: ViewPreset): void {
    const pose = preset === 'hero' ? heroPose() : VIEW_PRESETS[preset];
    this.flyTo(pose, preset === 'hero' ? 1.4 : 1.05);
  }

  framePart(partId: PartId, bounds: Box3): void {
    const sphere = bounds.getBoundingSphere(new Sphere());
    const radius = Math.max(sphere.radius, 0.75);
    const verticalFov = MathUtils.degToRad(this.camera.fov);
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * this.camera.aspect);
    const limitingFov = Math.min(verticalFov, horizontalFov);
    const distance = MathUtils.clamp((radius / Math.sin(limitingFov / 2)) * 1.18, 12, 110);
    const direction = focusDirection(partId);
    const target = sphere.center.clone();
    const position = target.clone().addScaledVector(direction, distance);
    this.flyTo({ position, target }, 0.95);
  }

  update(delta: number): void {
    if (!this.animating) return;
    this.elapsed += delta;
    const t = this.duration === 0 ? 1 : Math.min(1, this.elapsed / this.duration);
    const eased = t * t * (3 - 2 * t);
    this.camera.position.lerpVectors(this.fromPosition, this.toPosition, eased);
    this.controls.target.lerpVectors(this.fromTarget, this.toTarget, eased);
    this.controls.update();
    if (t >= 1) this.animating = false;
  }

  cancel = (): void => {
    this.animating = false;
  };

  private finish(): void {
    this.camera.position.copy(this.toPosition);
    this.controls.target.copy(this.toTarget);
    this.controls.update();
    this.animating = false;
  }

  dispose(): void {
    this.controls.removeEventListener('start', this.cancel);
  }
}
