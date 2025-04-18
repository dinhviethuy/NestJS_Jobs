import { ConflictException, Injectable, NotFoundException, Delete } from '@nestjs/common'
import { MongoDBService } from 'src/shared/services/mongodb.service'
import { CreateSubscribersBodyType, UpdateSubscribersBodyType } from './subscribers.model'
import { Subscriber } from './subscribers.schema'
import { UpdateResult, WithId } from 'mongodb'

@Injectable()
export class SubscribersRepo {
  constructor(private readonly mongoDBService: MongoDBService) {}

  async find({ email }: { email: string }): Promise<WithId<Subscriber> | null> {
    const subscriber = await this.mongoDBService.getSubscribers().findOne({
      email,
      deletedAt: null
    })
    if (!subscriber) {
      throw new NotFoundException('Subscriber not found')
    }
    return subscriber
  }

  async findSkills(email: string) {
    const tmp = await this.mongoDBService.getSubscribers().findOne({
      email,
      deletedAt: null
    })
    const skills = tmp?.skills || []
    return {
      skills
    }
  }

  async create({
    data,
    email
  }: {
    data: CreateSubscribersBodyType
    email: string
  }): Promise<WithId<Subscriber> | null> {
    const [existUser, existSubscriber] = await Promise.all([
      this.mongoDBService.getUsers().findOne({
        email,
        deletedAt: null
      }),
      this.mongoDBService.getSubscribers().findOne({
        email,
        deletedAt: null
      })
    ])
    if (!existUser) {
      throw new NotFoundException('User not found')
    }
    if (existSubscriber) {
      throw new ConflictException('Email already registered')
    }
    const subscriberId = await this.mongoDBService.getSubscribers().insertOne(
      new Subscriber({
        ...data,
        email
      })
    )
    if (!subscriberId) {
      throw new ConflictException('Error creating subscriber')
    }
    const subscriber = await this.mongoDBService.getSubscribers().findOne({
      _id: subscriberId,
      deletedAt: null
    })
    return subscriber
  }

  async update({ email, data }: { email: string; data: UpdateSubscribersBodyType }): Promise<UpdateResult<Subscriber>> {
    const existUser = await this.mongoDBService.getUsers().findOne({
      email,
      deletedAt: null
    })
    if (!existUser) {
      throw new NotFoundException('User not found')
    }
    return this.mongoDBService.getSubscribers().updateOne(
      {
        email,
        deletedAt: null
      },
      {
        $set: {
          ...data
        },
        $currentDate: {
          updatedAt: true
        }
      },
      {
        upsert: true
      }
    )
  }

  async delete({ email }: { email: string }): Promise<UpdateResult<Subscriber>> {
    const existSubscriber = await this.mongoDBService.getSubscribers().findOne({
      email,
      deletedAt: null
    })
    if (!existSubscriber) {
      throw new NotFoundException('Subscriber not found')
    }
    return this.mongoDBService.getSubscribers().updateOne(
      {
        email,
        deletedAt: null
      },
      {
        $set: {
          deletedAt: new Date()
        },
        $currentDate: {
          updatedAt: true
        }
      }
    )
  }
}
