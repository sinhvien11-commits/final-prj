import { useState, useEffect } from 'react'
import ProgressBar from '../components/ui/ProgressBar'
import Button from '../components/ui/Button'
import TopAppBar from '../components/layout/TopAppBar'

const TASKS = [
  { id: 1, icon: 'storefront',  label: 'Đặt F&B lần đầu',      pts: 50,  progress: 100, done: true },
  { id: 2, icon: 'videogame_asset', label: 'Chơi 3 giờ liên tục', pts: 100, progress: 75,  done: false },
  { id: 3, icon: 'star',        label: 'Để lại đánh giá',       pts: 30,  progress: 0,   done: false },
  { id: 4, icon: 'group',       label: 'Mời bạn bè',            pts: 200, progress: 33,  done: false },
]

function countdown(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return `${h}g ${m}p`
}

export default function Quests() {
  const [remaining, setRemaining] = useState(() => {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    return end.getTime() - Date.now()
  })

  useEffect(() => {
    const id = setInterval(() => setRemaining((p) => Math.max(0, p - 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <TopAppBar title="Quests" />
      <div className="pt-16 pb-20 px-4 flex flex-col gap-4 mt-3">

        {/* Membership card */}
        <div className="bg-gradient-to-br from-surface to-surface-container border border-surface-container-high rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-secondary text-xs uppercase tracking-wider">Hạng thành viên</p>
              <p className="font-display font-black text-xl text-primary-fixed mt-0.5">THÀNH VIÊN VÀNG</p>
            </div>
            <span className="material-symbols-outlined text-4xl text-primary-fixed/60">workspace_premium</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-xs">Điểm tích lũy</p>
              <p className="font-display font-black text-2xl text-primary">1,240 pts</p>
            </div>
            <Button variant="secondary" className="!w-auto px-4 py-2 text-xs">ĐỔI VOUCHER</Button>
          </div>
        </div>

        {/* Daily tasks */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-primary">
              Nhiệm vụ hôm nay
            </h3>
            <span className="text-secondary text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">timer</span>
              Còn {countdown(remaining)}
            </span>
          </div>

          {TASKS.map((task) => (
            <div key={task.id} className={`bg-surface border border-surface-container-high rounded-xl p-4 flex flex-col gap-2 ${task.done ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${task.done ? 'bg-primary-fixed/20' : 'bg-surface-container'}`}>
                  <span className={`material-symbols-outlined text-[16px] ${task.done ? 'text-primary-fixed' : 'text-secondary'}`}>
                    {task.done ? 'check_circle' : task.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${task.done ? 'line-through text-secondary' : 'text-on-surface'}`}>
                    {task.label}
                  </p>
                  <p className="text-xs text-primary-fixed font-bold">+{task.pts} pts</p>
                </div>
              </div>
              {!task.done && task.progress > 0 && (
                <div className="flex items-center gap-2">
                  <ProgressBar value={task.progress} className="flex-1" />
                  <span className="text-secondary text-xs">{task.progress}%</span>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </>
  )
}
