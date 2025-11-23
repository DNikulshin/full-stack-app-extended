import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { AtStrategy, RtStrategy } from './strategies'

@Module({
  imports: [PrismaModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy],
})
export class AuthModule {}
