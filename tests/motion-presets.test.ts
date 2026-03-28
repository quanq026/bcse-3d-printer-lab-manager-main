import test from 'node:test';
import assert from 'node:assert/strict';

import { pickMotionConfig } from '../src/lib/motionPresets';

test('motion preset returns reduced config for balanced mode', () => {
  const config = pickMotionConfig('reduced', {
    full: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
    reduced: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    off: {},
  });

  assert.deepEqual(config, {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  });
});

test('motion preset removes animation props in off mode', () => {
  const config = pickMotionConfig('off', {
    full: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    reduced: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    off: {},
  });

  assert.deepEqual(config, {});
});
