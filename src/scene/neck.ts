import {
  BoxGeometry,
  MeshBasicMaterial,
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  Mesh,
  PlaneGeometry,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {
  BOARD_THICKNESS,
  BODY_JOINT_Y,
  FRETBOARD_BODY_WIDTH,
  FRETBOARD_END_Y,
  FRETBOARD_NUT_WIDTH,
  FRET_COUNT,
  HEADSTOCK_ANGLE,
  NUT_Y,
  boardTopAt,
  fretY,
  fretboardWidthAt,
} from './constants';
import { cylinderBetween, loftGeometry, tag } from './geometry';
import type { MaterialSet } from './materials';
import type { GuitarTextures } from './textures';

const FINGERBOARD_RADIUS = 12;
const INLAY_FRETS = [3, 5, 7, 9, 12, 15, 17, 19, 21] as const;

export interface NeckBuild {
  readonly group: Group;
  /** Root-space post positions in string order, low E to high E. */
  readonly tunerPosts: readonly Vector3[];
}

export function buildNeck(materials: MaterialSet, textures: GuitarTextures | null): NeckBuild {
  const group = new Group();
  group.name = 'neck';

  group.add(buildShaft(materials));
  group.add(buildFretboard(materials));
  group.add(buildBinding(materials));
  group.add(buildFrets(materials));
  group.add(buildInlays(materials));
  group.add(buildNut(materials));

  const headstock = buildHeadstock(materials, textures);
  group.add(headstock.group);

  group.updateMatrixWorld(true);
  const tunerPosts = headstock.postLocals.map((post) => headstock.group.localToWorld(post.clone()));

  return { group, tunerPosts };
}

function buildShaft(materials: MaterialSet): Group {
  const group = new Group();
  const stations = [
    { y: BODY_JOINT_Y - 1.15, width: 2.62, depth: 1.34, centerZ: 0.58, roundness: 3.4 },
    { y: BODY_JOINT_Y - 0.45, width: 2.52, depth: 1.2, centerZ: 0.7, roundness: 3.3 },
    { y: BODY_JOINT_Y + 0.25, width: 2.4, depth: 1.05, centerZ: 0.885, roundness: 3.2 },
    { y: BODY_JOINT_Y + 1.6, width: 2.26, depth: 0.94, centerZ: 0.99, roundness: 3.1 },
    { y: BODY_JOINT_Y + 4, width: 2.12, depth: 0.87, centerZ: 1.09, roundness: 3.1 },
    { y: BODY_JOINT_Y + 8, width: 1.97, depth: 0.82, centerZ: 1.24, roundness: 3.1 },
    { y: BODY_JOINT_Y + 12, width: 1.87, depth: 0.79, centerZ: 1.39, roundness: 3.1 },
    { y: NUT_Y - 0.1, width: FRETBOARD_NUT_WIDTH - 0.04, depth: 0.76, centerZ: 1.55, roundness: 3.1 },
  ];
  const geometry = loftGeometry(stations, 24);
  const shaft = new Mesh(geometry, materials.mahogany);
  shaft.name = 'neck-shaft';
  shaft.castShadow = true;
  shaft.receiveShadow = true;
  tag(shaft, 'neck');
  group.add(shaft);
  return group;
}

function buildFretboard(materials: MaterialSet): Group {
  const group = new Group();
  const geometry = fretboardGeometry();
  const board = new Mesh(geometry, materials.rosewood);
  board.name = 'fretboard';
  board.castShadow = true;
  board.receiveShadow = true;
  tag(board, 'fretboard');
  group.add(board);
  return group;
}

function fretboardGeometry(): BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const segments = 110;
  const across = 14;
  const stationSize = (across + 1) * 2;

  const crownOffset = (x: number): number => {
    const radius = FINGERBOARD_RADIUS;
    const clamped = Math.min(Math.abs(x), radius - 0.01);
    return radius - Math.sqrt(radius * radius - clamped * clamped);
  };

  for (let i = 0; i <= segments; i += 1) {
    const y = FRETBOARD_END_Y + ((NUT_Y - FRETBOARD_END_Y) * i) / segments;
    const half = fretboardWidthAt(y) / 2;
    const top = boardTopAt(y);
    const bottom = top - BOARD_THICKNESS;
    for (let j = 0; j <= across; j += 1) {
      const x = -half + (2 * half * j) / across;
      positions.push(x, y, top + crownOffset(x));
      uvs.push((x + FRETBOARD_BODY_WIDTH / 2) / FRETBOARD_BODY_WIDTH, (y - FRETBOARD_END_Y) / (NUT_Y - FRETBOARD_END_Y));
    }
    for (let j = 0; j <= across; j += 1) {
      const x = -half + (2 * half * j) / across;
      positions.push(x, y, bottom);
      uvs.push((x + FRETBOARD_BODY_WIDTH / 2) / FRETBOARD_BODY_WIDTH, (y - FRETBOARD_END_Y) / (NUT_Y - FRETBOARD_END_Y));
    }
  }

  const topIndex = (i: number, j: number): number => i * stationSize + j;
  const bottomIndex = (i: number, j: number): number => i * stationSize + across + 1 + j;

  for (let i = 0; i < segments; i += 1) {
    for (let j = 0; j < across; j += 1) {
      indices.push(
        topIndex(i, j),
        topIndex(i + 1, j),
        topIndex(i, j + 1),
        topIndex(i + 1, j),
        topIndex(i + 1, j + 1),
        topIndex(i, j + 1),
      );
      indices.push(
        bottomIndex(i, j + 1),
        bottomIndex(i + 1, j + 1),
        bottomIndex(i, j),
        bottomIndex(i, j),
        bottomIndex(i + 1, j + 1),
        bottomIndex(i + 1, j),
      );
    }
    // Left and right walls.
    indices.push(
      topIndex(i, 0),
      topIndex(i, 1),
      bottomIndex(i, 0),
      topIndex(i, 1),
      bottomIndex(i, 1),
      bottomIndex(i, 0),
    );
    indices.push(
      topIndex(i, across - 1),
      topIndex(i, across),
      bottomIndex(i, across - 1),
      topIndex(i, across),
      bottomIndex(i, across),
      bottomIndex(i, across - 1),
    );
  }

  // End caps.
  for (let j = 0; j < across; j += 1) {
    indices.push(
      topIndex(0, j),
      topIndex(0, j + 1),
      bottomIndex(0, j),
      topIndex(0, j + 1),
      bottomIndex(0, j + 1),
      bottomIndex(0, j),
    );
    indices.push(
      topIndex(segments, j + 1),
      topIndex(segments, j),
      bottomIndex(segments, j + 1),
      topIndex(segments, j),
      bottomIndex(segments, j),
      bottomIndex(segments, j + 1),
    );
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function buildBinding(materials: MaterialSet): Group {
  const group = new Group();
  for (const side of [-1, 1] as const) {
    const points: Vector3[] = [];
    for (let i = 0; i <= 90; i += 1) {
      const y = FRETBOARD_END_Y + ((NUT_Y - FRETBOARD_END_Y) * i) / 90;
      const half = fretboardWidthAt(y) / 2;
      const x = side * (half - 0.012);
      points.push(new Vector3(x, y, fretTopAt(y, x) + 0.004));
    }
    const curve = new CatmullRomCurve3(points, false, 'catmullrom', 0.1);
    const binding = new Mesh(new TubeGeometry(curve, 120, 0.031, 6, false), materials.agedCream);
    binding.name = 'fretboard-binding';
    tag(binding, 'neck-binding');
    group.add(binding);
  }
  return group;
}

function buildFrets(materials: MaterialSet): Group {
  const group = new Group();
  for (let fretNumber = 1; fretNumber <= FRET_COUNT; fretNumber += 1) {
    const y = fretY(fretNumber);
    const half = fretboardWidthAt(y) / 2 - 0.03;
    const points: Vector3[] = [];
    for (let i = 0; i <= 12; i += 1) {
      const x = -half + (2 * half * i) / 12;
      const clamped = Math.min(Math.abs(x), FINGERBOARD_RADIUS - 0.01);
      const crown = FINGERBOARD_RADIUS - Math.sqrt(FINGERBOARD_RADIUS ** 2 - clamped ** 2);
      points.push(new Vector3(x, y, boardTopAt(y) + crown + 0.018));
    }
    const curve = new CatmullRomCurve3(points, false, 'catmullrom', 0.1);
    const fretMesh = new Mesh(new TubeGeometry(curve, 28, 0.028, 5, false), materials.fretWire);
    fretMesh.name = `fret-${fretNumber}`;
    fretMesh.castShadow = true;
    tag(fretMesh, 'frets');
    group.add(fretMesh);
  }
  return group;
}

function buildInlays(materials: MaterialSet): Group {
  const group = new Group();
  for (const fretNumber of INLAY_FRETS) {
    const y = (fretY(fretNumber) + fretY(fretNumber + 1)) / 2;
    const scale = fretNumber === 12 ? 0.62 : 1;
    const offsets = fretNumber === 12 ? [-0.48, 0.48] : [0];
    for (const offset of offsets) {
      const shape = trapezoidShape(0.46 * scale, 0.32 * scale, 0.46 * scale);
      const inlay = new Mesh(new ShapeGeometry(shape, 8), materials.pearl);
      inlay.position.set(offset, y, fretTopAt(y, offset) + 0.012);
      inlay.name = `inlay-${fretNumber}`;
      tag(inlay, 'inlays');
      group.add(inlay);
    }
  }

  // Side dots on the bass edge.
  for (const fretNumber of INLAY_FRETS) {
    const y = (fretY(fretNumber) + fretY(fretNumber + 1)) / 2;
    const half = fretboardWidthAt(y) / 2;
    const dot = new Mesh(new SphereGeometry(0.042, 10, 8), materials.pearl);
    dot.position.set(-half + 0.008, y, fretTopAt(y, half) + 0.06);
    dot.scale.x = 0.4;
    tag(dot, 'inlays');
    group.add(dot);
  }
  return group;
}

function trapezoidShape(topWidth: number, bottomWidth: number, height: number): Shape {
  const shape = new Shape();
  shape.moveTo(-bottomWidth / 2, -height / 2);
  shape.lineTo(bottomWidth / 2, -height / 2);
  shape.lineTo(topWidth / 2, height / 2);
  shape.lineTo(-topWidth / 2, height / 2);
  shape.closePath();
  return shape;
}

function buildNut(materials: MaterialSet): Group {
  const group = new Group();
  const nut = new Mesh(
    new BoxGeometry(FRETBOARD_NUT_WIDTH + 0.04, 0.23, 0.15),
    materials.bone,
  );
  nut.position.set(0, NUT_Y + 0.05, boardTopAt(NUT_Y) + 0.075);
  nut.castShadow = true;
  tag(nut, 'nut');
  group.add(nut);
  return group;
}

interface HeadstockBuild {
  readonly group: Group;
  readonly postLocals: readonly Vector3[];
}

function buildHeadstock(materials: MaterialSet, textures: GuitarTextures | null): HeadstockBuild {
  const group = new Group();
  group.name = 'headstock';
  group.position.set(0, NUT_Y + 0.06, boardTopAt(NUT_Y) - 0.08);
  group.rotation.x = HEADSTOCK_ANGLE;

  const shape = headstockShape();
  const geometry = new ExtrudeGeometry(shape, {
    depth: 0.46,
    bevelEnabled: true,
    bevelThickness: 0.045,
    bevelSize: 0.045,
    bevelSegments: 3,
    curveSegments: 16,
    steps: 1,
  });
  geometry.translate(0, 0, -0.25);
  const headstock = new Mesh(geometry, materials.mahogany);
  headstock.name = 'headstock';
  headstock.castShadow = true;
  headstock.receiveShadow = true;
  tag(headstock, 'headstock');
  group.add(headstock);

  const veneer = new Mesh(new ShapeGeometry(shape, 24), materials.veneer);
  veneer.position.z = 0.266;
  veneer.name = 'headstock-veneer';
  tag(veneer, 'headstock-veneer');
  group.add(veneer);

  if (textures) {
    const logoMaterial = new MeshBasicMaterial({
      map: textures.logo,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      color: 0xf0e5cc,
    });
    const logo = new Mesh(new PlaneGeometry(2.35, 0.73), logoMaterial);
    logo.position.set(0, 4.78, 0.281);
    tag(logo, 'logo');
    group.add(logo);

    const scriptMaterial = new MeshBasicMaterial({
      map: textures.script,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      color: 0xeee2ca,
    });
    const script = new Mesh(new PlaneGeometry(1.8, 0.56), scriptMaterial);
    script.position.set(0, 2.55, 0.282);
    tag(script, 'logo');
    group.add(script);
  } else {
    const logo = new Mesh(new PlaneGeometry(2.35, 0.73), materials.pearl);
    logo.position.set(0, 4.78, 0.281);
    tag(logo, 'logo');
    group.add(logo);

    const script = new Mesh(new PlaneGeometry(1.8, 0.56), materials.agedCream);
    script.position.set(0, 2.55, 0.282);
    tag(script, 'logo');
    group.add(script);
  }

  const trussCover = new Mesh(
    new ExtrudeGeometry(trussCoverShape(), {
      depth: 0.035,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 2,
      curveSegments: 8,
      steps: 1,
    }),
    materials.blackPlastic,
  );
  trussCover.position.set(0, 0.38, 0.272);

  const trussBorder = new Mesh(
    new TubeGeometry(new CatmullRomCurve3([
      new Vector3(-0.35, 0.38, 0.326),
      new Vector3(-0.32, 1.0, 0.326),
      new Vector3(0, 1.52, 0.326),
      new Vector3(0.32, 1.0, 0.326),
      new Vector3(0.35, 0.38, 0.326),
      new Vector3(0, 0.38, 0.326),
    ], true, 'catmullrom', 0.1), 48, 0.012, 5, true),
    materials.agedCream,
  );
  tag(trussBorder, 'truss-rod-cover');
  group.add(trussBorder);
  tag(trussCover, 'truss-rod-cover');
  group.add(trussCover);

  if (textures) {
    const labelMaterial = new MeshBasicMaterial({
      map: textures.standard,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      color: 0xf2e7d0,
    });
    const label = new Mesh(new PlaneGeometry(0.52, 0.2), labelMaterial);
    label.position.set(0, 0.82, 0.345);
    tag(label, 'truss-rod-cover');
    group.add(label);
  }

  const postLocals: Vector3[] = [];
  const posts = [
    { side: -1 as const, y: 5.68, x: -1.3, string: 0 },
    { side: -1 as const, y: 3.78, x: -1.05, string: 1 },
    { side: -1 as const, y: 1.88, x: -0.78, string: 2 },
    { side: 1 as const, y: 1.88, x: 0.78, string: 3 },
    { side: 1 as const, y: 3.78, x: 1.05, string: 4 },
    { side: 1 as const, y: 5.68, x: 1.3, string: 5 },
  ];
  for (const post of posts) {
    const tuner = buildTuner(materials, post.side, post.y, post.x);
    group.add(tuner);
    postLocals[post.string] = new Vector3(post.x, post.y, 0.33);
  }

  // Truss-rod cover screws.
  for (const x of [-0.22, 0.22]) {
    const screw = cylinderBetween(
      new Vector3(x, 0.47, 0.31),
      new Vector3(x, 0.47, 0.335),
      0.026,
      materials.screw,
      8,
    );
    tag(screw, 'truss-rod-cover');
    group.add(screw);
  }

  return { group, postLocals };
}

function buildTuner(materials: MaterialSet, side: -1 | 1, y: number, x: number): Group {
  const group = new Group();

  const post = new Mesh(new CylinderGeometry(0.085, 0.095, 0.55, 12), materials.nickel);
  post.rotation.x = Math.PI / 2;
  post.position.set(x, y, 0.06);
  tag(post, 'tuners');
  group.add(post);

  const bushing = new Mesh(new CylinderGeometry(0.15, 0.15, 0.06, 16), materials.nickel);
  bushing.rotation.x = Math.PI / 2;
  bushing.position.set(x, y, 0.282);
  tag(bushing, 'tuners');
  group.add(bushing);

  const plate = new Mesh(new RoundedBoxGeometry(0.62, 0.78, 0.1, 2, 0.06), materials.nickel);
  plate.position.set(x, y - 0.02, -0.3);
  tag(plate, 'tuners');
  group.add(plate);

  const stem = new Mesh(new CylinderGeometry(0.045, 0.045, 0.55, 8), materials.nickel);
  stem.rotation.z = Math.PI / 2;
  stem.position.set(x + side * 0.32, y - 0.16, -0.2);
  tag(stem, 'tuners');
  group.add(stem);

  const button = new Mesh(new SphereGeometry(0.22, 16, 10), materials.nickel);
  button.scale.set(1.28, 0.82, 0.46);
  button.position.set(x + side * 0.62, y - 0.16, -0.2);
  tag(button, 'tuners');
  group.add(button);

  const screw = cylinderBetween(
    new Vector3(x + side * 0.18, y + 0.28, -0.37),
    new Vector3(x + side * 0.18, y + 0.28, -0.3),
    0.03,
    materials.screw,
    8,
  );
  tag(screw, 'tuners');
  group.add(screw);

  return group;
}

function headstockShape(): Shape {
  const shape = new Shape();
  shape.moveTo(-0.87, 0);
  shape.lineTo(-0.9, 0.45);
  shape.bezierCurveTo(-0.98, 1.4, -1.1, 2.6, -1.15, 3.8);
  shape.bezierCurveTo(-1.25, 4.9, -1.6, 5.2, -1.64, 6.0);
  shape.lineTo(-1.63, 6.72);
  shape.quadraticCurveTo(-1.61, 7.02, -1.35, 7.02);
  shape.lineTo(-0.49, 7.02);
  shape.quadraticCurveTo(-0.245, 6.98, 0, 6.82);
  shape.quadraticCurveTo(0.245, 6.98, 0.49, 7.02);
  shape.lineTo(1.35, 7.02);
  shape.quadraticCurveTo(1.61, 7.02, 1.63, 6.72);
  shape.lineTo(1.64, 6.0);
  shape.bezierCurveTo(1.6, 5.2, 1.25, 4.9, 1.15, 3.8);
  shape.bezierCurveTo(1.1, 2.6, 0.98, 1.4, 0.9, 0.45);
  shape.lineTo(0.87, 0);
  shape.closePath();
  return shape;
}

function trussCoverShape(): Shape {
  const shape = new Shape();
  shape.moveTo(-0.35, 0);
  shape.lineTo(0.35, 0);
  shape.lineTo(0.32, 0.62);
  shape.quadraticCurveTo(0.26, 1.02, 0, 1.14);
  shape.quadraticCurveTo(-0.26, 1.02, -0.32, 0.62);
  shape.closePath();
  return shape;
}

export function fretTopAt(y: number, x = 0): number {
  const clamped = Math.min(Math.abs(x), FINGERBOARD_RADIUS - 0.01);
  const crown = FINGERBOARD_RADIUS - Math.sqrt(FINGERBOARD_RADIUS ** 2 - clamped ** 2);
  return boardTopAt(y) + crown;
}

export function fretInlayPositions(): readonly number[] {
  return INLAY_FRETS.map((fret) => fretY(fret));
}
