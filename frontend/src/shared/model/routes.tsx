import 'react-router-dom'

export const ROUTES = {
  HOME: '/',
  TODOS: '/todos',
  TODO: '/todos/:todoId',
} as const

export type PathParams = {
  [ROUTES.TODOS]: {
    todoId: string
  }
}

declare module 'react-router-dom' {
  interface Register {
    params: PathParams
  }
}
