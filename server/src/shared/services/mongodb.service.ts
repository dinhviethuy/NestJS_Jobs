import { Injectable, OnModuleInit } from '@nestjs/common'
import { Collection, Db, MongoClient } from 'mongodb'
import envConfig from 'src/shared/config'
import { User } from 'src/shared/schemas/share-user.schema'
import { Company } from 'src/routes/companies/companies.schema'
import { Job } from 'src/routes/jobs/jobs.schema'
import { Resume } from 'src/routes/resumes/resumes.schema'
import { Permission } from 'src/routes/permisson/permission.schema'
import { Role } from 'src/routes/role/role.schema'
import { Subscriber } from 'src/routes/subscribers/subscribers.schema'

@Injectable()
export class MongoDBService implements OnModuleInit {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(envConfig.MONGODB_URI)
    this.db = this.client.db(envConfig.MONGODB_DB_NAME)
  }
  onModuleInit() {
    this.client
      .connect()
      .then(() => {
        console.log('MongoDB connected')
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err)
      })
  }

  getUsers(): Collection<User> {
    return this.db.collection(envConfig.USERS_COLLECTION)
  }
  getCompanies(): Collection<Company> {
    return this.db.collection(envConfig.COMPANIES_COLLECTION)
  }

  getJobs(): Collection<Job> {
    return this.db.collection(envConfig.JOBS_COLLECTION)
  }

  getResumes(): Collection<Resume> {
    return this.db.collection(envConfig.RESUMES_COLLECTION)
  }

  getPermissions(): Collection<Permission> {
    return this.db.collection(envConfig.PERMISSIONS_COLLECTION)
  }

  getRoles(): Collection<Role> {
    return this.db.collection(envConfig.ROLES_COLLECTION)
  }

  getSubscribers(): Collection<Subscriber> {
    return this.db.collection(envConfig.SUBSCRIBERS_COLLECTION)
  }
}
