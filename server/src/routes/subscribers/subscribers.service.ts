import { HttpException, Injectable, NotFoundException } from '@nestjs/common'
import { SubscribersRepo } from './subscribers.repo'
import { CreateSubscribersBodyType, UpdateSubscribersBodyType } from './subscribers.model'

@Injectable()
export class SubscribersService {
  constructor(private readonly subscribersRepo: SubscribersRepo) {}

  async find({ email }: { email: string }) {
    const subscriber = await this.subscribersRepo.find({ email })
    if (!subscriber) {
      throw new NotFoundException('Subscriber not found')
    }
    return subscriber
  }

  async findSkills(email: string) {
    try {
      const skills = await this.subscribersRepo.findSkills(email)
      return skills
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException('Error fetching skills', 500)
    }
  }

  async create({ data, email }: { data: CreateSubscribersBodyType; email: string }) {
    try {
      const subscriber = await this.subscribersRepo.create({ data, email })
      return subscriber
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException('Error creating subscriber', 500)
    }
  }

  async update({ data, email }: { data: UpdateSubscribersBodyType; email: string }) {
    try {
      const subscriber = await this.subscribersRepo.update({ data, email })
      return subscriber
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException('Error updating subscriber', 500)
    }
  }

  async delete({ email }: { email: string }) {
    try {
      const subscriber = await this.subscribersRepo.delete({ email })
      return {
        ...subscriber,
        deleted: subscriber.matchedCount
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException('Error deleting subscriber', 500)
    }
  }
}
