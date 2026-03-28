import test from 'node:test';
import assert from 'node:assert/strict';

import { MaterialSource, MaterialType } from '../src/types';
import {
  buildCreateJobPayload,
  normalizeColorsForMaterial,
  normalizeColorsForPrinter,
  resolveUploadExtension,
  validateBookingStep,
  type BookingDraft,
} from '../src/lib/bookingRules';

function createDraft(overrides: Partial<BookingDraft> = {}): BookingDraft {
  return {
    printMode: 'self',
    materialSource: MaterialSource.LAB,
    jobName: 'Test job',
    description: 'desc',
    materialType: MaterialType.PLA,
    colors: [],
    customColor: '',
    brand: '',
    estimatedTimeValue: '',
    estimatedTimeUnit: 'hours',
    estimatedGrams: 0,
    printerId: '',
    preferredDate: '',
    preferredSlot: '',
    preferredSubSlot: '',
    fileName: '',
    nozzleSize: '',
    slicerEngine: '',
    ...overrides,
  };
}

test('resolveUploadExtension preserves .gcode.3mf suffix', () => {
  assert.equal(resolveUploadExtension('sample.gcode.3mf'), '.gcode.3mf');
  assert.equal(resolveUploadExtension('sample.gcode'), '.gcode');
  assert.equal(resolveUploadExtension('sample.stl'), '.stl');
  assert.equal(resolveUploadExtension('sample.txt'), null);
});

test('buildCreateJobPayload omits hidden material and slot fields for self own flow', () => {
  const payload = buildCreateJobPayload({
    draft: createDraft({
      materialSource: MaterialSource.OWN,
      materialType: null,
      colors: ['Gray'],
      brand: 'Bambu Lab',
      fileName: 'sample.stl',
      preferredSlot: '',
      preferredSubSlot: '',
    }),
    slotLabels: {
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
    },
  });

  assert.equal(payload.materialSource, MaterialSource.OWN);
  assert.equal(payload.fileName, 'sample.stl');
  assert.equal(payload.materialType, undefined);
  assert.equal(payload.color, undefined);
  assert.equal(payload.brand, undefined);
  assert.equal(payload.printerId, undefined);
  assert.equal(payload.slotTime, undefined);
});

test('validateBookingStep blocks self lab color step without a valid color', () => {
  const errorCode = validateBookingStep({
    step: 2,
    draft: createDraft({
      materialSource: MaterialSource.LAB,
      materialType: MaterialType.PETG,
      colors: [],
    }),
    availableColors: ['Xanh duong'],
    uploadedFileName: '',
    selectedPrinterHasAMS: true,
  });

  assert.equal(errorCode, 'color-required');
});

test('normalizeColorsForPrinter collapses AMS selection to one color for non AMS printers', () => {
  const nextColors = normalizeColorsForPrinter({
    colors: ['White', 'Gray', 'Black'],
    hasAMS: false,
    availableColors: ['White', 'Gray', 'Black'],
  });

  assert.deepEqual(nextColors, ['White']);
});

test('normalizeColorsForMaterial clears colors that are unavailable after material switch', () => {
  const nextColors = normalizeColorsForMaterial({
    colors: ['Gray', 'White'],
    availableColors: ['Blue'],
    hasAMS: true,
  });

  assert.deepEqual(nextColors, []);
});

test('validateBookingStep blocks file step until upload succeeds for all flows', () => {
  const selfOwnError = validateBookingStep({
    step: 3,
    draft: createDraft({
      materialSource: MaterialSource.OWN,
    }),
    availableColors: [],
    uploadedFileName: '',
    selectedPrinterHasAMS: false,
  });

  assert.equal(selfOwnError, 'file-required');
});

test('validateBookingStep blocks self lab file step when parsed metrics are missing', () => {
  const errorCode = validateBookingStep({
    step: 3,
    draft: createDraft({
      materialSource: MaterialSource.LAB,
      fileName: 'sample.gcode',
      estimatedGrams: 0,
      estimatedTimeValue: '',
    }),
    availableColors: ['White'],
    uploadedFileName: 'sample.gcode',
    selectedPrinterHasAMS: false,
  });

  assert.equal(errorCode, 'parsed-metrics-required');
});

test('validateBookingStep still blocks PETG when AMS selection was reset to zero', () => {
  const errorCode = validateBookingStep({
    step: 2,
    draft: createDraft({
      materialSource: MaterialSource.LAB,
      materialType: MaterialType.PETG,
      colors: [],
    }),
    availableColors: ['Blue'],
    uploadedFileName: '',
    selectedPrinterHasAMS: true,
  });

  assert.equal(errorCode, 'color-required');
});
