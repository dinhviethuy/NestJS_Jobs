import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SharedModule } from './shared/shared.module'
import { UsersModule } from './routes/users/users.module'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import CustomValidatorPipe from './shared/pipes/custom-zod-validation.pipe'
import { HttpExceptionFilter } from './shared/filter/http-exception.filter'
import { AuthModule } from './routes/auth/auth.module'
import { CompaniesModule } from './routes/companies/companies.module'
import { CustomZodSerializerInterceptor } from './shared/interceptors/custom-zod-serializer.interceptor'
import { JobsModule } from './routes/jobs/jobs.module'
import { FilesModule } from './routes/files/files.module'
import { ResumesModule } from './routes/resumes/resumes.module'
import { PermissionModule } from './routes/permisson/permission.module'
import { RoleModule } from './routes/role/role.module'
import { SubscribersModule } from './routes/subscribers/subscribers.module'
import { MailModule } from './routes/mail/mail.module'

@Module({
  imports: [
    SharedModule,
    UsersModule,
    AuthModule,
    CompaniesModule,
    JobsModule,
    FilesModule,
    ResumesModule,
    PermissionModule,
    RoleModule,
    SubscribersModule,
    MailModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: CustomValidatorPipe
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CustomZodSerializerInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    }
  ]
})
export class AppModule {}
