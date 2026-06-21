import { render, screen } from '@testing-library/react'
import Button from './Button'

test('renders primary button with children', () => {
  render(<Button>ĐẶT NGAY</Button>)
  expect(screen.getByRole('button', { name: 'ĐẶT NGAY' })).toBeInTheDocument()
})

test('primary variant has neon-glow class', () => {
  render(<Button variant="primary">Primary</Button>)
  expect(screen.getByRole('button')).toHaveClass('neon-glow')
})

test('ghost variant does not have neon-glow class', () => {
  render(<Button variant="ghost">Ghost</Button>)
  expect(screen.getByRole('button')).not.toHaveClass('neon-glow')
})

test('disabled button is not interactive', () => {
  render(<Button disabled>Disabled</Button>)
  expect(screen.getByRole('button')).toBeDisabled()
})

test('secondary variant renders correctly', () => {
  render(<Button variant="secondary">Secondary</Button>)
  const btn = screen.getByRole('button')
  expect(btn).toBeInTheDocument()
  expect(btn).not.toBeDisabled()
})
