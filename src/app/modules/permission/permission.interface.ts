// permission.types.ts
export type IUpdatePermissions = {
  categoryCreate?: boolean;
  categoryUpdate?: boolean;
  categoryDelete?: boolean;
  userCreate?: boolean;
  userAssignCategory?: boolean;
  documentUpload?: boolean;
  documentUpdate?: boolean;
  documentDelete?: boolean;
};