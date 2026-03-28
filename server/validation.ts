import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { ZodSchema } from 'zod';

import { resolveUploadExtension } from '../src/lib/bookingRules';

export const RegisterSchema = z.object({
  email: z.string().email().max(254),
  password: z.string()
    .min(8, 'Mat khau toi thieu 8 ky tu')
    .max(128)
    .regex(/[a-z]/, 'Mat khau phai chua it nhat 1 chu thuong')
    .regex(/[A-Z]/, 'Mat khau phai chua it nhat 1 chu hoa')
    .regex(/[0-9]/, 'Mat khau phai chua it nhat 1 chu so'),
  fullName: z.string().min(2, 'Ten toi thieu 2 ky tu').max(100).trim(),
  studentId: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
  supervisor: z.string().max(100).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

const ManagedPasswordSchema = z.string()
  .min(8, 'Mat khau toi thieu 8 ky tu')
  .max(128)
  .regex(/[a-z]/, 'Mat khau phai chua it nhat 1 chu thuong')
  .regex(/[A-Z]/, 'Mat khau phai chua it nhat 1 chu hoa')
  .regex(/[0-9]/, 'Mat khau phai chua it nhat 1 chu so');

export const CreateJobSchema = z.object({
  jobName: z.string().min(1, 'Ten job khong duoc de trong').max(200).trim(),
  description: z.string().max(2000).optional(),
  fileName: z.string().max(255).optional(),
  estimatedTime: z.string().max(50).optional(),
  estimatedGrams: z.number().int().min(0).max(10000).optional(),
  materialType: z.enum(['PLA', 'PETG', 'TPU', 'ABS']).nullable().optional(),
  color: z.string().max(50).optional(),
  brand: z.string().max(100).optional(),
  materialSource: z.enum(['Lab', 'Personal'], { message: 'materialSource phai la Lab hoac Personal' }),
  printMode: z.enum(['self', 'lab_assisted']).optional(),
  printerId: z.string().max(50).optional(),
  slotTime: z.string().max(50).optional(),
}).superRefine((data, ctx) => {
  const printMode = data.printMode === 'lab_assisted' ? 'lab_assisted' : 'self';
  const isLabMaterial = data.materialSource === 'Lab';
  const uploadExtension = resolveUploadExtension(data.fileName);
  const allowedExtensions = printMode === 'self' && isLabMaterial
    ? new Set(['.gcode', '.gcode.3mf'])
    : new Set(['.stl', '.3mf']);

  if (!uploadExtension || !allowedExtensions.has(uploadExtension)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['fileName'],
      message: printMode === 'self' && isLabMaterial
        ? 'File tai len phai la .gcode hoac .gcode.3mf'
        : 'File tai len phai la .stl hoac .3mf',
    });
  }

  if ((printMode === 'self' && isLabMaterial) || printMode === 'lab_assisted') {
    if (!data.materialType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['materialType'],
        message: 'Vui long chon loai vat lieu',
      });
    }
  }

  if (printMode === 'self' && isLabMaterial) {
    if (!data.color?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['color'],
        message: 'Vui long chon it nhat mot mau hop le',
      });
    }

    if ((data.estimatedGrams || 0) <= 0 || !data.estimatedTime?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['estimatedGrams'],
        message: 'File sliced phai cung cap khoi luong va thoi gian in',
      });
    }
  }
});

export const PatchJobSchema = z.object({
  status: z.string().max(50).optional(),
  rejectionReason: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
  printerId: z.string().max(50).optional(),
  slotTime: z.string().max(50).optional(),
  actualGrams: z.number().int().min(0).max(10000).optional(),
  revisionNote: z.string().max(500).optional(),
  estimatedGrams: z.number().int().min(0).max(10000).optional(),
  estimatedTime: z.string().max(50).optional(),
}).strict();

export const PatchUserSchema = z.object({
  status: z.enum(['active', 'pending', 'suspended']).optional(),
  role: z.enum(['Admin', 'Moderator', 'Student']).optional(),
  banReason: z.string().max(500).optional(),
  banUntil: z.string().max(50).optional(),
}).strict();

export const UpdateManagedPasswordSchema = z.object({
  newPassword: ManagedPasswordSchema,
}).strict();

export const ChangeOwnPasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui long nhap mat khau hien tai').max(128),
  newPassword: ManagedPasswordSchema,
}).strict();

export const UpdatePricingSchema = z.object({
  rules: z.array(z.object({
    material: z.string().min(1).max(20),
    pricePerGram: z.number().min(0).max(10_000_000),
  })).max(20),
});

export const UpdateServiceFeesSchema = z.object({
  fees: z.array(z.object({
    name: z.string().min(1).max(50),
    amount: z.number().min(0).max(100_000_000),
    enabled: z.boolean().optional(),
  })).max(20),
});

export const PostMessageSchema = z.object({
  content: z.string().min(1, 'Noi dung khong duoc de trong').max(5000).trim(),
  jobId: z.string().max(50).optional(),
});

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Du lieu khong hop le',
        details: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
