import {
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type ColorRepresentation,
  type MeshStandardMaterialParameters,
  type Texture,
} from 'three';
import type { GuitarTextures } from './textures';

export interface MaterialSet {
  readonly mahogany: MeshPhysicalMaterial;
  readonly mapleTop: MeshPhysicalMaterial;
  readonly cream: MeshPhysicalMaterial;
  readonly agedCream: MeshPhysicalMaterial;
  readonly nickel: MeshStandardMaterial;
  readonly chrome: MeshStandardMaterial;
  readonly aluminium: MeshStandardMaterial;
  readonly gold: MeshStandardMaterial;
  readonly rosewood: MeshStandardMaterial;
  readonly veneer: MeshPhysicalMaterial;
  readonly blackPlastic: MeshStandardMaterial;
  readonly bone: MeshStandardMaterial;
  readonly pearl: MeshPhysicalMaterial;
  readonly string: MeshStandardMaterial;
  readonly fretWire: MeshStandardMaterial;
  readonly amber: MeshPhysicalMaterial;
  readonly screw: MeshStandardMaterial;
  readonly pickupBobbin: MeshPhysicalMaterial;
}

function standard(
  color: ColorRepresentation,
  roughness: number,
  metalness: number,
  extra: MeshStandardMaterialParameters = {},
): MeshStandardMaterial {
  return new MeshStandardMaterial({
    color,
    roughness,
    metalness,
    envMapIntensity: 1,
    ...extra,
  });
}

function physical(
  color: ColorRepresentation,
  roughness: number,
  clearcoat: number,
  extra: Partial<ConstructorParameters<typeof MeshPhysicalMaterial>[0]> = {},
): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    color,
    roughness,
    metalness: 0,
    clearcoat,
    clearcoatRoughness: 0.16,
    envMapIntensity: 0.9,
    ...extra,
  });
}

function applyTexture(material: MeshPhysicalMaterial | MeshStandardMaterial, texture: Texture | undefined): void {
  if (!texture) return;
  material.map = texture;
  material.needsUpdate = true;
}

export function createMaterials(textures?: GuitarTextures): MaterialSet {
  const mahogany = physical(0x74432c, 0.52, 0.24, { clearcoatRoughness: 0.34, envMapIntensity: 0.55 });
  applyTexture(mahogany, textures?.mahogany);
  if (textures) {
    mahogany.bumpMap = textures.mahogany;
    mahogany.bumpScale = 0.018;
  }

  const mapleTop = physical(0xffffff, 0.4, 0.62, {
    clearcoatRoughness: 0.2,
    envMapIntensity: 0.62,
  });
  applyTexture(mapleTop, textures?.sunburst);

  const rosewood = standard(0x4f3527, 0.74, 0, { envMapIntensity: 0.3 });
  applyTexture(rosewood, textures?.rosewood);
  if (textures) {
    rosewood.bumpMap = textures.rosewood;
    rosewood.bumpScale = 0.012;
  }

  const veneer = physical(0x030202, 0.72, 0.12, {
    clearcoatRoughness: 0.4,
    envMapIntensity: 0.2,
  });
  applyTexture(veneer, textures?.veneer);

  return {
    mahogany,
    mapleTop,
    cream: physical(0xc6b38c, 0.8, 0.04, { clearcoatRoughness: 0.55, envMapIntensity: 0.18 }),
    agedCream: physical(0xd2bc92, 0.62, 0.2, { clearcoatRoughness: 0.48, envMapIntensity: 0.3 }),
    nickel: standard(0x8f928f, 0.46, 1, { envMapIntensity: 0.62 }),
    chrome: standard(0xdadbd8, 0.12, 1, { envMapIntensity: 1.1 }),
    aluminium: standard(0xbabdbb, 0.36, 1, { envMapIntensity: 0.9 }),
    gold: standard(0xc7a04a, 0.3, 1, { envMapIntensity: 1.2 }),
    rosewood,
    veneer,
    blackPlastic: standard(0x161311, 0.5, 0.05),
    bone: standard(0xe7dbc0, 0.52, 0),
    pearl: physical(0xeee4cf, 0.3, 0.65, {
      metalness: 0.08,
      iridescence: 0.3,
      iridescenceIOR: 1.35,
      clearcoatRoughness: 0.18,
      envMapIntensity: 0.7,
    }),
    string: standard(0xaeb2ae, 0.32, 1, { envMapIntensity: 0.85 }),
    fretWire: standard(0xc4c7c3, 0.26, 1, { envMapIntensity: 1.05 }),
    amber: physical(0xd09a39, 0.3, 0.8, { clearcoatRoughness: 0.12, envMapIntensity: 0.9 }),
    screw: standard(0x8f918f, 0.34, 1),
    pickupBobbin: physical(0xdcc9a4, 0.6, 0.18, { clearcoatRoughness: 0.46, envMapIntensity: 0.42 }),
  };
}
