import { ROUTES } from '@/shared/model/routes'
import { Outlet, redirect } from 'react-router-dom'

export function ProtectedRoute() {
  return <Outlet />
}

export async function protectedLoader() {
  const token = true

  if (!token) {
    return redirect(ROUTES.HOME) // redirect to ROUTES.HOME auth
  }

  return null
}
