export type PerformancePreferenceMode = 'auto' | 'performance' | 'balanced' | 'full';
export type PerformanceEffectiveMode = 'performance' | 'balanced' | 'full';
export type PerformanceMotionLevel = 'off' | 'reduced' | 'full';
export type StlPreviewMode = 'fallback' | 'static' | 'interactive';
export type PerformanceSampleKind = 'boot' | 'preview';
export type PerformanceProfileSource = 'boot' | 'preview' | 'reduced-motion' | 'webgl' | 'cache';

export interface PerformanceAutoProfile {
  version: 1;
  effectiveMode: PerformanceEffectiveMode;
  source: PerformanceProfileSource;
  updatedAt: string;
}

export interface InitialAutoModeInput {
  cachedProfile: PerformanceAutoProfile | null;
  prefersReducedMotion: boolean;
  webglAvailable: boolean;
}

export interface BootSampleInput {
  averageFps: number;
  weakHardware: boolean;
}

export interface PreviewSampleInput {
  averageFps: number;
  stalledFrames: number;
}

export const PERFORMANCE_PREFERENCE_KEY = 'lab_performance_preference';
export const PERFORMANCE_AUTO_PROFILE_KEY = 'lab_performance_auto_profile';
export const PERFORMANCE_PROFILE_VERSION = 1;

export function getInitialAutoMode(input: InitialAutoModeInput): PerformanceEffectiveMode {
  if (input.prefersReducedMotion || !input.webglAvailable) {
    return 'performance';
  }

  if (input.cachedProfile) {
    return input.cachedProfile.effectiveMode;
  }

  return 'balanced';
}

export function getBootSampleMode(input: BootSampleInput): PerformanceEffectiveMode {
  if (input.averageFps < 45) {
    return 'performance';
  }

  if (input.averageFps >= 58 && !input.weakHardware) {
    return 'full';
  }

  return 'balanced';
}

export function getMotionLevel(mode: PerformanceEffectiveMode): PerformanceMotionLevel {
  if (mode === 'performance') return 'off';
  if (mode === 'balanced') return 'reduced';
  return 'full';
}

export function getPreviewMode(mode: PerformanceEffectiveMode, webglAvailable: boolean): StlPreviewMode {
  if (!webglAvailable) return 'fallback';
  if (mode === 'performance') return 'static';
  return 'interactive';
}

export function getMaxPixelRatio(mode: PerformanceEffectiveMode): number {
  if (mode === 'performance') return 1;
  if (mode === 'balanced') return 1.25;
  return 2;
}

export function shouldPersistPreviewDowngrade(input: PreviewSampleInput): boolean {
  return input.averageFps < 30 || input.stalledFrames >= 3;
}

export function isWeakHardware(deviceMemory?: number, hardwareConcurrency?: number): boolean {
  return (typeof hardwareConcurrency === 'number' && hardwareConcurrency <= 4)
    || (typeof deviceMemory === 'number' && deviceMemory <= 4);
}

export function clampAutoProfile(mode: PerformanceEffectiveMode, maxMode: PerformanceEffectiveMode): PerformanceEffectiveMode {
  const order: PerformanceEffectiveMode[] = ['performance', 'balanced', 'full'];
  return order.indexOf(mode) <= order.indexOf(maxMode) ? mode : maxMode;
}

export function readStoredPreference(storage: Storage | Pick<Storage, 'getItem'>): PerformancePreferenceMode {
  const stored = storage.getItem(PERFORMANCE_PREFERENCE_KEY);
  if (stored === 'performance' || stored === 'balanced' || stored === 'full' || stored === 'auto') {
    return stored;
  }
  return 'auto';
}

export function readStoredAutoProfile(storage: Storage | Pick<Storage, 'getItem'>): PerformanceAutoProfile | null {
  const raw = storage.getItem(PERFORMANCE_AUTO_PROFILE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PerformanceAutoProfile>;
    if (
      parsed.version === PERFORMANCE_PROFILE_VERSION
      && (parsed.effectiveMode === 'performance' || parsed.effectiveMode === 'balanced' || parsed.effectiveMode === 'full')
      && typeof parsed.updatedAt === 'string'
      && typeof parsed.source === 'string'
    ) {
      return parsed as PerformanceAutoProfile;
    }
  } catch {
    return null;
  }

  return null;
}

export function buildAutoProfile(
  effectiveMode: PerformanceEffectiveMode,
  source: PerformanceProfileSource,
): PerformanceAutoProfile {
  return {
    version: PERFORMANCE_PROFILE_VERSION,
    effectiveMode,
    source,
    updatedAt: new Date().toISOString(),
  };
}

export function detectReducedMotion(win: Window): boolean {
  return typeof win.matchMedia === 'function' && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function detectWebglSupport(doc: Document): boolean {
  try {
    const canvas = doc.createElement('canvas');
    const getContext = canvas.getContext?.bind(canvas);

    if (!getContext) return true;

    return Boolean(getContext('webgl') || getContext('experimental-webgl'));
  } catch {
    return true;
  }
}
