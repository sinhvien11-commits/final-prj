// Default landing page per role — used both after login and when a role is
// denied a route. Kitchen lives on the orders board; admin on the overview.
export function roleHome(role) {
  if (role === 'admin')   return '/admin'
  if (role === 'kitchen') return '/admin/orders'
  return '/admin/login'
}
