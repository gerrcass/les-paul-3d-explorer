import {
  Box3,
  Group,
  Mesh,
  Object3D,
  Vector3,
  type Material,
} from 'three';
import { buildBody } from './body';
import { buildHardware, buildStrings } from './hardware';
import { buildNeck } from './neck';
import { createMaterials } from './materials';
import { isPartId, PART_IDS, type PartId } from '../domain/parts';
import type { GuitarTextures } from './textures';

export interface ExplodeLayer {
  readonly name: string;
  readonly objects: readonly Object3D[];
  readonly offset: number;
  readonly offsetY?: number;
}

export interface BuiltGuitar {
  readonly root: Group;
  readonly pickables: readonly Mesh[];
  readonly meshesByPart: ReadonlyMap<PartId, readonly Mesh[]>;
  readonly partMaterials: ReadonlyMap<PartId, readonly Material[]>;
  readonly invalidPickables: readonly Mesh[];
  readonly explodeLayers: readonly ExplodeLayer[];
  readonly bounds: Box3;
  readonly applyExplosion: (amount: number) => void;
  readonly getPartBounds: (partId: PartId) => Box3 | null;
}

export interface BuildOptions {
  readonly textures?: GuitarTextures | null;
}

export function buildLesPaul(options: BuildOptions = {}): BuiltGuitar {
  const textures = options.textures ?? null;
  const materials = createMaterials(textures ?? undefined);
  const root = new Group();
  root.name = 'les-paul';

  const body = buildBody(materials);
  const neck = buildNeck(materials, textures);
  const hardware = buildHardware(materials, textures);
  const strings = buildStrings(materials, neck.tunerPosts);

  root.add(body.group, neck.group, hardware, strings);
  root.updateMatrixWorld(true);

  const pickables: Mesh[] = [];
  const invalidPickables: Mesh[] = [];
  const meshesByPart = new Map<PartId, Mesh[]>();
  for (const partId of PART_IDS) meshesByPart.set(partId, []);

  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const raw = object.userData.partId;
    if (typeof raw !== 'string') return;
    if (!isPartId(raw)) {
      invalidPickables.push(object);
      return;
    }
    pickables.push(object);
    meshesByPart.get(raw)?.push(object);
  });

  const materialCache = new Map<string, Material>();
  const partMaterials = new Map<PartId, Material[]>();
  for (const [partId, meshes] of meshesByPart) {
    const materialsForPart: Material[] = [];
    for (const mesh of meshes) {
      const clone = (material: Material): Material => {
        const key = `${partId}:${material.uuid}`;
        let cached = materialCache.get(key);
        if (!cached) {
          cached = material.clone();
          materialCache.set(key, cached);
        }
        if (!materialsForPart.includes(cached)) materialsForPart.push(cached);
        return cached;
      };
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(clone) : clone(mesh.material);
    }
    partMaterials.set(partId, materialsForPart);
  }

  const object = (name: string): Object3D | null => root.getObjectByName(name) ?? null;
  const collect = (...names: string[]): Object3D[] =>
    names.map((name) => object(name)).filter((value): value is Object3D => value !== null);

  const explodeLayers: ExplodeLayer[] = [
    {
      name: 'body',
      objects: collect('mahogany-back', 'cavity-cover-group', 'strap-buttons-group'),
      offset: -1.0,
      offsetY: 0,
    },
    {
      name: 'top',
      objects: collect('carved-maple-top', 'binding-group', 'pickguard-group'),
      offset: 2.0,
      offsetY: 0,
    },
    {
      name: 'neck',
      objects: collect('neck'),
      offset: 0,
      offsetY: 0,
    },
    {
      name: 'electronics',
      objects: collect(
        'neck-pickup',
        'bridge-pickup',
        'switch-assembly',
        'jack-assembly',
        'volume-knobs-0',
        'volume-knobs-1',
        'tone-knobs-0',
        'tone-knobs-1',
      ),
      offset: 5.0,
      offsetY: 0,
    },
    {
      name: 'hardware',
      objects: collect('bridge-assembly', 'tailpiece-assembly'),
      offset: 8.0,
      offsetY: 0,
    },
    {
      name: 'strings',
      objects: collect('strings'),
      offset: 11.5,
      offsetY: 0,
    },
  ];

  const basePositions = new Map<Object3D, Vector3>();
  for (const layer of explodeLayers) {
    for (const item of layer.objects) {
      if (!basePositions.has(item)) basePositions.set(item, item.position.clone());
    }
  }

  const applyExplosion = (amount: number): void => {
    const eased = Math.max(0, Math.min(1, amount));
    for (const layer of explodeLayers) {
      for (const item of layer.objects) {
        const base = basePositions.get(item);
        if (!base) continue;
        item.position.z = base.z + layer.offset * eased;
        item.position.y = base.y + (layer.offsetY ?? 0) * eased;
      }
    }
    root.updateMatrixWorld(true);
  };

  const getPartBounds = (partId: PartId): Box3 | null => {
    const meshes = meshesByPart.get(partId);
    if (!meshes || meshes.length === 0) return null;
    root.updateMatrixWorld(true);
    const box = new Box3();
    for (const mesh of meshes) box.expandByObject(mesh, true);
    return box.isEmpty() ? null : box;
  };

  const bounds = new Box3().setFromObject(root, true);

  return {
    root,
    pickables,
    meshesByPart,
    partMaterials,
    invalidPickables,
    explodeLayers,
    bounds,
    applyExplosion,
    getPartBounds,
  };
}
