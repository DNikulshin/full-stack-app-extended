import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { ConfigModule } from '@nestjs/config'
import { EnvSchema } from './config/env.schema'
import { AuthModule } from './auth/auth.module'
import { APP_GUARD } from '@nestjs/core'
import { AtGuard } from './common/guards'

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? '.env.development'
          : process.env.NODE_ENV === 'test'
            ? '.env.test'
            : '.env',
      validate: (config) => {
        const result = EnvSchema.safeParse(config)
        if (!result.success) {
          console.error('❌ Invalid environment variables:')
          for (const issue of result.error.issues) {
            console.error(`- ${issue.path.join('.')}: ${issue.message}`)
          }
          console.error(
            '\nPlease check your .env file or environment variables and restart the server.',
          )
          process.exit(1)
        }
        return result.data
      },
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
