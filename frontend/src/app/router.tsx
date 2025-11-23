import { ROUTES } from '../shared/model/routes'
import { createBrowserRouter, redirect } from 'react-router-dom'
import { App } from './app'
import { Providers } from './providers'
import { protectedLoader, ProtectedRoute } from './protected-route'
import { AppHeader } from '@/features/header'

export const router = createBrowserRouter([
  {
    element: (
      <Providers>
        <App />
      </Providers>
    ),
    children: [
      {
        loader: protectedLoader,
        element: (
          <>
            <AppHeader />
            <ProtectedRoute />
          </>
        ),
        children: [
          {
            path: ROUTES.TODOS,
            lazy: () => import('@/features/todos-list/todos-list.page'),
          },
          {
            path: ROUTES.TODO,
            lazy: () => import('@/features/todo/todo.page'),
          },
          {
            path: ROUTES.HOME,
            loader: () => redirect(ROUTES.TODOS),
          },
        ],
      },
    ],
  },
])
