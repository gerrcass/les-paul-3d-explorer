import {
  CircleGeometry,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  Path,
  RingGeometry,
  Shape,
  SphereGeometry,
  Vector2,
  Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {
  BRIDGE_SADDLE_Z,
  BRIDGE_Y,
  NUT_STRING_Z,
  NUT_Y,
  STRING_GAUGES,
  STRING_XS_BRIDGE,
  STRING_XS_NUT,
} from './constants';
import {
  cylinderBetween,
  roundedRectShape,
  tag,
} from './geometry';
import { bodySurfaceZ } from './body';
import type { MaterialSet } from './materials';
import type { GuitarTextures } from './textures';

const NECK_PICKUP_Y = 5.15;
const BRIDGE_PICKUP_Y = 2.45;
const VOLUME_KNOBS = [
  [3.95, -2.1],
  [2.25, -2.9],
] as const;
const TONE_KNOBS = [
  [3.95, -4.25],
  [2.25, -5.05],
] as const;

export function buildHardware(materials: MaterialSet, textures: GuitarTextures | null): Group {
  const group = new Group();
  group.name = 'hardware';

  group.add(buildPickup('neck-pickup', NECK_PICKUP_Y, materials));
  group.add(buildPickup('bridge-pickup', BRIDGE_PICKUP_Y, materials));
  group.add(buildBridge(materials));
  group.add(buildTailpiece(materials));
  group.add(buildSwitch(materials, textures));
  group.add(buildJack(materials));
  VOLUME_KNOBS.forEach(([x, y], index) => {
    const knob = buildKnob(x, y, 'volume-knobs', materials, textures);
    knob.name = `volume-knobs-${index}`;
    group.add(knob);
  });
  TONE_KNOBS.forEach(([x, y], index) => {
    const knob = buildKnob(x, y, 'tone-knobs', materials, textures);
    knob.name = `tone-knobs-${index}`;
    group.add(knob);
  });

  return group;
}

function stringZAt(y: number): number {
  return BRIDGE_SADDLE_Z + ((NUT_STRING_Z - BRIDGE_SADDLE_Z) * (y - BRIDGE_Y)) / (NUT_Y - BRIDGE_Y);
}

function buildPickup(partId: 'neck-pickup' | 'bridge-pickup', yCenter: number, materials: MaterialSet): Group {
  const group = new Group();
  group.name = partId;
  const top = stringZAt(yCenter) - (partId === 'neck-pickup' ? 0.1 : 0.08);
  const ringBase = bodySurfaceZ(0, yCenter);
  const ringTop = Math.max(ringBase + 0.07, top - 0.3);

  const ringShape = pickupRingShape(3.4, 1.95, 2.76, 1.3);
  const ringGeometry = new ExtrudeGeometry(ringShape, {
    depth: Math.max(0.06, ringTop - ringBase),
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 10,
    steps: 1,
  });
  ringGeometry.translate(0, yCenter, ringBase);
  const ring = new Mesh(ringGeometry, materials.cream);
  ring.name = `${partId}-ring`;
  ring.castShadow = true;
  tag(ring, 'pickup-rings');
  group.add(ring);

  for (const side of [-1, 1] as const) {
    const bobbin = new Mesh(new RoundedBoxGeometry(2.62, 0.5, 0.48, 3, 0.07), materials.pickupBobbin);
    bobbin.position.set(0, yCenter + side * 0.3, top - 0.25);
    bobbin.castShadow = true;
    tag(bobbin, partId);
    group.add(bobbin);
  }

  const basePlate = new Mesh(new RoundedBoxGeometry(2.92, 1.18, 0.06, 2, 0.05), materials.nickel);
  basePlate.position.set(0, yCenter, top - 0.47);
  tag(basePlate, partId);
  group.add(basePlate);

  for (const side of [-1, 1] as const) {
    for (let i = 0; i < 6; i += 1) {
      const pole = new Mesh(new CylinderGeometry(0.052, 0.052, 0.15, 10), materials.nickel);
      pole.rotation.x = Math.PI / 2;
      pole.position.set(-1.05 + i * 0.42, yCenter + side * 0.3, top - 0.035);
      tag(pole, 'pickup-poles');
      group.add(pole);
    }
  }

  for (const side of [-1, 1] as const) {
    const ringHeight = Math.max(0.06, ringTop - ringBase);
    const screw = cylinderBetween(
      new Vector3(side * 1.42, yCenter, ringBase + ringHeight + 0.02),
      new Vector3(side * 1.42, yCenter, ringBase + ringHeight + 0.07),
      0.05,
      materials.nickel,
      8,
    );
    tag(screw, 'pickup-rings');
    group.add(screw);
  }

  return group;
}

function pickupRingShape(outerWidth: number, outerHeight: number, innerWidth: number, innerHeight: number): Shape {
  const outer = roundedRectShape(outerWidth, outerHeight, 0.3);
  const inner = roundedRectShape(innerWidth, innerHeight, 0.18);
  const hole = new Path(inner.getPoints(24).reverse());
  outer.holes.push(hole);
  return outer;
}

function buildBridge(materials: MaterialSet): Group {
  const group = new Group();
  group.name = 'bridge-assembly';
  const surface = bodySurfaceZ(0, BRIDGE_Y);

  const bar = new Mesh(new RoundedBoxGeometry(3.45, 0.55, 0.26, 3, 0.07), materials.nickel);
  bar.position.set(0, BRIDGE_Y, surface + 0.24);
  bar.castShadow = true;
  tag(bar, 'bridge');
  group.add(bar);

  for (const side of [-1, 1] as const) {
    const post = new Mesh(new CylinderGeometry(0.075, 0.075, 0.62, 12), materials.nickel);
    post.position.set(side * 1.38, BRIDGE_Y, surface + 0.2);
    tag(post, 'bridge-posts');
    group.add(post);

    const thumbwheel = new Mesh(new CylinderGeometry(0.17, 0.17, 0.07, 18), materials.nickel);
    thumbwheel.position.set(side * 1.38, BRIDGE_Y, surface + 0.26);
    tag(thumbwheel, 'bridge-posts');
    group.add(thumbwheel);

    const anchor = new Mesh(new CylinderGeometry(0.14, 0.14, 0.08, 14), materials.nickel);
    anchor.position.set(side * 1.38, BRIDGE_Y, surface - 0.02);
    tag(anchor, 'bridge-posts');
    group.add(anchor);
  }

  for (let i = 0; i < 6; i += 1) {
    const x = STRING_XS_BRIDGE[i]!;
    const saddle = new Mesh(new RoundedBoxGeometry(0.38, 0.62, 0.1, 2, 0.03), materials.nickel);
    saddle.position.set(x, BRIDGE_Y - 0.02, surface + 0.39);
    tag(saddle, 'saddles');
    group.add(saddle);

    const screw = new Mesh(new CylinderGeometry(0.028, 0.028, 0.45, 8), materials.nickel);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(x, BRIDGE_Y - 0.42, surface + 0.36);
    tag(screw, 'saddles');
    group.add(screw);
  }

  return group;
}

function buildTailpiece(materials: MaterialSet): Group {
  const group = new Group();
  group.name = 'tailpiece-assembly';
  const y = -0.58;
  const surface = bodySurfaceZ(0, y);

  const bar = new Mesh(new RoundedBoxGeometry(3.4, 0.52, 0.3, 3, 0.08), materials.aluminium);
  bar.position.set(0, y, surface + 0.14);
  bar.castShadow = true;
  tag(bar, 'tailpiece');
  group.add(bar);

  for (let i = 0; i < 6; i += 1) {
    const x = STRING_XS_BRIDGE[i]!;
    const hole = new Mesh(new CylinderGeometry(0.065, 0.065, 0.34, 10), materials.blackPlastic);
    hole.rotation.x = Math.PI / 2;
    hole.position.set(x, y, surface + 0.14);
    tag(hole, 'tailpiece');
    group.add(hole);
    void x;
  }

  for (const side of [-1, 1] as const) {
    const stud = new Mesh(new CylinderGeometry(0.13, 0.13, 0.46, 14), materials.nickel);
    stud.position.set(side * 1.48, y, surface + 0.02);
    tag(stud, 'tailpiece');
    group.add(stud);

    const anchor = new Mesh(new CylinderGeometry(0.2, 0.2, 0.07, 16), materials.nickel);
    anchor.position.set(side * 1.48, y, surface - 0.01);
    tag(anchor, 'tailpiece');
    group.add(anchor);
  }

  return group;
}

function buildKnob(
  x: number,
  y: number,
  partId: 'volume-knobs' | 'tone-knobs',
  materials: MaterialSet,
  textures: GuitarTextures | null,
): Group {
  const group = new Group();
  const base = bodySurfaceZ(x, y) + 0.015;

  const washer = new Mesh(new CylinderGeometry(0.44, 0.44, 0.022, 28), materials.nickel);
  washer.rotation.x = Math.PI / 2;
  washer.position.set(x, y, base);
  tag(washer, partId);
  group.add(washer);

  const profile = [
    new Vector2(0.3, 0),
    new Vector2(0.34, 0.035),
    new Vector2(0.365, 0.09),
    new Vector2(0.365, 0.24),
    new Vector2(0.34, 0.29),
    new Vector2(0.24, 0.345),
    new Vector2(0, 0.36),
  ];
  const body = new Mesh(new LatheGeometry(profile, 12), materials.amber);
  body.rotation.x = Math.PI / 2;
  body.position.set(x, y, base + 0.015);
  body.castShadow = true;
  tag(body, partId);
  group.add(body);

  const topMaterial = new MeshStandardMaterial({
    map: (partId === 'volume-knobs' ? textures?.knobTopVolume : textures?.knobTopTone) ?? null,
    color: textures ? 0xffffff : 0xd7a33f,
    roughness: 0.28,
    metalness: 0.05,
    envMapIntensity: 1.1,
  });
  const top = new Mesh(new CircleGeometry(0.315, 32), topMaterial);
  top.position.set(x, y, base + 0.378);
  tag(top, partId);
  group.add(top);

  return group;
}

function buildSwitch(materials: MaterialSet, textures: GuitarTextures | null): Group {
  const group = new Group();
  group.name = 'switch-assembly';
  const x = 4.15;
  const y = 5.55;
  const surface = bodySurfaceZ(x, y);

  if (textures) {
    const chipMaterial = new MeshStandardMaterial({
      map: textures.pokerChip,
      transparent: true,
      alphaTest: 0.06,
      roughness: 0.42,
      metalness: 0.02,
      side: DoubleSide,
      depthWrite: false,
    });
    const chip = new Mesh(new CircleGeometry(0.67, 48), chipMaterial);
    chip.position.set(x, y, surface + 0.026);
    tag(chip, 'switch-ring');
    group.add(chip);
  } else {
    const chip = new Mesh(new RingGeometry(0.3, 0.63, 48), materials.cream);
    chip.position.set(x, y, surface + 0.026);
    tag(chip, 'switch-ring');
    group.add(chip);
  }

  const nut = new Mesh(new CylinderGeometry(0.2, 0.2, 0.08, 16), materials.nickel);
  nut.rotation.x = Math.PI / 2;
  nut.position.set(x, y, surface + 0.06);
  tag(nut, 'selector-switch');
  group.add(nut);

  const shaftStart = new Vector3(x, y, surface + 0.07);
  const shaftEnd = new Vector3(x, y + 0.18, surface + 0.46);
  const shaft = cylinderBetween(shaftStart, shaftEnd, 0.055, materials.nickel, 10);
  tag(shaft, 'selector-switch');
  group.add(shaft);

  const tip = new Mesh(new SphereGeometry(0.12, 16, 12), materials.cream);
  tip.scale.set(0.85, 1.25, 0.85);
  tip.position.copy(shaftEnd);
  tag(tip, 'selector-switch');
  group.add(tip);

  return group;
}

function buildJack(materials: MaterialSet): Group {
  const group = new Group();
  group.name = 'jack-assembly';
  const plate = new Mesh(new RoundedBoxGeometry(0.92, 1.02, 0.06, 2, 0.08), materials.blackPlastic);
  plate.rotation.y = Math.PI / 2;
  plate.position.set(6.27, -3.3, 0.1);
  tag(plate, 'output-jack');
  group.add(plate);

  const jack = new Mesh(new CylinderGeometry(0.19, 0.19, 0.36, 18), materials.nickel);
  jack.rotation.z = Math.PI / 2;
  jack.position.set(6.38, -3.3, 0.1);
  tag(jack, 'output-jack');
  group.add(jack);

  const hole = new Mesh(new CylinderGeometry(0.105, 0.105, 0.02, 16), materials.blackPlastic);
  hole.rotation.z = Math.PI / 2;
  hole.position.set(6.57, -3.3, 0.1);
  tag(hole, 'output-jack');
  group.add(hole);

  return group;
}

export function buildStrings(materials: MaterialSet, tunerPosts: readonly Vector3[]): Group {
  const group = new Group();
  group.name = 'strings';

  for (let index = 0; index < 6; index += 1) {
    const radius = STRING_GAUGES[index] ?? 0.02;
    const bridgeX = STRING_XS_BRIDGE[index]!;
    const nutX = STRING_XS_NUT[index]!;
    const tailZ = bodySurfaceZ(0, -0.58) + 0.3;
    const points = [
      new Vector3(bridgeX, -0.58, tailZ),
      new Vector3(bridgeX, BRIDGE_Y, BRIDGE_SADDLE_Z),
      new Vector3(nutX, NUT_Y, NUT_STRING_Z),
      tunerPosts[index]?.clone() ?? new Vector3(nutX, NUT_Y + 0.4, NUT_STRING_Z),
    ];

    for (let segment = 0; segment < points.length - 1; segment += 1) {
      const start = points[segment]!;
      const end = points[segment + 1]!;
      const string = cylinderBetween(start, end, radius, materials.string, 8);
      string.name = `string-${index + 1}`;
      string.castShadow = false;
      tag(string, 'strings');
      group.add(string);
    }

    for (const point of [points[1]!, points[2]!]) {
      const bend = new Mesh(new SphereGeometry(radius * 1.15, 8, 6), materials.string);
      bend.position.copy(point);
      tag(bend, 'strings');
      group.add(bend);
    }
  }

  return group;
}
