// user.validation.ts
import z from "zod";

const updateUser = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),
    position: z.enum(['SUBSONTRUCTOR', 'EMPLOYEE', 'MANAGER']).optional(),
    role: z.enum(['USER', 'ADMIN', 'SUPERADMIN']).optional(),
    status: z.enum(['ACTIVATE', 'INACTIVATE', 'BLOCKED']).optional(),
  }),
});

const assignCategories = z.object({
  body: z.object({
    categoryIds: z.array(z.string()),
  }),
});

export const userValidation = { updateUser, assignCategories };