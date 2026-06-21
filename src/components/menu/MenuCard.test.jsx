import { render, screen, fireEvent } from '@testing-library/react'
import MenuCard from './MenuCard'

const item = {
  id: '1',
  name: 'Neon Burger',
  price: 85000,
  prepMin: 15,
  inStock: true,
  imageUrl: '',
}

test('shows item name and price', () => {
  render(<MenuCard item={item} onAdd={() => {}} />)
  expect(screen.getByText('Neon Burger')).toBeInTheDocument()
  expect(screen.getByText(/85[.,]000\s*đ/)).toBeInTheDocument()
})

test('shows prep time', () => {
  render(<MenuCard item={item} onAdd={() => {}} />)
  expect(screen.getByText('~15 phút')).toBeInTheDocument()
})

test('add button is enabled when in stock', () => {
  render(<MenuCard item={item} onAdd={() => {}} />)
  expect(screen.getByRole('button', { name: /thêm/i })).not.toBeDisabled()
})

test('add button is disabled when out of stock', () => {
  render(<MenuCard item={{ ...item, inStock: false }} onAdd={() => {}} />)
  expect(screen.getByRole('button', { name: /thêm/i })).toBeDisabled()
})

test('calls onAdd when add button clicked', () => {
  const onAdd = vi.fn()
  render(<MenuCard item={item} onAdd={onAdd} />)
  fireEvent.click(screen.getByRole('button', { name: /thêm/i }))
  expect(onAdd).toHaveBeenCalledWith(item)
})

test('shows Hết hàng overlay when out of stock', () => {
  render(<MenuCard item={{ ...item, inStock: false }} onAdd={() => {}} />)
  expect(screen.getByText('Hết hàng')).toBeInTheDocument()
})
