import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useSound } from '../context/SoundContext'

export function useNewOrderAlert(receivedOrders) {
  const { play } = useSound()
  const prevCountRef = useRef(null)

  useEffect(() => {
    // Skip first snapshot on mount — don't alert on page load
    if (prevCountRef.current === null) {
      prevCountRef.current = receivedOrders.length
      return
    }
    // Có ĐƠN MỚI vào bảng bếp (số đơn 'received' tăng) → beep.
    if (receivedOrders.length > prevCountRef.current) {
      toast('Đơn hàng mới!', { icon: '🔔', duration: 5000 })
      play()
    }
    prevCountRef.current = receivedOrders.length
  }, [receivedOrders.length, play])
}
