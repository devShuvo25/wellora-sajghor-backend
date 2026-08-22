// category.validation.ts
import z from "zod";

const createCategory = z.object({
  body: z.object({
    name: z.string({
      required_error: "Name is required!",
    }),
    description: z.string().optional(),
  }),
});

const updateCategory = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const categoryValidation = { createCategory, updateCategory };