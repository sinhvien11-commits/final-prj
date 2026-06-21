export const AUTH_ERRORS = {
  'auth/user-not-found':         'Email không tồn tại.',
  'auth/wrong-password':         'Sai mật khẩu.',
  'auth/invalid-credential':     'Email hoặc mật khẩu không đúng.',
  'auth/too-many-requests':      'Quá nhiều lần thử. Vui lòng đợi.',
  'auth/network-request-failed': 'Lỗi kết nối mạng.',
}

export function getAuthError(code) {
  return AUTH_ERRORS[code] ?? 'Đã có lỗi xảy ra. Vui lòng thử lại.'
}
