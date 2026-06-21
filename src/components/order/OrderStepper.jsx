const STEPS = [
  { key: 'received',   label: 'Đã nhận',   icon: 'receipt' },
  { key: 'preparing',  label: 'Đang làm',  icon: 'restaurant' },
  { key: 'delivering', label: 'Đang giao', icon: 'delivery_dining' },
  { key: 'done',       label: 'Hoàn thành',icon: 'check_circle' },
]

const ORDER = ['received', 'preparing', 'delivering', 'done']

export default function OrderStepper({ status }) {
  const current = ORDER.indexOf(status)

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const done   = idx <= current
        const active = idx === current
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-primary-fixed' : done ? 'bg-primary-fixed/40' : 'bg-surface-container-high'}`}>
                <span className={`material-symbols-outlined text-[14px] ${active ? 'text-black' : done ? 'text-primary-fixed' : 'text-secondary'}`}>
                  {step.icon}
                </span>
              </div>
              <span className={`text-[9px] uppercase tracking-wider font-bold ${active ? 'text-primary-fixed' : done ? 'text-secondary' : 'text-surface-variant'}`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-px flex-1 mx-1 mb-4 ${idx < current ? 'bg-primary-fixed/40' : 'bg-surface-container-high'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
