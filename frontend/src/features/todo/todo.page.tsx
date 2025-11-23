import { type PathParams, ROUTES } from '@/shared/model/routes'
import { useParams } from 'react-router-dom'

function TodoPage() {
  const params = useParams<PathParams[typeof ROUTES.TODOS]>()
  return <div>Todo page - {params.todoId}</div>
}

export const Component = TodoPage
