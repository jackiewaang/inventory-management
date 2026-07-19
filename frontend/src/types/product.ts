export interface Product { id: number; itemno: string; buying_price: string; selling_price: string; image_path: string | null; colors: string | null; colli: number | null; tags: string | null; created_at: string; updated_at: string }
export interface ProductPayload { itemno: string; buying_price: number; selling_price: number; image_path: string | null; colors: string | null; colli: number | null; tags: string | null }
export interface ProductFormValues { itemno: string; buying_price: string; selling_price: string; colli: string; tags: string; productImage: File | null; colorsImage: File | null; image_path: string | null; colors: string | null }
export type SortOption = 'created_desc' | 'created_asc' | 'itemno_asc' | 'itemno_desc'
