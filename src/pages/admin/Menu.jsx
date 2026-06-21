import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { db } from '../../lib/firebase'

export default function AdminMenu() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const q = query(collection(db, 'menuItems'), orderBy('createdAt'))
    const unsub = onSnapshot(q,
      (snap) => { setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false) },
      (err) => { toast.error('Không thể tải menu.'); console.error(err); setLoading(false) }
    )
    return unsub
  }, [])

  async function toggleInStock(item) {
    try {
      await updateDoc(doc(db, 'menuItems', item.id), { inStock: !item.inStock })
    } catch (err) {
      toast.error('Không thể cập nhật.')
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-black text-2xl uppercase tracking-tight text-primary">Menu</h1>
          <p className="text-secondary text-sm mt-1">{items.length} món</p>
        </div>
        <button
          onClick={() => navigate('/admin/menu/new')}
          className="bg-primary-fixed text-black text-xs font-bold uppercase px-4 py-2.5 rounded-xl neon-glow hover:bg-primary-fixed-dim transition-colors flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Thêm món
        </button>
      </div>

      {loading && <p className="text-secondary text-center py-12">Đang tải...</p>}

      <div className="bg-surface border border-surface-container-high rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-container-high">
              <th className="text-left px-4 py-3 text-secondary text-xs uppercase tracking-wider">Tên</th>
              <th className="text-left px-4 py-3 text-secondary text-xs uppercase tracking-wider">Loại</th>
              <th className="text-right px-4 py-3 text-secondary text-xs uppercase tracking-wider">Giá</th>
              <th className="text-center px-4 py-3 text-secondary text-xs uppercase tracking-wider">Còn hàng</th>
              <th className="text-center px-4 py-3 text-secondary text-xs uppercase tracking-wider">Sửa</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-surface-container-high last:border-0 hover:bg-surface-container transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
                      : <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px] text-secondary">fastfood</span>
                        </div>
                    }
                    <span className="text-primary font-medium">{item.name}</span>
                    {item.isFeatured && <span className="text-[10px] bg-primary-fixed/20 text-primary-fixed px-1.5 py-0.5 rounded font-bold uppercase">Featured</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-secondary capitalize">{item.category}</td>
                <td className="px-4 py-3 text-right text-on-surface">{item.price.toLocaleString('vi-VN')} đ</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleInStock(item)}
                    className={`w-10 h-6 rounded-full transition-colors relative ${item.inStock ? 'bg-primary-fixed' : 'bg-surface-container-high'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.inStock ? 'left-4' : 'left-0.5'}`} />
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => navigate(`/admin/menu/${item.id}`)}
                    className="text-secondary hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
