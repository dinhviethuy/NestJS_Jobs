import { Controller, Get, Post } from '@nestjs/common'
import { SharedMailService } from 'src/shared/services/shared-mail.service'
import { Cron } from '@nestjs/schedule'
import { MongoDBService } from 'src/shared/services/mongodb.service'
import { SkipCheckPermission } from 'src/shared/decorators/auth.decorator'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'

@Controller('mail')
export class MailController {
  constructor(
    private readonly sharedMailService: SharedMailService,
    private readonly mongoDBService: MongoDBService
  ) {}

  // @Cron('30 * * * * *')
  @Get()
  async sendMail() {
    const allSubscribers = await this.mongoDBService.getSubscribers().find({ deletedAt: null }).toArray()
    const allMails = allSubscribers.map((subscriber) => subscriber.email)
    await Promise.all([
      ...allMails.map((email) => {
        return this.sharedMailService.sendEmail(email)
      })
    ])
  }

  @Post('send-mail')
  @MessageRes('Send mail to user')
  @SkipCheckPermission()
  sendMailToUser(@ActiveUser() user: any) {
    return this.sharedMailService.sendEmailTest(user)
  }
}
