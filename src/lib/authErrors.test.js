import { getAuthError } from './authErrors'

test('maps auth/wrong-password', () => {
  expect(getAuthError('auth/wrong-password')).toBe('Sai mật khẩu.')
})

test('maps auth/user-not-found', () => {
  expect(getAuthError('auth/user-not-found')).toBe('Email không tồn tại.')
})

test('maps auth/invalid-credential', () => {
  expect(getAuthError('auth/invalid-credential')).toBe('Email hoặc mật khẩu không đúng.')
})

test('maps auth/too-many-requests', () => {
  expect(getAuthError('auth/too-many-requests')).toBe('Quá nhiều lần thử. Vui lòng đợi.')
})

test('returns fallback for unknown code', () => {
  expect(getAuthError('auth/unknown-code')).toMatch(/thử lại/)
})
