// permission.validation.ts
import z from "zod";

const updatePermissions = z.object({
  body: z.object({
    categoryCreate: z.boolean().optional(),
    categoryUpdate: z.boolean().optional(),
    categoryDelete: z.boolean().optional(),
    userCreate: z.boolean().optional(),
    userAssignCategory: z.boolean().optional(),
    documentUpload: z.boolean().optional(),
    documentUpdate: z.boolean().optional(),
    documentDelete: z.boolean().optional(),
  }),
});

export const permissionValidation = { updatePermissions };