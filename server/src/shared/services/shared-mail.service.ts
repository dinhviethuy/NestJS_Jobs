import { MailerService } from '@nestjs-modules/mailer'
import { HttpException, Injectable, Logger } from '@nestjs/common'
import envConfig from 'src/shared/config'
import { MongoDBService } from './mongodb.service'
import { WithId } from 'mongodb'
import { Job } from 'src/routes/jobs/jobs.schema'

@Injectable()
export class SharedMailService {
  private readonly logger = new Logger(SharedMailService.name)

  constructor(
    private readonly mailService: MailerService,
    private readonly mongoDBService: MongoDBService
  ) {}

  private async getAllJobs() {
    const jobs = await this.mongoDBService.getJobs().find({ deletedAt: null }).toArray()
    return jobs
  }

  async findAllJobs(email: string) {
    const jobs = await this.getAllJobs()
    if (!jobs || jobs.length === 0) {
      this.logger.log('No jobs found')
      return
    }
    const subscribers = await this.mongoDBService.getSubscribers().findOne({ deletedAt: null, email })
    if (!subscribers) {
      return { name: '', jobs: [] }
    }
    const jobSuggest = jobs.filter((job) => job.skills?.some((skill) => subscribers.skills?.includes(skill)))
    const finalData = {
      name: subscribers?.name,
      jobs: jobSuggest.map((job) => {
        return {
          title: job.name,
          company: job.company?.name || '',
          salary: job.salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ',
          skills: job.skills || []
        }
      })
    }
    return finalData
  }

  async sendEmail(to: string) {
    try {
      const data = await this.findAllJobs(to)
      if (!data) {
        return
      }
      this.mailService.sendMail({
        to,
        from: envConfig.EMAIL_ADDRESS,
        subject: 'Welcome to Job Finder',
        template: 'job',
        context: {
          name: data.name,
          jobs: data.jobs
        }
      })
      this.logger.log(`Email sent to ${to}`)
    } catch (error) {
      throw new HttpException('Error sending email', 500)
    }
  }

  async sendEmailTest(user: any) {
    try {
      const jobsAll = await this.getAllJobs()
      const data = {
        name: user.name,
        jobs: jobsAll.map((job) => {
          return {
            title: job.name,
            company: job.company?.name || '',
            salary: job.salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ',
            skills: job.skills || []
          }
        })
      }
      this.mailService.sendMail({
        to: user.email,
        from: envConfig.EMAIL_ADDRESS,
        subject: 'Welcome to Job Finder',
        template: 'job',
        context: {
          name: data.name,
          jobs: data.jobs
        }
      })
      this.logger.log(`Email sent to ${user.email}`)
    } catch (error) {
      throw new HttpException('Error sending email', 500)
    }
  }
}
