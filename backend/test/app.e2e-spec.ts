import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from './../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'
import { Tokens } from '../src/auth/types'
import * as http from 'http'

describe('AppController (e2e)', () => {
  let app: INestApplication
  let httpServer: http.Server

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    httpServer = app.getHttpServer() as http.Server
  })

  afterAll(async () => {
    await app.close()
  })

  it('/ (GET)', () => {
    return request(httpServer).get('/').expect(200).expect('Hello World!')
  })
})

describe('Auth Endpoints (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let httpServer: http.Server

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    )
    await app.init()
    httpServer = app.getHttpServer() as http.Server

    prisma = app.get<PrismaService>(PrismaService)
  })

  beforeEach(async () => {
    await prisma.token.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await app.close()
  })

  const dto = {
    email: 'test@example.com',
    password: 'supersecret',
  }

  let tokens: Tokens

  describe('POST /auth/signup', () => {
    it('should create a new user and return tokens', async () => {
      return request(httpServer)
        .post('/auth/signup')
        .send(dto)
        .expect(201)
        .then(async (res) => {
          expect(res.body).toHaveProperty('access_token')
          expect(res.body).toHaveProperty('refresh_token')
          const user = await prisma.user.findUnique({
            where: { email: dto.email },
          })
          expect(user).toBeDefined()
          if (user) {
            const userTokens = await prisma.token.findMany({
              where: { userId: user.id },
            })
            expect(userTokens.length).toBe(1)
          }
        })
    })

    it('should throw a 403 error for duplicate email', async () => {
      await request(httpServer).post('/auth/signup').send(dto)
      return request(httpServer).post('/auth/signup').send(dto).expect(403)
    })
  })

  describe('POST /auth/signin', () => {
    beforeEach(async () => {
      await request(httpServer).post('/auth/signup').send(dto)
    })

    it('should return tokens for valid credentials', () => {
      return request(httpServer)
        .post('/auth/signin')
        .send(dto)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('access_token')
          expect(res.body).toHaveProperty('refresh_token')
        })
    })

    it('should throw a 403 for invalid password', () => {
      return request(httpServer)
        .post('/auth/signin')
        .send({ ...dto, password: 'wrongpassword' })
        .expect(403)
    })
  })

  describe('POST /auth/logout', () => {
    beforeEach(async () => {
      const res = await request(httpServer).post('/auth/signup').send(dto)
      tokens = res.body as Tokens
    })

    it('should clear all tokens and logout the user from all sessions', async () => {
      // Log in from another device, creating a second token
      await request(httpServer).post('/auth/signin').send(dto)

      const user = await prisma.user.findUnique({ where: { email: dto.email } })
      if (!user) throw new Error('User not found in test')

      let userTokens = await prisma.token.findMany({
        where: { userId: user.id },
      })
      expect(userTokens.length).toBe(2)

      await request(httpServer)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${tokens.access_token}`)
        .expect(200)

      userTokens = await prisma.token.findMany({ where: { userId: user.id } })
      expect(userTokens.length).toBe(0)
    })
  })

  describe('POST /auth/refresh', () => {
    beforeEach(async () => {
      const res = await request(httpServer).post('/auth/signup').send(dto)
      tokens = res.body as Tokens
    })

    it('should return new tokens if refresh token is valid', async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // wait for token to be different

      return request(httpServer)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${tokens.refresh_token}`)
        .expect(200)
        .then((res) => {
          const newTokens = res.body as Tokens
          expect(newTokens).toHaveProperty('access_token')
          expect(newTokens.access_token).not.toBe(tokens.access_token)
        })
    })

    it('should clear all tokens if an old refresh token is used', async () => {
      // First, successfully refresh to get a new set of tokens
      const refreshRes = await request(httpServer)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${tokens.refresh_token}`)

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _newTokens = refreshRes.body as Tokens

      // Now, attempt to use the OLD refresh token again
      await request(httpServer)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${tokens.refresh_token}`) // Using the old RT
        .expect(401)

      // Expect all tokens for that user to be deleted
      const user = await prisma.user.findUnique({ where: { email: dto.email } })
      if (!user) throw new Error('User not found in test')
      const userTokens = await prisma.token.findMany({
        where: { userId: user.id },
      })
      expect(userTokens.length).toBe(0)
    })

    it('should throw 401 if refresh token is invalid', () => {
      return request(httpServer)
        .post('/auth/refresh')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401)
    })
  })
})
