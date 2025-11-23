import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthDto } from './dto/auth.dto'
import { Tokens } from './types'
import { Public, GetCurrentUser, GetCurrentUserId } from '../common/decorators'
import { RtGuard } from '../common/guards'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({
    status: 201,
    description: 'User has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  signUp(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signUp(dto)
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in a user' })
  @ApiResponse({
    status: 200,
    description: 'User has been successfully signed in.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  signIn(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signIn(dto)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out a user from all devices' })
  @ApiResponse({
    status: 200,
    description: 'User has been successfully logged out.',
  })
  @ApiSecurity('JWT-auth')
  logout(@GetCurrentUserId() userId: number): Promise<void> {
    return this.authService.logout(userId)
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiResponse({
    status: 200,
    description: 'Tokens have been successfully refreshed.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiSecurity('JWT-auth')
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken)
  }
}
