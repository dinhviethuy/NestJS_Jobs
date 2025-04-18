import { ObjectId } from 'mongodb'
import { SubscribersModelType } from './subscribers.model'

export class Subscriber {
  _id?: ObjectId
  name: string
  email: string
  skills: string[]
  createdAt?: Date | null
  updatedAt?: Date | null
  deletedAt?: Date | null
  constructor(subscriber: SubscribersModelType) {
    const now = new Date()
    this._id = subscriber._id
    this.name = subscriber.name
    this.email = subscriber.email
    this.skills = subscriber.skills
    this.createdAt = subscriber.createdAt || now
    this.updatedAt = subscriber.updatedAt || now
    this.deletedAt = subscriber.deletedAt || now
  }
}
