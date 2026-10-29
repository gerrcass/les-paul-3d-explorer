import { describe, expect, it } from 'vitest';
import {
  CATEGORIES,
  PART_BY_ID,
  PART_IDS,
  PARTS,
  getPart,
  groupPartsByCategory,
  isPartId,
  type PartId,
} from '../src/domain/parts';
import { SIGNAL_PATH, stageForPart } from '../src/domain/signal';

describe('part registry', () => {
  it('has at least thirty teachable parts with unique ids', () => {
    expect(PARTS.length).toBeGreaterThanOrEqual(30);
    expect(new Set(PART_IDS).size).toBe(PART_IDS.length);
    expect(Object.keys(PART_BY_ID)).toHaveLength(PART_IDS.length);
  });

  it('gives every part complete, distinct teaching copy', () => {
    for (const part of PARTS) {
      expect(part.name.length, part.id).toBeGreaterThan(2);
      expect(part.tagline.length, part.id).toBeGreaterThan(20);
      expect(part.purpose.length, part.id).toBeGreaterThan(40);
      expect(part.mechanism.length, part.id).toBeGreaterThan(40);
      expect(part.material.length, part.id).toBeGreaterThan(2);
      expect(part.fact.length, part.id).toBeGreaterThan(20);
    }
    expect(new Set(PARTS.map((part) => part.name)).size).toBe(PARTS.length);
  });

  it('groups every part into a category exactly once', () => {
    const grouped = groupPartsByCategory();
    expect(grouped).toHaveLength(CATEGORIES.length);
    expect(grouped.flatMap((group) => group.parts)).toHaveLength(PARTS.length);
    for (const group of grouped) {
      expect(group.parts.length, group.category.id).toBeGreaterThan(0);
      for (const part of group.parts) expect(part.category).toBe(group.category.id);
    }
  });

  it('looks up parts safely by string', () => {
    expect(getPart('bridge')?.name).toBe('Tune-o-matic bridge');
    expect(getPart('not-a-part')).toBeNull();
    expect(getPart(null)).toBeNull();
    expect(isPartId('strings')).toBe(true);
    expect(isPartId('amplifier')).toBe(false);
  });
});

describe('signal path', () => {
  it('runs from strings to amplifier in eight stages', () => {
    expect(SIGNAL_PATH).toHaveLength(8);
    expect(SIGNAL_PATH[0]?.id).toBe('strings');
    expect(SIGNAL_PATH.at(-1)?.id).toBe('amplifier');
    expect(new Set(SIGNAL_PATH.map((stage) => stage.id)).size).toBe(SIGNAL_PATH.length);
  });

  it('points every stage at real parts, except the amplifier', () => {
    for (const stage of SIGNAL_PATH) {
      if (stage.id === 'amplifier') {
        expect(stage.partIds).toEqual([]);
        expect(stage.outsideInstrument).toBe(true);
        continue;
      }
      expect(stage.partIds.length, stage.id).toBeGreaterThan(0);
      for (const partId of stage.partIds) {
        expect(PART_BY_ID[partId], `${stage.id} -> ${partId}`).toBeDefined();
      }
    }
  });

  it('maps each electrical part back to its stage', () => {
    expect(stageForPart('strings')?.id).toBe('strings');
    expect(stageForPart('neck-pickup')?.id).toBe('neck-pickup');
    expect(stageForPart('bridge-pickup')?.id).toBe('bridge-pickup');
    expect(stageForPart('selector-switch')?.id).toBe('selector');
    expect(stageForPart('volume-knobs')?.id).toBe('volume');
    expect(stageForPart('tone-knobs')?.id).toBe('tone');
    expect(stageForPart('output-jack')?.id).toBe('output');
    expect(stageForPart('bridge')).toBeNull();
  });

  it('assigns a signalStage to exactly the parts declared in the path', () => {
    const declared = new Set<PartId>(SIGNAL_PATH.flatMap((stage) => stage.partIds));
    for (const part of PARTS) {
      expect(Boolean(part.signalStage), part.id).toBe(declared.has(part.id));
      if (part.signalStage) {
        expect(SIGNAL_PATH.find((stage) => stage.id === part.signalStage)?.partIds).toContain(part.id);
      }
    }
  });
});
