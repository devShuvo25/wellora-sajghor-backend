export type ICreateDocument = {
  title: string;
  description?: string;
  categoryId: string;
};

export type IUpdateDocument = {
  title?: string;
  description?: string;
  categoryId?: string;
};