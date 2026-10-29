import {
  Color,
  Mesh,
  Raycaster,
  Vector2,
  type Material,
  type PerspectiveCamera,
} from 'three';
import type { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { getPart, type PartId } from '../domain/parts';
import type { BuiltGuitar } from '../scene/buildGuitar';

export interface InteractorCallbacks {
  readonly onHover: (partId: PartId | null, x: number, y: number) => void;
  readonly onSelect: (partId: PartId | null) => void;
}

const EMISSIVE = 0x2a1606;

export class PartInteractor {
  private readonly canvas: HTMLCanvasElement;
  private readonly camera: PerspectiveCamera;
  private readonly guitar: BuiltGuitar;
  private readonly outlinePass: OutlinePass | null;
  private readonly callbacks: InteractorCallbacks;
  private readonly raycaster = new Raycaster();
  private readonly pointer = new Vector2(-2, -2);
  private readonly emissiveState = new Map<Material, { readonly color: number; readonly intensity: number }>();
  private hovered: PartId | null = null;
  private dirty = false;
  private pointerInside = false;
  private pointerType = 'mouse';
  private clientX = 0;
  private clientY = 0;
  private downX = 0;
  private downY = 0;
  private downTime = 0;
  private downActive = false;
  private moved = false;
  private highlighted: readonly PartId[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    camera: PerspectiveCamera,
    guitar: BuiltGuitar,
    outlinePass: OutlinePass | null,
    callbacks: InteractorCallbacks,
  ) {
    this.canvas = canvas;
    this.camera = camera;
    this.guitar = guitar;
    this.outlinePass = outlinePass;
    this.callbacks = callbacks;

    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerleave', this.onPointerLeave);
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointercancel', this.onPointerCancel);
    canvas.style.cursor = 'grab';
  }

  update(): void {
    if (!this.dirty || !this.pointerInside || this.pointerType === 'touch') return;
    this.dirty = false;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects([...this.guitar.pickables], false);
    const hit = hits.find((candidate) => candidate.object instanceof Mesh);
    const raw = hit?.object.userData.partId;
    const partId = typeof raw === 'string' ? (getPart(raw)?.id ?? null) : null;

    if (partId !== this.hovered) {
      this.hovered = partId;
      this.canvas.style.cursor = partId ? 'pointer' : 'grab';
    }
    this.callbacks.onHover(partId, this.clientX, this.clientY);
  }

  setHighlight(partIds: readonly PartId[]): void {
    this.highlighted = partIds;
    if (this.outlinePass) {
      const selected: Mesh[] = [];
      for (const partId of partIds) {
        const meshes = this.guitar.meshesByPart.get(partId);
        if (meshes) selected.push(...meshes);
      }
      this.outlinePass.selectedObjects = selected;
    }

    for (const [partId, materials] of this.guitar.partMaterials) {
      const active = partIds.includes(partId);
      for (const material of materials) {
        const standard = material as Material & {
          emissive?: Color;
          emissiveIntensity?: number;
        };
        if (!standard.emissive) continue;
        if (!this.emissiveState.has(material)) {
          this.emissiveState.set(material, {
            color: standard.emissive.getHex(),
            intensity: standard.emissiveIntensity ?? 1,
          });
        }
        const original = this.emissiveState.get(material);
        if (!original) continue;
        if (active) {
          standard.emissive.setHex(EMISSIVE);
          standard.emissiveIntensity = 0.32;
        } else {
          standard.emissive.setHex(original.color);
          standard.emissiveIntensity = original.intensity;
        }
      }
    }
  }

  clearHover(): void {
    if (this.hovered === null) return;
    this.hovered = null;
    this.canvas.style.cursor = 'grab';
    this.callbacks.onHover(null, this.clientX, this.clientY);
  }

  dispose(): void {
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerleave', this.onPointerLeave);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointercancel', this.onPointerCancel);
    this.setHighlight([]);
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    this.pointerInside = true;
    this.pointerType = event.pointerType;
    this.clientX = event.clientX;
    this.clientY = event.clientY;
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.dirty = true;
    if (this.downActive && Math.hypot(event.clientX - this.downX, event.clientY - this.downY) > 5) {
      this.moved = true;
    }
    if (event.buttons > 0) {
      this.clearHover();
      this.canvas.style.cursor = 'grabbing';
    }
  };

  private readonly onPointerLeave = (): void => {
    this.pointerInside = false;
    this.dirty = false;
    this.clearHover();
  };

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    this.downActive = true;
    this.moved = false;
    this.downX = event.clientX;
    this.downY = event.clientY;
    this.downTime = performance.now();
    this.clientX = event.clientX;
    this.clientY = event.clientY;
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (!this.downActive) return;
    this.downActive = false;
    const elapsed = performance.now() - this.downTime;
    const distance = Math.hypot(event.clientX - this.downX, event.clientY - this.downY);
    if (this.moved || distance > 6 || elapsed > 700) {
      this.canvas.style.cursor = 'grab';
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects([...this.guitar.pickables], false);
    const hit = hits.find((candidate) => candidate.object instanceof Mesh);
    const raw = hit?.object.userData.partId;
    const partId = typeof raw === 'string' ? (getPart(raw)?.id ?? null) : null;
    this.callbacks.onSelect(partId);
    this.canvas.style.cursor = 'grab';
  };

  private readonly onPointerCancel = (): void => {
    this.downActive = false;
    this.clearHover();
  };

  get highlightedIds(): readonly PartId[] {
    return this.highlighted;
  }
}
