export interface ICreateProduct {
  brand: string;
  name: string;
  slug?: string;
  categoryId: string;
  price: number;
  comparePrice?: number;
  points?: number;
  image: string;
  altText?: string;
  description: string;
  volume?: string;
  keyIngredients?: string[];
  skinType?: string[];
  isTrending?: boolean;
  inStock?: boolean;
  stockQuantity?: number;
  distributorCommissionRate?: number;
  galleryImages?: { url: string; altText?: string; isPrimary?: boolean }[];
}

export interface IUpdateProduct {
  brand?: string;
  name?: string;
  slug?: string;
  categoryId?: string;
  price?: number;
  comparePrice?: number;
  points?: number;
  image?: string;
  altText?: string;
  description?: string;
  volume?: string;
  keyIngredients?: string[];
  skinType?: string[];
  isTrending?: boolean;
  inStock?: boolean;
  stockQuantity?: number;
  distributorCommissionRate?: number;
}

export interface IProductFilterOptions {
  searchTerm?: string;
  categoryId?: string;
  categorySlug?: string;
  brand?: string;
  skinType?: string;
  minPrice?: number;
  maxPrice?: number;
  isTrending?: boolean;
  inStock?: boolean;
  sortBy?: 'price-low' | 'price-high' | 'newest' | 'rating' | 'popular';
  page?: number;
  limit?: number;
}

export interface ICreateReview {
  rating: number;
  comment: string;
}
