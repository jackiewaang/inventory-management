import type { Product, ProductPayload } from '../types/product'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? ''
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, options)
  if (!response.ok) { const body = await response.json().catch(() => null) as { detail?: string } | null; throw new Error(body?.detail ?? 'The request could not be completed.') }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}
const json = (method: string, payload: ProductPayload): RequestInit => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
export const productApi = {
  list: () => request<Product[]>('/products'),
  create: (payload: ProductPayload) => request<Product>('/products', json('POST', payload)),
  update: (id: number, payload: ProductPayload) => request<Product>(`/products/${id}`, json('PATCH', payload)),
  delete: (id: number) => request<void>(`/products/${id}`, { method: 'DELETE' }),
  upload: async (file: File) => { const data = new FormData(); data.append('file', file); return request<{ path: string }>('/products/upload', { method: 'POST', body: data }) },
  imageUrl: (path: string | null) => path ? `${API_URL}${path}` : null,
}
