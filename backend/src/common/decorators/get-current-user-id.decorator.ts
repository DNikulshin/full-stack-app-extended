import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { JwtPayload } from '../../auth/types'

export const GetCurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): number => {
    const request: { user: JwtPayload } = context.switchToHttp().getRequest()
    return request.user.sub
  },
)
