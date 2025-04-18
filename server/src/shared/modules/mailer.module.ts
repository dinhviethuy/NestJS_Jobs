import { MailerModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'
import envConfig from 'src/shared/config'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import path from 'path'

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: envConfig.EMAIL_HOST,
          secure: false,
          auth: {
            user: envConfig.EMAIL_ADDRESS,
            pass: envConfig.EMAIL_PASSWORD
          }
        },
        defaults: {
          from: `"No Reply" ${envConfig.EMAIL_ADDRESS}`
        },
        template: {
          dir: path.join(__dirname, '../mails/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true
          }
        }
      })
    })
  ]
})
export class CustomMailerModule {}
