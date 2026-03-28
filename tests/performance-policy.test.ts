import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getBootSampleMode,
  getInitialAutoMode,
  getMotionLevel,
  getPreviewMode,
  shouldPersistPreviewDowngrade,
} from '../src/lib/performanceProfile';

test('auto mode starts in performance when reduced motion is requested', () => {
  const mode = getInitialAutoMode({
    cachedProfile: null,
    prefersReducedMotion: true,
    webglAvailable: true,
  });

  assert.equal(mode, 'performance');
});

test('auto mode starts in balanced without cache on supported hardware', () => {
  const mode = getInitialAutoMode({
    cachedProfile: null,
    prefersReducedMotion: false,
    webglAvailable: true,
  });

  assert.equal(mode, 'balanced');
});

test('boot sample only upgrades to full when fps is high and hardware is not weak', () => {
  assert.equal(getBootSampleMode({ averageFps: 60, weakHardware: false }), 'full');
  assert.equal(getBootSampleMode({ averageFps: 60, weakHardware: true }), 'balanced');
  assert.equal(getBootSampleMode({ averageFps: 40, weakHardware: false }), 'performance');
});

test('motion and preview levels map from effective mode', () => {
  assert.equal(getMotionLevel('performance'), 'off');
  assert.equal(getMotionLevel('balanced'), 'reduced');
  assert.equal(getPreviewMode('performance', true), 'static');
  assert.equal(getPreviewMode('full', false), 'fallback');
});

test('preview downgrade persists when fps is too low or frames stall repeatedly', () => {
  assert.equal(shouldPersistPreviewDowngrade({ averageFps: 29, stalledFrames: 0 }), true);
  assert.equal(shouldPersistPreviewDowngrade({ averageFps: 45, stalledFrames: 3 }), true);
  assert.equal(shouldPersistPreviewDowngrade({ averageFps: 45, stalledFrames: 2 }), false);
});
