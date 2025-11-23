import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { JwtPayloadWithRt } from '../../auth/types'

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtPayloadWithRt | undefined, context: ExecutionContext) => {
    const request: { user: JwtPayloadWithRt } = context
      .switchToHttp()
      .getRequest()
    if (data) {
      return request.user[data]
    }
    return request.user
  },
)
