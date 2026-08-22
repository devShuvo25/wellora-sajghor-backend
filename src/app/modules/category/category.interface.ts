// category.types.ts
export type ICreateCategory = {
  name: string;
  description?: string;
};

export type IUpdateCategory = {
  name?: string;
  description?: string;
};