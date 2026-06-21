import { render, screen } from '@testing-library/react'
import Badge from './Badge'

test('renders badge text', () => {
  render(<Badge>ĐANG MỞ CỬA</Badge>)
  expect(screen.getByText('ĐANG MỞ CỬA')).toBeInTheDocument()
})

test('live variant shows pulsing dot', () => {
  const { container } = render(<Badge variant="live">LIVE</Badge>)
  expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
})

test('default variant does not show pulsing dot', () => {
  const { container } = render(<Badge>STATUS</Badge>)
  expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument()
})

test('live variant has primary-fixed text color class', () => {
  render(<Badge variant="live">LIVE</Badge>)
  expect(screen.getByText('LIVE').closest('span')).toHaveClass('text-primary-fixed')
})
