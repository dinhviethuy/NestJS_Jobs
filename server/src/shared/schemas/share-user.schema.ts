import { ObjectId } from 'mongodb'
import { UserType } from 'src/shared/models/shared-user.model'

export class User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  age?: number | null
  refreshToken?: string | null
  role: string
  company?: {
    _id?: ObjectId
    name?: string
  } | null
  gender?: string | null
  address?: string | null
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

  constructor(data: UserType) {
    const now = new Date()
    this._id = data._id
    this.name = data.name
    this.email = data.email
    this.age = data.age || null
    this.role = data.role || 'USER'
    this.password = data.password
    this.createdAt = data.createdAt || now
    this.updatedAt = data.updatedAt || now
    this.deletedAt = data.deletedAt || null
    this.createdBy = data.createdBy || null
    this.updatedBy = data.updatedBy || null
    this.deletedBy = data.deletedBy || null
    this.refreshToken = data.refreshToken || null
    this.company = data.company || null
    this.address = data.address || null
    this.gender = data.gender || null
  }
}
