import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { db } from '../../lib/firebase'
import Button from '../../components/ui/Button'

const EMPTY = { name: '', category: 'food', price: '', prepMin: '', inStock: true, isFeatured: false, imageUrl: '' }

export default function MenuEdit() {
  const { id }   = useParams()
  const isNew    = id === 'new'
  const navigate = useNavigate()
  const [form, setForm]     = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isNew) return
    getDoc(doc(db, 'menuItems', id)).then((snap) => {
      if (snap.exists()) setForm({ ...EMPTY, ...snap.data() })
    })
  }, [id, isNew])

  function set(key, val) {
    setForm((p) => ({ ...p, [key]: val }))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name || !form.price || !form.prepMin) {
      toast.error('Điền đủ thông tin bắt buộc.')
      return
    }
    setSaving(true)
    try {
      const data = {
        name:       form.name.trim(),
        category:   form.category,
        price:      Number(form.price),
        prepMin:    Number(form.prepMin),
        inStock:    form.inStock,
        isFeatured: form.isFeatured,
        imageUrl:   form.imageUrl.trim(),
      }
      if (isNew) {
        await addDoc(collection(db, 'menuItems'), { ...data, createdAt: serverTimestamp() })
        toast.success('Đã thêm món mới!')
      } else {
        await updateDoc(doc(db, 'menuItems', id), data)
        toast.success('Đã cập nhật!')
      }
      navigate('/admin/menu')
    } catch (err) {
      toast.error('Không thể lưu. Vui lòng thử lại.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/admin/menu')} className="text-secondary hover:text-primary">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-display font-black text-xl uppercase tracking-tight text-primary">
            {isNew ? 'Thêm món mới' : 'Chỉnh sửa món'}
          </h1>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Image preview */}
          {form.imageUrl && (
            <div className="w-full aspect-video bg-surface-container border border-surface-container-high rounded-xl overflow-hidden">
              <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none' }} />
            </div>
          )}

          <Field label="URL ảnh (từ Imgur, Google Drive, v.v.)">
            <input
              value={form.imageUrl}
              onChange={(e) => set('imageUrl', e.target.value)}
              placeholder="https://i.imgur.com/..."
              className="input-field"
            />
          </Field>

          <Field label="Tên món *">
            <input value={form.name} onChange={(e) => set('name', e.target.value)} required
              className="input-field" placeholder="VD: Neon Burger" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Loại">
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input-field">
                <option value="food">Đồ ăn</option>
                <option value="drinks">Nước</option>
                <option value="combo">Combo</option>
              </select>
            </Field>
            <Field label="Giá (VND) *">
              <input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} required min="0"
                className="input-field" placeholder="85000" />
            </Field>
          </div>

          <Field label="Thời gian chuẩn bị (phút) *">
            <input type="number" value={form.prepMin} onChange={(e) => set('prepMin', e.target.value)} required min="1"
              className="input-field" placeholder="15" />
          </Field>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.inStock} onChange={(e) => set('inStock', e.target.checked)}
                className="w-4 h-4 accent-[#9EFF00]" />
              <span className="text-on-surface text-sm">Còn hàng</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)}
                className="w-4 h-4 accent-[#9EFF00]" />
              <span className="text-on-surface text-sm">Nổi bật</span>
            </label>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? 'ĐANG LƯU...' : isNew ? 'THÊM MÓN' : 'CẬP NHẬT'}
          </Button>
        </form>
      </div>

      <style>{`.input-field{width:100%;background:#1F1F1F;border:1px solid #2A2A2A;border-radius:12px;padding:12px 16px;color:#fff;font-size:14px;outline:none}.input-field:focus{border-color:#9EFF00}`}</style>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-secondary text-xs uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}
