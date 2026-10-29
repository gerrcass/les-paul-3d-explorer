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
  readonly gold: MeshStandardMaterial;
  readonly goldSatin: MeshStandardMaterial;
  readonly ebony: MeshPhysicalMaterial;
  readonly veneer: MeshPhysicalMaterial;
  readonly blackPlastic: MeshStandardMaterial;
  readonly bone: MeshStandardMaterial;
  readonly pearl: MeshPhysicalMaterial;
  readonly string: MeshStandardMaterial;
  readonly fretWire: MeshStandardMaterial;
  readonly knobBlack: MeshPhysicalMaterial;
  readonly screw: MeshStandardMaterial;
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
  const mahogany = physical(0x050505, 0.22, 0.85, { clearcoatRoughness: 0.08, envMapIntensity: 1.15 });

  const mapleTop = physical(0x050505, 0.16, 1, {
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.25,
  });

  const ebony = physical(0x050403, 0.88, 0.05, {
    specularIntensity: 0.08,
    envMapIntensity: 0.05,
    clearcoatRoughness: 0.4,
  });
  applyTexture(ebony, textures?.veneer);
  if (textures) {
    ebony.bumpMap = textures.veneer;
    ebony.bumpScale = 0.008;
  }

  const veneer = physical(0x030202, 0.72, 0.12, {
    clearcoatRoughness: 0.4,
    envMapIntensity: 0.2,
  });
  applyTexture(veneer, textures?.veneer);

  const materials: MaterialSet = {
    mahogany,
    mapleTop,
    cream: physical(0xe8dcc4, 0.55, 0.3, { clearcoatRoughness: 0.42, envMapIntensity: 0.35 }),
    agedCream: physical(0xe4d7bd, 0.6, 0.15, { clearcoatRoughness: 0.45, envMapIntensity: 0.25 }),
    nickel: standard(0x8f928f, 0.46, 1, { envMapIntensity: 0.62 }),
    gold: standard(0xd7b264, 0.22, 1, { envMapIntensity: 1.25 }),
    goldSatin: standard(0xc9a65a, 0.45, 1, { envMapIntensity: 0.8 }),
    ebony,
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
    knobBlack: physical(0x050505, 0.22, 0.9, { clearcoatRoughness: 0.08, envMapIntensity: 0.9 }),
    screw: standard(0xc9a65a, 0.3, 1, { envMapIntensity: 1.05 }),
  };
  materials.mahogany.name = 'gloss-black-body';
  materials.mapleTop.name = 'gloss-black-top';
  materials.ebony.name = 'ebony';
  materials.gold.name = 'gold';
  materials.goldSatin.name = 'gold-satin';
  materials.pearl.name = 'pearl';
  materials.cream.name = 'cream';
  materials.agedCream.name = 'aged-cream';
  materials.knobBlack.name = 'knob-black';
  return materials;
}
