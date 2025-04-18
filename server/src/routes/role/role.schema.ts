import { ObjectId } from 'mongodb'
import { RoleModelType } from './role.model'

export class Role {
  _id?: ObjectId
  name: string
  description?: string
  isActive: boolean
  permissions: string[]

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
  constructor(companies: RoleModelType) {
    const now = new Date()
    this._id = companies._id
    this.name = companies.name
    this.description = companies.description || ''
    this.isActive = companies.isActive || true
    this.permissions = companies.permissions || []
    this.createdAt = companies.createdAt || now
    this.updatedAt = companies.updatedAt || now
    this.deletedAt = companies.deletedAt || null
    this.createdBy = companies.createdBy || null
    this.updatedBy = companies.updatedBy || null
    this.deletedBy = companies.deletedBy || null
  }
}
