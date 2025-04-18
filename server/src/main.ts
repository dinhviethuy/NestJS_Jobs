import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import envConfig from './shared/config'
import { VersioningType } from '@nestjs/common'
import cookieParser from 'cookie-parser'
import { NestExpressApplication } from '@nestjs/platform-express'
import helmet from 'helmet'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  // app.useStaticAssets('uploads', {
  //   prefix: '/files/static/'
  // })
  app.setGlobalPrefix('api')
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1']
  })
  app.enableCors({
    origin: true,
    credentials: true
  })
  app.use(cookieParser())
  app.use(helmet())
  const config = new DocumentBuilder()
    .setTitle('NestJs Finder Job API Documentation')
    .setDescription('The job API description')
    .setVersion('1.0')
    .addOAuth2()
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
        in: 'header'
      },
      'token'
    )
    .addSecurityRequirements('token')
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true
    }
  })
  await app.listen(envConfig.PORT ?? 3000).then(() => {
    console.log(`Server is running on port ${envConfig.PORT}`)
  })
}
//
bootstrap()
