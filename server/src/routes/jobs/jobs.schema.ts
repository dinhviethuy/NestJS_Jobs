import { ObjectId } from 'mongodb'
import { JobType } from './jobs.model'

export class Job {
  _id?: ObjectId
  location?: string
  name: string
  skills?: string[]
  salary: number
  quantity: number
  level: string
  description: string
  startDate?: Date | null
  endDate?: Date | null
  company?: {
    _id: ObjectId
    name: string
    logo: string
  } | null
  createdAt?: Date | null
  updatedAt?: Date | null
  deletedAt?: Date | null
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

  isActive: boolean

  constructor(job: JobType) {
    const now = new Date()
    this._id = job._id
    this.location = job.location || ''
    this.name = job.name
    this.skills = job.skills ?? []
    this.salary = job.salary
    this.quantity = job.quantity
    this.level = job.level
    this.isActive = job.isActive
    this.description = job.description || ''
    this.startDate = job.startDate
    this.endDate = job.endDate
    this.company = job.company
    this.createdAt = job.createdAt || now
    this.updatedAt = job.updatedAt || now
    this.deletedAt = job.deletedAt || null
    this.createdBy = job.createdBy || null
    this.updatedBy = job.updatedBy || null
    this.deletedBy = job.deletedBy || null
  }
}
