import test from 'node:test';
import assert from 'node:assert/strict';

import { CreateJobSchema } from '../server/validation';
import { MaterialSource } from '../src/types';

test('CreateJobSchema accepts self own jobs without material and slot data', () => {
  const result = CreateJobSchema.safeParse({
    jobName: 'Own material job',
    fileName: 'sample.stl',
    materialSource: MaterialSource.OWN,
    printMode: 'self',
  });

  assert.equal(result.success, true);
});

test('CreateJobSchema rejects self lab jobs without color and parsed metrics', () => {
  const result = CreateJobSchema.safeParse({
    jobName: 'Lab material job',
    fileName: 'sample.gcode',
    materialSource: MaterialSource.LAB,
    printMode: 'self',
    materialType: 'PLA',
    estimatedGrams: 0,
    estimatedTime: '',
  });

  assert.equal(result.success, false);
});
