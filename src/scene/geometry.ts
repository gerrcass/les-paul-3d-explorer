import {
  BoxGeometry,
  BufferGeometry,
  CatmullRomCurve3,
  CircleGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  Mesh,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  type Material,
} from 'three';

export function tag<T extends Mesh>(mesh: T, partId: string): T {
  mesh.userData.partId = partId;
  return mesh;
}

export function cylinderBetween(
  start: Vector3,
  end: Vector3,
  radius: number,
  material: Material,
  radialSegments = 12,
  radiusEnd = radius,
): Mesh {
  const direction = new Vector3().subVectors(end, start);
  const length = direction.length();
  const geometry = new CylinderGeometry(radiusEnd, radius, length, radialSegments, 1, false);
  const mesh = new Mesh(geometry, material);
  mesh.position.copy(start).addScaledVector(direction, 0.5);
  mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction.normalize());
  return mesh;
}

export function tubeThrough(points: readonly Vector3[], radius: number, material: Material, segments = 64): Mesh {
  const curve = new CatmullRomCurve3([...points], false, 'catmullrom', 0.12);
  const geometry = new TubeGeometry(curve, segments, radius, 8, false);
  return new Mesh(geometry, material);
}

export function roundedRectShape(width: number, height: number, radius: number): Shape {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

export function circleMesh(radius: number, material: Material, segments = 48): Mesh {
  return new Mesh(new CircleGeometry(radius, segments), material);
}

export function box(
  width: number,
  height: number,
  depth: number,
  material: Material,
): Mesh {
  return new Mesh(new BoxGeometry(width, height, depth), material);
}

export function sphere(radius: number, material: Material, segments = 20): Mesh {
  return new Mesh(new SphereGeometry(radius, segments, Math.max(8, segments / 2)), material);
}

/**
 * Loft a rounded-rectangle cross-section along a series of stations. Used for
 * the tapered neck shaft and heel so the profile reads as carved wood.
 */
export interface LoftStation {
  readonly y: number;
  readonly width: number;
  readonly depth: number;
  readonly centerZ: number;
  readonly roundness?: number;
}

export function loftGeometry(stations: readonly LoftStation[], radialSegments = 20): BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  const ringSize = radialSegments;

  for (const station of stations) {
    const roundness = station.roundness ?? 3.2;
    for (let i = 0; i < ringSize; i += 1) {
      const angle = (i / ringSize) * Math.PI * 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x = Math.sign(cos) * Math.pow(Math.abs(cos), 2 / roundness) * (station.width / 2);
      const z =
        station.centerZ +
        Math.sign(sin) * Math.pow(Math.abs(sin), 2 / roundness) * (station.depth / 2);
      positions.push(x, station.y, z);
    }
  }

  for (let s = 0; s < stations.length - 1; s += 1) {
    for (let i = 0; i < ringSize; i += 1) {
      const next = (i + 1) % ringSize;
      const a = s * ringSize + i;
      const b = s * ringSize + next;
      const c = (s + 1) * ringSize + i;
      const d = (s + 1) * ringSize + next;
      indices.push(a, c, b, b, c, d);
    }
  }

  // Caps.
  const first = stations[0];
  const last = stations[stations.length - 1];
  if (first && last) {
    const firstCenter = positions.length / 3;
    positions.push(0, first.y, first.centerZ);
    const lastCenter = positions.length / 3;
    positions.push(0, last.y, last.centerZ);
    for (let i = 0; i < ringSize; i += 1) {
      const next = (i + 1) % ringSize;
      indices.push(firstCenter, next, i);
      const base = (stations.length - 1) * ringSize;
      indices.push(lastCenter, base + i, base + next);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function sampledClosedCurve(points: readonly Vector2[], samples = 480): Vector2[] {
  const curve = new CatmullRomCurve3(
    points.map((point) => new Vector3(point.x, point.y, 0)),
    true,
    'catmullrom',
    0.5,
  );
  return curve.getPoints(samples).map((point) => new Vector2(point.x, point.y));
}

export function shapeFromPoints(points: readonly Vector2[]): Shape {
  const shape = new Shape();
  const first = points[0];
  if (!first) return shape;
  shape.moveTo(first.x, first.y);
  for (let i = 1; i < points.length; i += 1) {
    const point = points[i];
    if (point) shape.lineTo(point.x, point.y);
  }
  shape.closePath();
  return shape;
}

/** Midpoint-subdivide a triangulated flat shape, then let a height function lift it. */
export function subdivideAndDome(
  geometry: BufferGeometry,
  heightAt: (x: number, y: number) => number,
  iterations: number,
): BufferGeometry {
  let positions: number[] = [];
  let indices: number[] = [];

  const source = geometry.getAttribute('position');
  const sourceIndex = geometry.getIndex();
  for (let i = 0; i < source.count; i += 1) {
    positions.push(source.getX(i), source.getY(i), source.getZ(i));
  }
  if (sourceIndex) {
    for (let i = 0; i < sourceIndex.count; i += 1) indices.push(sourceIndex.getX(i));
  } else {
    for (let i = 0; i < source.count; i += 1) indices.push(i);
  }

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const nextIndices: number[] = [];
    const midpointCache = new Map<string, number>();
    const midpoint = (a: number, b: number): number => {
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      const cached = midpointCache.get(key);
      if (cached !== undefined) return cached;
      const index = positions.length / 3;
      positions.push(
        (positions[a * 3]! + positions[b * 3]!) / 2,
        (positions[a * 3 + 1]! + positions[b * 3 + 1]!) / 2,
        (positions[a * 3 + 2]! + positions[b * 3 + 2]!) / 2,
      );
      midpointCache.set(key, index);
      return index;
    };

    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i]!;
      const b = indices[i + 1]!;
      const c = indices[i + 2]!;
      const ab = midpoint(a, b);
      const bc = midpoint(b, c);
      const ca = midpoint(c, a);
      nextIndices.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
    }
    indices = nextIndices;
  }

  for (let i = 0; i < positions.length / 3; i += 1) {
    positions[i * 3 + 2] = heightAt(positions[i * 3]!, positions[i * 3 + 1]!);
  }

  const result = new BufferGeometry();
  result.setAttribute('position', new Float32BufferAttribute(positions, 3));
  result.setIndex(indices);
  result.computeVertexNormals();
  return result;
}

export function planarUv(geometry: BufferGeometry, minX: number, maxX: number, minY: number, maxY: number): void {
  const position = geometry.getAttribute('position');
  const uv = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i += 1) {
    uv[i * 2] = (position.getX(i) - minX) / (maxX - minX);
    uv[i * 2 + 1] = (position.getY(i) - minY) / (maxY - minY);
  }
  geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2));
}

export function shapeGeometryWithUv(shape: Shape, curveSegments = 64, bbox?: { minX: number; maxX: number; minY: number; maxY: number }): BufferGeometry {
  const geometry = new ShapeGeometry(shape, curveSegments);
  if (bbox) planarUv(geometry, bbox.minX, bbox.maxX, bbox.minY, bbox.maxY);
  return geometry;
}
