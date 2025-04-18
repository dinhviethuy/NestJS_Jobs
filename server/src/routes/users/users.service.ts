import { ConflictException, HttpException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateUserBodyType, PaginationType, UpdateUserBodyType } from './users.model'
import { UsersRepo } from './users.repo'
import { ShareUsersRepo } from 'src/shared/repositories/share-users.repo'
import { ObjectId } from 'mongodb'
import { FieldUserType } from 'src/shared/decorators/active-user.decorator'

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly shareUsersRepo: ShareUsersRepo
  ) {}

  async find(pagination: PaginationType) {
    const result = await this.usersRepo.find(pagination)
    return result
  }

  async findById(userId: string) {
    const user = await this.usersRepo.findById(userId)
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return user
  }

  async create(data: CreateUserBodyType, user: FieldUserType) {
    try {
      const isEmailAvailable = await this.existingEmail(data.email)
      if (isEmailAvailable) {
        throw new ConflictException('Email already exists')
      }
      const userCreate = await this.usersRepo.create(data, user)
      return userCreate
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new ConflictException('Email already exists')
    }
  }

  async update({ data, userId, user }: { data: UpdateUserBodyType; userId: string | ObjectId; user: FieldUserType }) {
    try {
      if (data.email) {
        const user = await this.existingEmail(data.email)
        if (user && userId.toString() !== user._id.toString() && user.email === data.email) {
          throw new ConflictException('Email already exists')
        }
      }
      const userUpdate = await this.usersRepo.update({
        data,
        userId,
        user
      })
      if (!userUpdate) {
        throw new NotFoundException('User not found')
      }
      return userUpdate
    } catch (error) {
      throw error
    }
  }

  async delete(userId: string, user: FieldUserType) {
    const userDelete = await this.usersRepo.delete(userId, user)
    if (!userDelete) {
      throw new NotFoundException('User not found')
    }
    return {
      ...userDelete,
      deleted: userDelete.matchedCount
    }
  }

  private async existingEmail(email: string) {
    const user = await this.shareUsersRepo.findByEmail(email)
    return user
  }
}
