import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/layout/ErrorBoundary'
import RequireAuth from './components/layout/RequireAuth'
import BottomNav from './components/layout/BottomNav'
import { CartProvider } from './context/CartContext'
import MachineModal from './components/MachineModal'

import Home    from './pages/Home'
import Store   from './pages/Store'
import Orders  from './pages/Orders'
import Esports from './pages/Esports'
import Quests  from './pages/Quests'
import Review  from './pages/Review'

import AdminLogin    from './pages/admin/Login'
import AdminOrders   from './pages/admin/Orders'
import AdminRequests from './pages/admin/Requests'
import AdminMenu     from './pages/admin/Menu'
import AdminMenuEdit from './pages/admin/MenuEdit'
import AdminOverview from './pages/admin/Overview'
import AdminReports  from './pages/admin/Reports'

export default function App() {
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  return (
    <BrowserRouter>
      <CartProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1F1F1F',
              color: '#e2e2e2',
              border: '1px solid #2A2A2A',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#9EFF00', secondary: '#000' } },
          }}
        />

        <Routes>
          {/* Customer pages — phone-first */}
          <Route path="/*" element={
            <div className="max-w-[480px] mx-auto min-h-screen bg-background relative">
              <MachineModal />
              <ErrorBoundary>
                <Routes>
                  <Route index        element={<Home />} />
                  <Route path="store"   element={<Store />} />
                  <Route path="orders"  element={<Orders />} />
                  <Route path="esports" element={<Esports />} />
                  <Route path="quests"  element={<Quests />} />
                  <Route path="review"  element={<Review />} />
                </Routes>
              </ErrorBoundary>
              <BottomNav />
            </div>
          } />

          {/* Admin pages — full width */}
          <Route path="/admin/login" element={<ErrorBoundary><AdminLogin /></ErrorBoundary>} />
          <Route path="/admin/*" element={
            <RequireAuth allowedRoles={['kitchen','admin']}>
              <ErrorBoundary>
                <Routes>
                  <Route index             element={<RequireAuth allowedRoles={['admin']}><AdminOverview /></RequireAuth>} />
                  <Route path="orders"     element={<AdminOrders />} />
                  <Route path="requests"   element={<RequireAuth allowedRoles={['admin','kitchen']}><AdminRequests /></RequireAuth>} />
                  <Route path="menu"       element={<RequireAuth allowedRoles={['admin']}><AdminMenu /></RequireAuth>} />
                  <Route path="menu/:id"   element={<RequireAuth allowedRoles={['admin']}><AdminMenuEdit /></RequireAuth>} />
                  <Route path="reports"    element={<RequireAuth allowedRoles={['admin']}><AdminReports /></RequireAuth>} />
                </Routes>
              </ErrorBoundary>
            </RequireAuth>
          } />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}
