import { useQueue } from '../hooks/useQueue'
import Badge from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import Spinner from '../components/ui/Spinner'
import TopAppBar from '../components/layout/TopAppBar'

export default function Home() {
  const { activeOrders, avgWaitMin, error } = useQueue()

  return (
    <>
      <TopAppBar title="OEG Cyber Hub" />
      <div className="pt-16 pb-20 px-4 flex flex-col gap-4">

        {/* Facility card */}
        <div className="bg-surface border border-surface-container-high rounded-[20px] overflow-hidden mt-3">
          <div className="relative h-36 bg-gradient-to-br from-surface-container to-background flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-primary-fixed/30">videogame_asset</span>
            <div className="absolute inset-0 flex items-end p-4">
              <Badge variant="live">ĐANG MỞ CỬA</Badge>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-3">
            <div>
              <h2 className="font-display font-black text-lg uppercase tracking-tight text-primary">
                OEG Cyber Hub
              </h2>
              <p className="text-secondary text-xs mt-0.5">Gaming Station · F&B · Esports</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary">Tỷ lệ lấp đầy</span>
                <span className="text-primary-fixed font-bold">87%</span>
              </div>
              <ProgressBar value={87} />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <StatPill icon="wifi" label="PING" value="4ms" />
              <StatPill icon="people" label="ĐANG CHƠI" value="42/48" />
              <StatPill icon="timer" label="CHỜ ĐỢI" value={avgWaitMin ? `~${avgWaitMin}p` : '—'} />
            </div>
          </div>
        </div>

        {/* Queue Status Widget */}
        <div className="bg-surface border border-surface-container-high rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-primary">
              Hàng chờ F&B
            </h3>
            {activeOrders > 0 && <Badge variant="live">{activeOrders} đơn</Badge>}
          </div>

          {error && <p className="text-error text-xs">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container rounded-xl p-3 text-center">
              <p className="text-secondary text-xs uppercase tracking-wider">Đơn đang xử lý</p>
              <p className="text-primary font-display font-black text-2xl mt-1">{activeOrders}</p>
            </div>
            <div className="bg-surface-container rounded-xl p-3 text-center">
              <p className="text-secondary text-xs uppercase tracking-wider">Thời gian chờ TB</p>
              <p className="text-primary-fixed font-display font-black text-2xl mt-1">
                {avgWaitMin ? `~${avgWaitMin}p` : '—'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

function StatPill({ icon, label, value }) {
  return (
    <div className="bg-surface-container rounded-xl p-2.5 flex flex-col items-center gap-1 text-center">
      <span className="material-symbols-outlined text-[16px] text-secondary">{icon}</span>
      <span className="text-[9px] text-secondary uppercase tracking-wider">{label}</span>
      <span className="text-xs font-bold text-primary">{value}</span>
    </div>
  )
}
