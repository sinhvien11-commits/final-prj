import { renderHook } from '@testing-library/react'
import { useOrderNotifications } from './useOrderNotifications'
import toast from 'react-hot-toast'

vi.mock('react-hot-toast')

// Stub Audio so jsdom doesn't throw
global.Audio = class {
  play() { return Promise.resolve() }
}
// Stub Notification
global.Notification = { permission: 'denied' }

const order = (id, status) => ({ id, machineNo: 1, status, items: [] })

afterEach(() => {
  vi.clearAllMocks()
})

test('does NOT fire toast on initial load', () => {
  renderHook(() => useOrderNotifications([order('a', 'received')]))
  expect(toast).not.toHaveBeenCalled()
})

test('fires toast when status changes to preparing', () => {
  const { rerender } = renderHook(({ orders }) => useOrderNotifications(orders), {
    initialProps: { orders: [order('a', 'received')] },
  })
  rerender({ orders: [order('a', 'preparing')] })
  expect(toast).toHaveBeenCalledWith(
    expect.stringContaining('chuẩn bị'),
    expect.objectContaining({ icon: '🍳' })
  )
})

test('fires toast when status changes to delivering', () => {
  const { rerender } = renderHook(({ orders }) => useOrderNotifications(orders), {
    initialProps: { orders: [order('a', 'preparing')] },
  })
  rerender({ orders: [order('a', 'delivering')] })
  expect(toast).toHaveBeenCalledWith(
    expect.stringContaining('đường giao'),
    expect.objectContaining({ icon: '🛵' })
  )
})

test('fires toast when status changes to done', () => {
  const { rerender } = renderHook(({ orders }) => useOrderNotifications(orders), {
    initialProps: { orders: [order('a', 'delivering')] },
  })
  rerender({ orders: [order('a', 'done')] })
  expect(toast).toHaveBeenCalledWith(
    expect.stringContaining('Enjoy'),
    expect.objectContaining({ icon: '✅' })
  )
})

test('fires toast when status changes to cancelled', () => {
  const { rerender } = renderHook(({ orders }) => useOrderNotifications(orders), {
    initialProps: { orders: [order('a', 'received')] },
  })
  rerender({ orders: [order('a', 'cancelled')] })
  expect(toast).toHaveBeenCalledWith(
    expect.stringContaining('hủy'),
    expect.objectContaining({ icon: '❌' })
  )
})

test('does NOT fire toast when status is unchanged', () => {
  const { rerender } = renderHook(({ orders }) => useOrderNotifications(orders), {
    initialProps: { orders: [order('a', 'preparing')] },
  })
  rerender({ orders: [order('a', 'preparing')] })
  expect(toast).not.toHaveBeenCalled()
})

test('handles multiple orders independently', () => {
  const { rerender } = renderHook(({ orders }) => useOrderNotifications(orders), {
    initialProps: { orders: [order('a', 'received'), order('b', 'received')] },
  })
  rerender({ orders: [order('a', 'preparing'), order('b', 'received')] })
  expect(toast).toHaveBeenCalledTimes(1)
  expect(toast).toHaveBeenCalledWith(expect.stringContaining('chuẩn bị'), expect.anything())
})
