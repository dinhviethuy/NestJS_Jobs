import { ObjectId } from 'mongodb'
import { CompaniesModelType } from './companies.model'

export class Company {
  _id?: ObjectId
  name: string
  description: string
  address: string
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
  logo: string
  constructor(companies: CompaniesModelType) {
    const now = new Date()
    this._id = companies._id
    this.name = companies.name
    this.description = companies.description
    this.address = companies.address
    this.createdAt = companies.createdAt || now
    this.updatedAt = companies.updatedAt || now
    this.logo = companies.logo || ''
    this.deletedAt = companies.deletedAt || null
    this.createdBy = companies.createdBy || null
    this.updatedBy = companies.updatedBy || null
    this.deletedBy = companies.deletedBy || null
  }
}
