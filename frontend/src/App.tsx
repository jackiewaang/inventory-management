import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { productApi } from './api/products'
import { ConfirmModal, ProductDetail, ProductForm, ProductListPage } from './components'
import type { Product, ProductFormValues, ProductPayload, SortOption } from './types/product'
import { LanguageProvider, type Language } from './i18n'

type View = 'list' | 'detail' | 'form'
const emptyForm: ProductFormValues = { itemno: '', buying_price: '', selling_price: '', colli: '', tags: '', productImage: null, colorsImage: null, image_path: null, colors: null }

function App() {
  const [language, setLanguage] = useState<Language>('en')
  const [products, setProducts] = useState<Product[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('list'); const [selected, setSelected] = useState<Product | null>(null); const [deleting, setDeleting] = useState<Product | null>(null)
  const [search, setSearch] = useState(''); const [sort, setSort] = useState<SortOption>('created_desc'); const [form, setForm] = useState<ProductFormValues>(emptyForm); const [saving, setSaving] = useState(false); const [formError, setFormError] = useState<string | null>(null); const [deleteBusy, setDeleteBusy] = useState(false)

  const loadProducts = useCallback(async () => { setLoading(true); setError(null); try { setProducts(await productApi.list()) } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not connect to the API.') } finally { setLoading(false) } }, [])
  useEffect(() => {
    let active = true
    productApi.list()
      .then(data => { if (active) setProducts(data) })
      .catch(caught => { if (active) setError(caught instanceof Error ? caught.message : 'Could not connect to the API.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const visibleProducts = useMemo(() => { const query = search.trim().toLowerCase(); return products.filter(product => !query || product.itemno.toLowerCase().includes(query) || product.tags?.toLowerCase().includes(query)).sort((a,b) => sort === 'itemno_asc' ? a.itemno.localeCompare(b.itemno) : sort === 'itemno_desc' ? b.itemno.localeCompare(a.itemno) : sort === 'created_asc' ? +new Date(a.created_at) - +new Date(b.created_at) : +new Date(b.created_at) - +new Date(a.created_at)) }, [products, search, sort])
  const openCreate = () => { setSelected(null); setForm(emptyForm); setFormError(null); setView('form') }
  const openDetail = (product: Product) => { setSelected(product); setView('detail') }
  const openEdit = (product: Product) => { setSelected(product); setForm({ itemno: product.itemno, buying_price: product.buying_price, selling_price: product.selling_price, colli: product.colli?.toString() ?? '', tags: product.tags ?? '', productImage: null, colorsImage: null, image_path: product.image_path, colors: product.colors }); setFormError(null); setView('form') }
  const updateForm = (field: keyof ProductFormValues, value: string | File | null) => setForm(current => ({ ...current, [field]: value }))
  const saveProduct = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSaving(true); setFormError(null); try { let imagePath = form.image_path; let colorsPath = form.colors; if (form.productImage) imagePath = (await productApi.upload(form.productImage)).path; if (form.colorsImage) colorsPath = (await productApi.upload(form.colorsImage)).path; const payload: ProductPayload = { itemno: form.itemno.trim(), buying_price: Number(form.buying_price), selling_price: Number(form.selling_price), colli: form.colli ? Number(form.colli) : null, tags: form.tags.trim() || null, image_path: imagePath, colors: colorsPath }; const saved = selected ? await productApi.update(selected.id, payload) : await productApi.create(payload); setProducts(current => selected ? current.map(product => product.id === saved.id ? saved : product) : [saved, ...current]); setSelected(saved); setView('detail') } catch (caught) { setFormError(caught instanceof Error ? caught.message : 'Could not save the product.') } finally { setSaving(false) } }
  const deleteProduct = async () => { if (!deleting) return; setDeleteBusy(true); try { await productApi.delete(deleting.id); setProducts(current => current.filter(product => product.id !== deleting.id)); setDeleting(null); setSelected(null); setView('list') } catch (caught) { setDeleting(null); setError(caught instanceof Error ? caught.message : 'Could not delete the product.'); setView('list') } finally { setDeleteBusy(false) } }

  return <LanguageProvider language={language}><>{view === 'list' && <ProductListPage products={visibleProducts} loading={loading} error={error} search={search} sort={sort} onSearch={setSearch} onSort={setSort} onCreate={openCreate} onOpen={openDetail} onRetry={loadProducts} onLanguageChange={() => setLanguage(value => value === 'en' ? 'zh' : 'en')}/>} {view === 'detail' && selected && <ProductDetail product={selected} onBack={() => setView('list')} onEdit={openEdit} onDelete={setDeleting}/>} {view === 'form' && <ProductForm values={form} editing={Boolean(selected)} busy={saving} error={formError} onChange={updateForm} onSubmit={saveProduct} onCancel={() => setView(selected ? 'detail' : 'list')}/>} {deleting && <ConfirmModal product={deleting} busy={deleteBusy} onCancel={() => setDeleting(null)} onConfirm={deleteProduct}/>}</></LanguageProvider>
}
export default App
