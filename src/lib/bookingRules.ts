import { MaterialSource, type MaterialType } from '../types';

export type PrintMode = 'self' | 'lab_assisted';
export type EstimatedTimeUnit = 'hours' | 'minutes';
export type BookingValidationErrorCode =
  | 'job-name-required'
  | 'material-required'
  | 'color-required'
  | 'file-required'
  | 'parsed-metrics-required';

export interface BookingDraft {
  printMode: PrintMode;
  materialSource: MaterialSource;
  jobName: string;
  description: string;
  materialType: MaterialType | null;
  colors: string[];
  customColor: string;
  brand: string;
  estimatedTimeValue: string;
  estimatedTimeUnit: EstimatedTimeUnit;
  estimatedGrams: number;
  printerId: string;
  preferredDate: string;
  preferredSlot: string;
  preferredSubSlot: string;
  fileName: string;
  nozzleSize: string;
  slicerEngine: string;
}

interface BuildPayloadOptions {
  draft: BookingDraft;
  slotLabels: Record<string, string>;
}

interface ValidateBookingStepOptions {
  step: number;
  draft: BookingDraft;
  availableColors: string[];
  uploadedFileName: string;
  selectedPrinterHasAMS: boolean;
}

interface NormalizeColorsForPrinterOptions {
  colors: string[];
  hasAMS: boolean;
  availableColors: string[];
}

interface NormalizeColorsForMaterialOptions {
  colors: string[];
  availableColors: string[];
  hasAMS: boolean;
}

function isSelfPrint(draft: BookingDraft) {
  return draft.printMode === 'self';
}

function isLabMaterial(draft: BookingDraft) {
  return draft.materialSource === MaterialSource.LAB;
}

export function resolveUploadExtension(fileName: string | undefined | null) {
  if (!fileName) return null;
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.gcode.3mf')) return '.gcode.3mf';
  if (lower.endsWith('.gcode')) return '.gcode';
  if (lower.endsWith('.stl')) return '.stl';
  if (lower.endsWith('.3mf')) return '.3mf';
  return null;
}

export function getAcceptedFileExtensions(draft: Pick<BookingDraft, 'printMode' | 'materialSource'>) {
  return isSelfPrint(draft as BookingDraft) && isLabMaterial(draft as BookingDraft)
    ? ['.gcode', '.gcode.3mf']
    : ['.stl', '.3mf'];
}

export function normalizeColorsForPrinter({ colors, hasAMS, availableColors }: NormalizeColorsForPrinterOptions) {
  const nextColors = colors.filter((color) => availableColors.includes(color));
  if (hasAMS) {
    return nextColors.slice(0, 4);
  }
  return nextColors.length > 0 ? [nextColors[0]] : [];
}

export function normalizeColorsForMaterial({ colors, availableColors, hasAMS }: NormalizeColorsForMaterialOptions) {
  return normalizeColorsForPrinter({
    colors,
    availableColors,
    hasAMS,
  });
}

export function buildSlotTime(draft: Pick<BookingDraft, 'preferredDate' | 'preferredSlot' | 'preferredSubSlot'>, slotLabels: Record<string, string>) {
  if (!draft.preferredSlot) return undefined;

  const slotLabel = slotLabels[draft.preferredSlot];
  if (!slotLabel) return undefined;

  const dateLabel = draft.preferredDate
    ? new Date(`${draft.preferredDate}T12:00:00`).toLocaleDateString('vi-VN')
    : '';

  const timeLabel = draft.preferredSubSlot
    ? `${slotLabel} (${draft.preferredSubSlot})`
    : slotLabel;

  return [dateLabel, timeLabel].filter(Boolean).join(' - ');
}

function buildEstimatedTimeString(draft: Pick<BookingDraft, 'estimatedTimeValue' | 'estimatedTimeUnit'>) {
  const value = Number.parseFloat(draft.estimatedTimeValue);
  if (!value) return undefined;
  return draft.estimatedTimeUnit === 'hours' ? `${value}h` : `${value}m`;
}

export function buildCreateJobPayload({ draft, slotLabels }: BuildPayloadOptions) {
  const selfPrint = isSelfPrint(draft);
  const labMaterial = isLabMaterial(draft);
  const resolvedColors = draft.colors.map((color) => (color === 'Other' ? (draft.customColor || 'Other') : color));
  const slotTime = selfPrint ? buildSlotTime(draft, slotLabels) : undefined;

  return {
    printMode: draft.printMode,
    jobName: draft.jobName,
    description: draft.description,
    fileName: draft.fileName || undefined,
    estimatedTime: buildEstimatedTimeString(draft),
    estimatedGrams: draft.estimatedGrams,
    materialType: labMaterial || draft.printMode === 'lab_assisted' ? draft.materialType || undefined : undefined,
    color: selfPrint && labMaterial ? resolvedColors.join(', ') || undefined : undefined,
    brand: !labMaterial && draft.printMode === 'lab_assisted' ? draft.brand || undefined : undefined,
    materialSource: draft.materialSource,
    printerId: selfPrint && draft.printerId ? draft.printerId : undefined,
    slotTime,
  };
}

export function validateBookingStep({
  step,
  draft,
  availableColors,
  uploadedFileName,
  selectedPrinterHasAMS,
}: ValidateBookingStepOptions): BookingValidationErrorCode | null {
  if (step === 1 && !draft.jobName.trim()) {
    return 'job-name-required';
  }

  if (step === 2 && isSelfPrint(draft) && isLabMaterial(draft)) {
    if (!draft.materialType) {
      return 'material-required';
    }

    const selectedColors = draft.colors.filter((color) => availableColors.includes(color));
    const hasValidSelection = selectedPrinterHasAMS
      ? selectedColors.length >= 1 && selectedColors.length <= 4
      : selectedColors.length === 1;

    if (!hasValidSelection) {
      return 'color-required';
    }
  }

  if (step === 3) {
    if (!uploadedFileName) {
      return 'file-required';
    }

    if (isSelfPrint(draft) && isLabMaterial(draft)) {
      const hasParsedMetrics = draft.estimatedGrams > 0 && Number.parseFloat(draft.estimatedTimeValue) > 0;
      if (!hasParsedMetrics) {
        return 'parsed-metrics-required';
      }
    }
  }

  return null;
}
