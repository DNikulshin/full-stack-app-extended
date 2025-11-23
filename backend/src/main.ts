import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe, Logger } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'development'
        ? ['log', 'error', 'warn', 'debug', 'verbose']
        : ['error', 'warn'],
  })
  const configService = app.get(ConfigService)
  const port = configService.getOrThrow<number>('PORT')

  app.useGlobalPipes(new ValidationPipe())

  const config = new DocumentBuilder()
    .setTitle('Median')
    .setDescription('The Median API description')
    .setVersion('0.1')
    .addTag('api')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiSecurity
    )
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  app.enableShutdownHooks()

  const logger = new Logger('bootstrap')
  await app.listen(port, () => {
    logger.log(`
	MODE: ${process.env.NODE_ENV}
	Server has been started on port: ${port}
	Swagger documentation is available at: http://localhost:${port}/api/docs
	Process ID: ${process.pid}
	`)
  })
}

bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})
