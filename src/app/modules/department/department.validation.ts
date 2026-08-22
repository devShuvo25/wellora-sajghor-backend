import { z } from 'zod';

// Create Department Validation
export const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  program: z.enum(['BSC', 'BBA', 'MBA', 'MSC', 'OTHERS']),
  icon: z.string().url('Icon must be a valid URL').optional(),
  image: z.string().url('Image must be a valid URL').optional(),
});

// Update Department Validation (all optional for partial updates)
export const updateDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  program: z.enum(['BSC', 'BBA', 'MBA', 'MSC', 'OTHERS']).optional(),
  icon: z.string().url('Icon must be a valid URL').optional(),
  image: z.string().url('Image must be a valid URL').optional(),
});
