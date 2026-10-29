import { Vector2 } from 'three';

/** One scene unit is one inch. */
export const SCALE_LENGTH = 24.75;
export const FRET_COUNT = 22;

export const BODY_BACK_Z = -1.12;
export const BODY_TOP_Z = 0.45;
export const BODY_THICKNESS = 1.56;
export const CARVE_HEIGHT = 0.55;

export const BODY_JOINT_Y = 6.45;
export const BRIDGE_Y = 1;
export const BRIDGE_SADDLE_Z = 1.57;
export const NUT_Y = 25.75;
export const NUT_STRING_Z = 2.25;

export const BOARD_TOP_AT_JOINT = 1.62;
export const BOARD_SLOPE = 0.028;
export const BOARD_THICKNESS = 0.22;
export const FRETBOARD_END_Y = 7.35;
export const FRETBOARD_NUT_WIDTH = 1.72;
export const FRETBOARD_BODY_WIDTH = 2.18;

export const STRING_XS_BRIDGE = [-1, -0.6, -0.2, 0.2, 0.6, 1] as const;
export const STRING_XS_NUT = [-0.71, -0.426, -0.142, 0.142, 0.426, 0.71] as const;
export const STRING_GAUGES = [0.03, 0.026, 0.022, 0.019, 0.016, 0.014] as const;

export const HEADSTOCK_ANGLE = (-17 * Math.PI) / 180;

export function boardTopAt(y: number): number {
  return BOARD_TOP_AT_JOINT + (y - BODY_JOINT_Y) * BOARD_SLOPE;
}

export function fretY(fret: number): number {
  return NUT_Y - SCALE_LENGTH * (1 - Math.pow(2, -fret / 12));
}

export function fretboardWidthAt(y: number): number {
  const t = clamp01((y - FRETBOARD_END_Y) / (NUT_Y - FRETBOARD_END_Y));
  return FRETBOARD_BODY_WIDTH + (FRETBOARD_NUT_WIDTH - FRETBOARD_BODY_WIDTH) * t;
}

/**
 * Les Paul outline, in inches, treble side to the right and neck up.
 * Sampled into a closed Catmull-Rom curve by the scene builders.
 */
export const BODY_OUTLINE: readonly Vector2[] = [
  new Vector2(0, -8.6),
  new Vector2(3.2, -8.2),
  new Vector2(5.4, -7.0),
  new Vector2(6.3, -5.0),
  new Vector2(6.4, -3.0),
  new Vector2(6.0, -1.0),
  new Vector2(5.0, 0.5),
  new Vector2(4.6, 1.2),
  new Vector2(4.9, 2.4),
  new Vector2(5.5, 4.0),
  new Vector2(5.5, 5.6),
  new Vector2(5.2, 6.6),
  new Vector2(4.9, 7.3),
  new Vector2(4.5, 7.7),
  new Vector2(4.2, 7.85),
  new Vector2(3.95, 7.7),
  new Vector2(3.8, 7.3),
  new Vector2(3.7, 6.8),
  new Vector2(3.4, 6.4),
  new Vector2(2.9, 6.25),
  new Vector2(2.2, 6.25),
  new Vector2(1.55, 6.45),
  new Vector2(-1.55, 6.4),
  new Vector2(-2.6, 6.55),
  new Vector2(-3.6, 7.0),
  new Vector2(-4.6, 7.4),
  new Vector2(-5.2, 7.1),
  new Vector2(-5.4, 6.0),
  new Vector2(-5.5, 4.6),
  new Vector2(-5.3, 2.9),
  new Vector2(-5.0, 1.2),
  new Vector2(-5.2, 0.1),
  new Vector2(-5.9, -1.5),
  new Vector2(-6.4, -3.3),
  new Vector2(-6.3, -5.2),
  new Vector2(-5.7, -6.8),
  new Vector2(-4.4, -7.8),
  new Vector2(-2.6, -8.4),
];

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}
