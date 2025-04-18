import { ObjectId } from 'mongodb'
import { ResumeType } from './resumes.model'
import { ResumeStatus, ResumeStatusType } from 'src/shared/constants/orther.constant'

export class Resume {
  _id?: ObjectId
  url: string
  userId: ObjectId
  companyId: ObjectId
  jobId: ObjectId
  status: ResumeStatusType
  email: string
  createdAt?: Date | null
  updatedAt?: Date | null
  deletedAt?: Date | null
  history: {
    status: string
    updatedAt: Date
    updatedBy: {
      _id: ObjectId
      email: string
    }
  }[]
  createdBy?: {
    _id: ObjectId
    email: string
  } | null
  updatedBy?: {
    _id: ObjectId
    email: string
  } | null
  deletedBy?: {
    _id: ObjectId
    email: string
  } | null

  constructor(resume: ResumeType) {
    const now = new Date()
    this._id = resume._id
    this.url = resume.url
    this.email = resume.email
    this.userId = resume.userId
    this.status = resume.status || ResumeStatus.PENDING
    this.companyId = resume.companyId
    this.jobId = resume.jobId
    this.history = resume.history || []
    this.createdBy = resume.createdBy || null
    this.updatedBy = resume.updatedBy || null
    this.deletedBy = resume.deletedBy || null
    this.createdAt = resume.createdAt || now
    this.updatedAt = resume.updatedAt || now
    this.deletedAt = resume.deletedAt || null
  }
}
