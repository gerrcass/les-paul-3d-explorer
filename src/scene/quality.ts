export type QualityTier = 'high' | 'balanced' | 'lite';

export interface QualitySettings {
  readonly tier: QualityTier;
  readonly label: string;
  readonly dpr: number;
  readonly shadowMapSize: number;
  readonly bloom: boolean;
  readonly outline: boolean;
}

const SETTINGS: Record<QualityTier, QualitySettings> = {
  high: { tier: 'high', label: 'High', dpr: 2, shadowMapSize: 2048, bloom: true, outline: true },
  balanced: { tier: 'balanced', label: 'Balanced', dpr: 1.5, shadowMapSize: 1024, bloom: false, outline: true },
  lite: { tier: 'lite', label: 'Lite', dpr: 1, shadowMapSize: 512, bloom: false, outline: false },
};

export function qualitySettings(tier: QualityTier): QualitySettings {
  return SETTINGS[tier];
}

export function nextQuality(tier: QualityTier): QualityTier {
  if (tier === 'high') return 'balanced';
  if (tier === 'balanced') return 'lite';
  return 'high';
}

interface NavigatorWithMemory extends Navigator {
  readonly deviceMemory?: number;
}

export function detectQualityTier(): QualityTier {
  if (typeof navigator === 'undefined') return 'balanced';
  const search = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
  const override = search?.get('quality');
  if (override === 'high' || override === 'balanced' || override === 'lite') return override;

  const memory = (navigator as NavigatorWithMemory).deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

  if (memory <= 4 || cores <= 4) return 'lite';
  if (!coarse && memory >= 8 && cores >= 8) return 'high';
  return 'balanced';
}
