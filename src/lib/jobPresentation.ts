import { MaterialSource, type PrintJob } from '../types';

interface JobMaterialFallbackOptions {
  ownMaterialLabel: string;
  missingMaterialLabel: string;
}

export function getJobMaterialSummary(job: Pick<PrintJob, 'materialType' | 'color' | 'materialSource'>, options: JobMaterialFallbackOptions) {
  if (job.materialType) {
    return job.color ? `${job.materialType} / ${job.color}` : job.materialType;
  }

  return job.materialSource === MaterialSource.OWN
    ? options.ownMaterialLabel
    : options.missingMaterialLabel;
}

export function getJobMaterialDetail(job: Pick<PrintJob, 'materialType' | 'color' | 'materialSource'>, options: JobMaterialFallbackOptions) {
  if (job.materialType) {
    return job.color ? `${job.materialType} (${job.color})` : job.materialType;
  }

  return job.materialSource === MaterialSource.OWN
    ? options.ownMaterialLabel
    : options.missingMaterialLabel;
}
