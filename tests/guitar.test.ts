import { describe, expect, it } from 'vitest';
import { Box3, Vector3 } from 'three';
import { buildLesPaul } from '../src/scene/buildGuitar';
import { PART_IDS, getPart } from '../src/domain/parts';
import { NUT_Y, SCALE_LENGTH, fretY } from '../src/scene/constants';

describe('complete instrument build', () => {
  const guitar = buildLesPaul();

  it('builds without invalid or orphaned pickable meshes', () => {
    expect(guitar.invalidPickables).toHaveLength(0);
    expect(guitar.pickables.length).toBeGreaterThan(150);
  });

  it('gives every registry part at least one mesh', () => {
    for (const partId of PART_IDS) {
      const meshes = guitar.meshesByPart.get(partId);
      expect(meshes?.length ?? 0, partId).toBeGreaterThan(0);
      expect(getPart(partId), partId).not.toBeNull();
    }
  });

  it('tags every pickable mesh with a known part', () => {
    for (const mesh of guitar.pickables) {
      const partId = mesh.userData.partId as string;
      expect(getPart(partId), partId).not.toBeNull();
    }
  });

  it('builds a guitar-sized instrument with a Les Paul body width', () => {
    const size = guitar.bounds.getSize(new Vector3());
    expect(size.x).toBeGreaterThan(12.4);
    expect(size.x).toBeLessThan(13.1);
    expect(size.y).toBeGreaterThan(40);
    expect(size.y).toBeLessThan(43.5);
    expect(size.z).toBeGreaterThan(2.5);
  });

  it('has 22 frets, a 24.75-inch scale, and six tuning machines', () => {
    const frets = guitar.meshesByPart.get('frets') ?? [];
    expect(frets).toHaveLength(22);
    expect(fretY(12)).toBeCloseTo(NUT_Y - SCALE_LENGTH / 2, 4);
    expect(fretY(22)).toBeCloseTo(NUT_Y - SCALE_LENGTH * (1 - Math.pow(2, -22 / 12)), 4);
    const tuners = guitar.meshesByPart.get('tuners') ?? [];
    expect(tuners.length).toBeGreaterThanOrEqual(6);
  });

  it('strings run from the tailpiece to the headstock', () => {
    const strings = guitar.meshesByPart.get('strings') ?? [];
    const box = new Box3();
    for (const mesh of strings) box.expandByObject(mesh, true);
    expect(box.min.y).toBeLessThan(-0.2);
    expect(box.max.y).toBeGreaterThan(29);
    expect(box.min.z).toBeGreaterThan(0.45);
  });

  it('provides focus bounds for every part', () => {
    for (const partId of PART_IDS) {
      const bounds = guitar.getPartBounds(partId);
      expect(bounds, partId).not.toBeNull();
      expect(bounds?.isEmpty(), partId).toBe(false);
    }
  });

  it('explodes every assembly along the instrument normal and returns home', () => {
    const names = guitar.explodeLayers.map((layer) => layer.name);
    expect(names).toEqual(['body', 'top', 'neck', 'electronics', 'hardware', 'strings']);
    expect(guitar.explodeLayers.find((layer) => layer.name === 'neck')?.offset).toBeGreaterThan(0);

    const depthBefore = new Box3().setFromObject(guitar.root, true).getSize(new Vector3()).z;
    guitar.applyExplosion(1);
    const depthAfter = new Box3().setFromObject(guitar.root, true).getSize(new Vector3()).z;
    expect(depthAfter).toBeGreaterThan(depthBefore + 4);

    guitar.applyExplosion(0);
    const depthHome = new Box3().setFromObject(guitar.root, true).getSize(new Vector3()).z;
    expect(depthHome).toBeCloseTo(depthBefore, 3);
  });
});
