import {
  CatmullRomCurve3,
  ExtrudeGeometry,
  Group,
  Mesh,
  ShapeGeometry,
  SphereGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from 'three';
import {
  BODY_BACK_Z,
  BODY_OUTLINE,
  BODY_THICKNESS,
  BODY_TOP_Z,
  CARVE_HEIGHT,
  smoothstep,
} from './constants';
import {
  cylinderBetween,
  planarUv,
  roundedRectShape,
  sampledClosedCurve,
  shapeFromPoints,
  subdivideAndDome,
  tag,
} from './geometry';
import type { MaterialSet } from './materials';

const OUTLINE_POINTS = sampledClosedCurve(BODY_OUTLINE, 280);
const OUTLINE_VECTORS = OUTLINE_POINTS.map((point) => new Vector3(point.x, point.y, 0));

export interface BodyBuild {
  readonly group: Group;
  readonly outline: readonly Vector2[];
}

export function buildBody(materials: MaterialSet): BodyBuild {
  const group = new Group();
  group.name = 'body';

  const shape = shapeFromPoints(OUTLINE_POINTS);

  const bevelThickness = 0.14;
  const backGeometry = new ExtrudeGeometry(shape, {
    depth: BODY_THICKNESS - bevelThickness * 2,
    bevelEnabled: true,
    bevelThickness,
    bevelSize: 0.07,
    bevelSegments: 5,
    curveSegments: 4,
    steps: 1,
  });
  backGeometry.translate(0, 0, BODY_BACK_Z + bevelThickness);
  const back = new Mesh(backGeometry, materials.mahogany);
  back.name = 'mahogany-back';
  back.castShadow = true;
  back.receiveShadow = true;
  tag(back, 'body-back');
  group.add(back);

  const capBase = new ShapeGeometry(shape, 4);
  const capGeometry = subdivideAndDome(capBase, bodySurfaceZ, 3);
  capBase.dispose();
  planarUv(capGeometry, -6.4, 6.4, -8.7, 8.5);
  const cap = new Mesh(capGeometry, materials.mapleTop);
  cap.name = 'carved-maple-top';
  cap.castShadow = true;
  cap.receiveShadow = true;
  tag(cap, 'maple-top');
  group.add(cap);

  group.add(buildBinding(materials));
  group.add(buildPickguard(materials));
  group.add(buildControlCover(materials));
  group.add(buildStrapButtons(materials));

  return { group, outline: OUTLINE_POINTS };
}

function buildBinding(materials: MaterialSet): Group {
  const group = new Group();
  group.name = 'binding-group';
  const curve = new CatmullRomCurve3(
    OUTLINE_VECTORS.map((point) => new Vector3(point.x, point.y, BODY_TOP_Z + 0.055)),
    true,
    'catmullrom',
    0.5,
  );
  const binding = new Mesh(new TubeGeometry(curve, 320, 0.082, 8, true), materials.agedCream);
  binding.name = 'body-binding';
  binding.castShadow = true;
  binding.receiveShadow = true;
  tag(binding, 'body-binding');
  group.add(binding);
  return group;
}

function buildPickguard(materials: MaterialSet): Group {
  const group = new Group();
  group.name = 'pickguard-group';
  const controlPoints = [
    new Vector2(2.0, 4.55),
    new Vector2(3.0, 4.55),
    new Vector2(4.05, 4.25),
    new Vector2(4.65, 3.6),
    new Vector2(5.0, 2.75),
    new Vector2(4.95, 1.85),
    new Vector2(4.75, 0.95),
    new Vector2(4.4, 0.05),
    new Vector2(4.0, -0.55),
    new Vector2(3.6, 0.15),
    new Vector2(3.65, 1.05),
    new Vector2(3.5, 1.95),
    new Vector2(3.15, 2.8),
    new Vector2(2.65, 3.5),
    new Vector2(2.2, 3.95),
  ];
  const points = sampledClosedCurve(controlPoints, 180);

  const shape = shapeFromPoints(points);
  const flat = new ShapeGeometry(shape, 12);
  const plateGeometry = subdivideAndDome(flat, (x, y) => bodySurfaceZ(x, y) + 0.18, 3);
  flat.dispose();
  const plate = new Mesh(plateGeometry, materials.cream);
  plate.name = 'pickguard';
  plate.castShadow = false;
  plate.receiveShadow = true;
  tag(plate, 'pickguard');
  group.add(plate);

  const borderCurve = new CatmullRomCurve3(
    points.map((point) => new Vector3(point.x, point.y, bodySurfaceZ(point.x, point.y) + 0.18)),
    true,
    'catmullrom',
    0.3,
  );
  const border = new Mesh(new TubeGeometry(borderCurve, 200, 0.022, 6, true), materials.agedCream);
  border.name = 'pickguard-edge';
  tag(border, 'pickguard');
  group.add(border);

  const screw = cylinderBetween(
    new Vector3(4.2, 0.2, bodySurfaceZ(4.2, 0.2) + 0.2),
    new Vector3(4.2, 0.2, bodySurfaceZ(4.2, 0.2) + 0.24),
    0.052,
    materials.nickel,
    10,
  );
  tag(screw, 'pickguard');
  group.add(screw);

  return group;
}

function buildControlCover(materials: MaterialSet): Group {
  const group = new Group();
  group.name = 'cavity-cover-group';
  const shape = roundedRectShape(3.3, 2.05, 0.2);
  const geometry = new ExtrudeGeometry(shape, {
    depth: 0.055,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.018,
    bevelSegments: 2,
    curveSegments: 6,
    steps: 1,
  });
  geometry.translate(3.25, -3.85, BODY_BACK_Z - 0.055);
  const cover = new Mesh(geometry, materials.blackPlastic);
  cover.name = 'control-cavity-cover';
  cover.castShadow = true;
  tag(cover, 'control-cavity-cover');
  group.add(cover);

  const corners: ReadonlyArray<readonly [number, number]> = [
    [4.62, -3.05],
    [4.62, -4.65],
    [1.88, -3.05],
    [1.88, -4.65],
  ];
  for (const [x, y] of corners) {
    const screw = cylinderBetween(
      new Vector3(x, y, BODY_BACK_Z - 0.12),
      new Vector3(x, y, BODY_BACK_Z - 0.06),
      0.045,
      materials.screw,
      8,
    );
    tag(screw, 'control-cavity-cover');
    group.add(screw);
  }

  return group;
}

function buildStrapButtons(materials: MaterialSet): Group {
  const group = new Group();
  group.name = 'strap-buttons-group';
  const placements: ReadonlyArray<readonly [number, number, number]> = [
    [4.62, 8.1, 0.42],
    [0, -8.5, 0.42],
  ];
  for (const [x, y, z] of placements) {
    const stem = cylinderBetween(
      new Vector3(x, y, z - 0.1),
      new Vector3(x, y, z + 0.16),
      0.09,
      materials.nickel,
      10,
    );
    tag(stem, 'strap-buttons');
    group.add(stem);

    const cap = new Mesh(new SphereGeometry(0.17, 16, 12), materials.nickel);
    cap.position.set(x, y, z + 0.16);
    cap.scale.z = 0.72;
    tag(cap, 'strap-buttons');
    group.add(cap);
  }
  return group;
}

export function bodySurfaceZ(x: number, y: number): number {
  const distance = distanceToOutline(x, y);
  const recurve =
    -0.02 *
    Math.exp(-Math.pow((distance - 0.82) / 0.44, 2)) *
    (1 - smoothstep(3.4, 5.4, distance));
  const crown = CARVE_HEIGHT * smoothstep(0.5, 5.2, distance);
  return BODY_TOP_Z + 0.02 + crown + recurve;
}

export function distanceToOutline(x: number, y: number): number {
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < OUTLINE_POINTS.length; i += 1) {
    const point = OUTLINE_POINTS[i]!;
    const dx = point.x - x;
    const dy = point.y - y;
    const squared = dx * dx + dy * dy;
    if (squared < best) best = squared;
  }
  return Math.sqrt(best);
}


