import { ObjectId } from 'mongodb'
import { PermissionModelType } from './permission.model'

export class Permission {
  _id?: ObjectId
  name: string
  method: string
  module: string
  apiPath: string

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
  constructor(companies: PermissionModelType) {
    const now = new Date()
    this._id = companies._id
    this.name = companies.name
    this.apiPath = companies.apiPath
    this.method = companies.method || ''
    this.module = companies.module || ''
    this.createdAt = companies.createdAt || now
    this.updatedAt = companies.updatedAt || now
    this.deletedAt = companies.deletedAt || null
    this.createdBy = companies.createdBy || null
    this.updatedBy = companies.updatedBy || null
    this.deletedBy = companies.deletedBy || null
  }
}
