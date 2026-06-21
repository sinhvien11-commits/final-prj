import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

export function useNewOrderAlert(receivedOrders) {
  const prevCountRef = useRef(null)

  useEffect(() => {
    // Skip first snapshot on mount — don't alert on page load
    if (prevCountRef.current === null) {
      prevCountRef.current = receivedOrders.length
      return
    }
    if (receivedOrders.length > prevCountRef.current) {
      toast('Đơn hàng mới!', { icon: '🔔', duration: 5000 })
      new Audio('/sounds/new-order.mp3').play().catch(() => {})
    }
    prevCountRef.current = receivedOrders.length
  }, [receivedOrders.length])
}
