import type { PerformanceMotionLevel } from './performanceProfile';

interface MotionOptions<T> {
  full: T;
  reduced?: T;
  off: T;
}

export function pickMotionConfig<T>(level: PerformanceMotionLevel, options: MotionOptions<T>): T {
  if (level === 'off') {
    return options.off;
  }

  if (level === 'reduced') {
    return options.reduced ?? options.off;
  }

  return options.full;
}

export function getSharedLayoutConfig(
  level: PerformanceMotionLevel,
  layoutId: string,
  transition?: Record<string, unknown>,
) {
  if (level !== 'full') {
    return {};
  }

  return transition ? { layoutId, transition } : { layoutId };
}
