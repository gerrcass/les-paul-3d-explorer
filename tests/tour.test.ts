import { describe, expect, it } from 'vitest';
import {
  TOUR_LENGTH,
  currentStage,
  endTour,
  goToStage,
  nextStage,
  previousStage,
  progress,
  startTour,
} from '../src/domain/tour';

describe('signal path tour', () => {
  it('starts at the strings and exposes a stage', () => {
    const state = startTour();
    expect(state.active).toBe(true);
    expect(state.index).toBe(0);
    expect(currentStage(state)?.id).toBe('strings');
    expect(progress(state)).toEqual({ current: 1, total: TOUR_LENGTH });
  });

  it('advances and wraps at the amplifier', () => {
    let state = startTour(TOUR_LENGTH - 1);
    expect(currentStage(state)?.id).toBe('amplifier');
    state = nextStage(state);
    expect(state.index).toBe(0);
    expect(currentStage(state)?.id).toBe('strings');
  });

  it('retreats and wraps at the strings', () => {
    let state = startTour(0);
    state = previousStage(state);
    expect(state.index).toBe(TOUR_LENGTH - 1);
    expect(currentStage(state)?.id).toBe('amplifier');
  });

  it('enters the tour from the last stage when inactive', () => {
    const state = previousStage(endTour());
    expect(state.active).toBe(true);
    expect(state.index).toBe(TOUR_LENGTH - 1);
  });

  it('jumps to a clamped stage', () => {
    expect(goToStage(startTour(), 3).index).toBe(3);
    expect(goToStage(startTour(), 999).index).toBe(TOUR_LENGTH - 1);
    expect(goToStage(startTour(), -4).index).toBe(0);
  });

  it('clears the current stage when the tour ends', () => {
    const state = endTour();
    expect(state.active).toBe(false);
    expect(currentStage(state)).toBeNull();
    expect(progress(state)).toEqual({ current: 0, total: TOUR_LENGTH });
  });
});
