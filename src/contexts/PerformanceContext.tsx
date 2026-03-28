import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  buildAutoProfile,
  clampAutoProfile,
  detectReducedMotion,
  detectWebglSupport,
  getBootSampleMode,
  getInitialAutoMode,
  getMaxPixelRatio,
  getMotionLevel,
  getPreviewMode,
  isWeakHardware,
  PERFORMANCE_AUTO_PROFILE_KEY,
  PERFORMANCE_PREFERENCE_KEY,
  readStoredAutoProfile,
  readStoredPreference,
  shouldPersistPreviewDowngrade,
  type PerformanceAutoProfile,
  type PerformanceEffectiveMode,
  type PerformanceMotionLevel,
  type PerformancePreferenceMode,
  type PerformanceSampleKind,
  type StlPreviewMode,
} from '../lib/performanceProfile';

type PerformanceSampleResult = {
  averageFps: number;
  stalledFrames?: number;
};

export interface PerformanceContextValue {
  preferenceMode: PerformancePreferenceMode;
  effectiveMode: PerformanceEffectiveMode;
  setPreferenceMode: (mode: PerformancePreferenceMode) => void;
  motionLevel: PerformanceMotionLevel;
  stlPreviewMode: StlPreviewMode;
  maxPixelRatio: number;
  recordSample: (kind: PerformanceSampleKind, result: PerformanceSampleResult) => void;
}

const PerformanceContext = createContext<PerformanceContextValue | null>(null);

function getEnvironmentState() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      prefersReducedMotion: false,
      webglAvailable: true,
      weakHardware: false,
    };
  }

  return {
    prefersReducedMotion: detectReducedMotion(window),
    webglAvailable: detectWebglSupport(document),
    weakHardware: isWeakHardware(
      typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : undefined,
      typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : undefined,
    ),
  };
}

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const environment = getEnvironmentState();
  const bootSampleStartedRef = useRef(false);
  const [preferenceMode, setPreferenceModeState] = useState<PerformancePreferenceMode>(() => {
    if (typeof window === 'undefined') return 'auto';
    return readStoredPreference(window.localStorage);
  });
  const [autoProfile, setAutoProfile] = useState<PerformanceAutoProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    return readStoredAutoProfile(window.localStorage);
  });
  const [effectiveMode, setEffectiveMode] = useState<PerformanceEffectiveMode>(() => {
    if (typeof window === 'undefined') return 'balanced';

    const preference = readStoredPreference(window.localStorage);
    if (preference !== 'auto') {
      return preference;
    }

    return getInitialAutoMode({
      cachedProfile: readStoredAutoProfile(window.localStorage),
      prefersReducedMotion: environment.prefersReducedMotion,
      webglAvailable: environment.webglAvailable,
    });
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(PERFORMANCE_PREFERENCE_KEY, preferenceMode);
  }, [preferenceMode]);

  useEffect(() => {
    if (typeof window === 'undefined' || !autoProfile) return;
    window.localStorage.setItem(PERFORMANCE_AUTO_PROFILE_KEY, JSON.stringify(autoProfile));
  }, [autoProfile]);

  useEffect(() => {
    if (preferenceMode !== 'auto') {
      setEffectiveMode(preferenceMode);
      return;
    }

    setEffectiveMode(getInitialAutoMode({
      cachedProfile: autoProfile,
      prefersReducedMotion: environment.prefersReducedMotion,
      webglAvailable: environment.webglAvailable,
    }));
  }, [autoProfile, environment.prefersReducedMotion, environment.webglAvailable, preferenceMode]);

  useEffect(() => {
    if (
      preferenceMode !== 'auto'
      || autoProfile
      || environment.prefersReducedMotion
      || !environment.webglAvailable
      || bootSampleStartedRef.current
      || typeof requestAnimationFrame !== 'function'
    ) {
      return;
    }

    bootSampleStartedRef.current = true;
    let cancelled = false;
    let frames = 0;
    let startTime = 0;
    let frameId = 0;

    const measure = (timestamp: number) => {
      if (cancelled) return;

      if (!startTime) {
        startTime = timestamp;
      }

      frames += 1;
      const elapsed = timestamp - startTime;

      if (elapsed >= 1500) {
        const averageFps = elapsed > 0 ? (frames * 1000) / elapsed : 0;
        const mode = getBootSampleMode({ averageFps, weakHardware: environment.weakHardware });
        const profile = buildAutoProfile(mode, 'boot');
        setAutoProfile(profile);
        setEffectiveMode(mode);
        return;
      }

      frameId = requestAnimationFrame(measure);
    };

    frameId = requestAnimationFrame(measure);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [autoProfile, environment.prefersReducedMotion, environment.webglAvailable, environment.weakHardware, preferenceMode]);

  const setPreferenceMode = (mode: PerformancePreferenceMode) => {
    setPreferenceModeState(mode);
    if (mode !== 'auto') {
      setEffectiveMode(mode);
    }
  };

  const recordSample = (kind: PerformanceSampleKind, result: PerformanceSampleResult) => {
    if (preferenceMode !== 'auto') {
      return;
    }

    if (environment.prefersReducedMotion || !environment.webglAvailable) {
      return;
    }

    if (kind === 'boot') {
      if (autoProfile) {
        return;
      }

      const nextMode = getBootSampleMode({
        averageFps: result.averageFps,
        weakHardware: environment.weakHardware,
      });
      const nextProfile = buildAutoProfile(nextMode, 'boot');
      setAutoProfile(nextProfile);
      setEffectiveMode(nextMode);
      return;
    }

    if (kind === 'preview' && shouldPersistPreviewDowngrade({
      averageFps: result.averageFps,
      stalledFrames: result.stalledFrames ?? 0,
    })) {
      const downgradedMode = clampAutoProfile(effectiveMode, 'performance');
      const nextProfile = buildAutoProfile(downgradedMode, 'preview');
      setAutoProfile(nextProfile);
      setEffectiveMode(downgradedMode);
    }
  };

  const value: PerformanceContextValue = {
    preferenceMode,
    effectiveMode,
    setPreferenceMode,
    motionLevel: getMotionLevel(effectiveMode),
    stlPreviewMode: getPreviewMode(effectiveMode, environment.webglAvailable),
    maxPixelRatio: getMaxPixelRatio(effectiveMode),
    recordSample,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export function usePerformance() {
  const value = useContext(PerformanceContext);
  if (!value) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return value;
}
