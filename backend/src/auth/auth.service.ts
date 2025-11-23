import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AuthDto } from './dto/auth.dto'
import * as bcrypt from 'bcrypt'
import { Tokens } from './types'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { v4 as uuidv4 } from 'uuid'
import { Token } from '@prisma/client'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signUp(dto: AuthDto): Promise<Tokens> {
    const { email, password } = dto

    const candidate = await this.prisma.user.findUnique({
      where: { email },
    })

    if (candidate) {
      throw new ForbiddenException('User with this email already exists')
    }

    const passwordHash = await this.hashData(password)

    const newUser = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    })

    const tokens = await this.getTokens(newUser.id, newUser.email)
    await this.saveRefreshToken(newUser.id, tokens.refresh_token)
    return tokens
  }

  async signIn(dto: AuthDto): Promise<Tokens> {
    const { email, password } = dto

    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new ForbiddenException('Access Denied')
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatches) {
      throw new ForbiddenException('Access Denied')
    }

    const tokens = await this.getTokens(user.id, user.email)
    await this.saveRefreshToken(user.id, tokens.refresh_token)
    return tokens
  }

  async logout(userId: number): Promise<void> {
    await this.prisma.token.deleteMany({
      where: {
        userId: userId,
      },
    })
  }

  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tokens: true },
    })

    if (!user || !user.tokens || user.tokens.length === 0) {
      throw new UnauthorizedException('Access Denied')
    }

    const matchingToken = await this.findMatchingToken(rt, user.tokens)

    if (!matchingToken) {
      await this.prisma.token.deleteMany({ where: { userId } })
      throw new UnauthorizedException('Access Denied')
    }

    if (matchingToken.isUsed) {
      await this.prisma.token.deleteMany({ where: { userId } })
      throw new UnauthorizedException('Access Denied')
    }

    // Mark the token as used and create a new one in a single transaction
    const [_updatedToken, newTokens] = await this.prisma.$transaction(async (prisma) => {
      const token = await prisma.token.update({
        where: { id: matchingToken.id },
        data: { isUsed: true },
      })

      const tokens = await this.getTokens(user.id, user.email)
      await this.saveRefreshToken(user.id, tokens.refresh_token, prisma)

      return [token, tokens]
    })

    return newTokens
  }

  private async findMatchingToken(rt: string, tokens: Token[]): Promise<Token | null> {
    for (const token of tokens) {
      const rtMatches = await bcrypt.compare(rt, token.hashedRt)
      if (rtMatches) {
        return token
      }
    }
    return null
  }

  private hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10)
  }

  private async saveRefreshToken(
    userId: number,
    rt: string,
    prisma: any = this.prisma,
  ): Promise<void> {
    const hashedRt = await this.hashData(rt)
    await prisma.token.create({
      data: {
        userId: userId,
        hashedRt: hashedRt,
      },
    })
  }

  private async getTokens(userId: number, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          jti: uuidv4(),
        },
        {
          secret: this.config.getOrThrow<string>('AT_SECRET'),
          expiresIn: this.config.getOrThrow<number>('AT_EXPIRES_IN'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          jti: uuidv4(),
        },
        {
          secret: this.config.getOrThrow<string>('RT_SECRET'),
          expiresIn: this.config.getOrThrow<number>('RT_EXPIRES_IN'),
        },
      ),
    ])

    return {
      access_token: at,
      refresh_token: rt,
    }
  }
}
