import { SIGNAL_PATH, type SignalStage } from './signal';

export interface TourState {
  readonly active: boolean;
  readonly index: number;
}

export const TOUR_LENGTH = SIGNAL_PATH.length;

export function startTour(index = 0): TourState {
  return { active: true, index: clampIndex(index) };
}

export function endTour(): TourState {
  return { active: false, index: 0 };
}

export function nextStage(state: TourState): TourState {
  if (!state.active) return startTour(0);
  return { active: true, index: (state.index + 1) % TOUR_LENGTH };
}

export function previousStage(state: TourState): TourState {
  if (!state.active) return startTour(TOUR_LENGTH - 1);
  return { active: true, index: (state.index - 1 + TOUR_LENGTH) % TOUR_LENGTH };
}

export function goToStage(_state: TourState, index: number): TourState {
  return { active: true, index: clampIndex(index) };
}

export function currentStage(state: TourState): SignalStage | null {
  if (!state.active) return null;
  return SIGNAL_PATH[state.index] ?? null;
}

export function progress(state: TourState): { readonly current: number; readonly total: number } {
  return { current: state.active ? state.index + 1 : 0, total: TOUR_LENGTH };
}

function clampIndex(index: number): number {
  if (!Number.isFinite(index)) return 0;
  return Math.min(Math.max(Math.trunc(index), 0), TOUR_LENGTH - 1);
}
