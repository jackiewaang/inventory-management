import { useState } from 'react'
import { productApi } from '../api/products'
import type { Product } from '../types/product'
import { useLanguage } from '../i18n'
import { ImageZoomViewer } from './ImageZoomViewer'

export interface ProductDetailProps { product: Product; onBack: () => void; onEdit: (product: Product) => void; onDelete: (product: Product) => void }
export function ProductDetail({ product, onBack, onEdit, onDelete }: ProductDetailProps) {
  const [showBuyingPrice, setShowBuyingPrice] = useState(false)
  const [zoomImage, setZoomImage] = useState<{ src: string; alt: string } | null>(null)
  const { language, t } = useLanguage()
  const locale = language === 'zh' ? 'zh-CN' : 'en-IE'
  const money = (value: string) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(Number(value))
  const image = productApi.imageUrl(product.image_path); const colors = productApi.imageUrl(product.colors)
  const tags = product.tags?.split(',').map(value => value.trim()).filter(Boolean) ?? []
  return <main className="page-shell"><div className="page-width py-6 sm:py-10">
    <button type="button" onClick={onBack} className="mb-6 text-sm font-bold text-slate-600 hover:text-teal-700">← {t.back}</button>
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid lg:grid-cols-2">
      <div className="aspect-square bg-slate-100">{image ? <button type="button" onClick={() => setZoomImage({ src: image, alt: `${t.productImage} ${product.itemno}` })} className="group relative block h-full w-full overflow-hidden text-left"><img src={image} alt={`${t.productImage} ${product.itemno}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"/><span className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm backdrop-blur">Zoom</span></button> : <div className="grid h-full place-items-center text-slate-400">{t.noImage}</div>}</div>
      <div className="p-6 sm:p-10"><p className="text-xs font-bold uppercase tracking-[.2em] text-teal-700">{t.details}</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{product.itemno}</h1><p className="mt-2 text-xs text-slate-400">{t.created} {new Date(product.created_at).toLocaleDateString(locale)}</p>
        <div className="mt-8 grid grid-cols-2 gap-3"><div className="info-box"><span>{t.selling}</span><strong>{money(product.selling_price)}</strong></div><div className="info-box"><span>{t.colli}</span><strong>{product.colli ?? '—'}</strong></div></div>
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-slate-200 p-4"><span className="text-sm font-semibold text-slate-500">{t.buying}</span><button type="button" onClick={() => setShowBuyingPrice(value => !value)} className="text-sm font-bold text-teal-700">{showBuyingPrice ? money(product.buying_price) : t.revealPrice}</button></div>
        {tags.length > 0 && <div className="mt-6"><p className="label">{t.tags}</p><div className="mt-2 flex flex-wrap gap-2">{tags.map(tag => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{tag}</span>)}</div></div>}
        {product.notes && <div className="mt-6"><p className="label">{t.notes}</p><p className="mt-2 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{product.notes}</p></div>}
        {colors && <div className="mt-6"><p className="label">{t.colors}</p><button type="button" onClick={() => setZoomImage({ src: colors, alt: `${t.available} ${product.itemno}` })} className="group relative mt-2 block w-full overflow-hidden rounded-2xl border border-slate-200 text-left"><img src={colors} alt={`${t.available} ${product.itemno}`} className="h-36 w-full object-cover transition duration-300 group-hover:scale-[1.03]"/><span className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-bold backdrop-blur">{t.available}</span><span className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm backdrop-blur">Zoom</span></button></div>}
        <div className="mt-8 grid grid-cols-2 gap-3"><button type="button" onClick={() => onEdit(product)} className="btn-secondary">{t.edit}</button><button type="button" onClick={() => onDelete(product)} className="rounded-xl px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50">{t.delete}</button></div>
      </div>
    </article>
    {zoomImage && <ImageZoomViewer src={zoomImage.src} alt={zoomImage.alt} onClose={() => setZoomImage(null)}/>}
  </div></main>
}
