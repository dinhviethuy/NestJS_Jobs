import { Injectable } from '@nestjs/common'
import { WithId } from 'mongodb'
import { User } from 'src/shared/schemas/share-user.schema'
import { MongoDBService } from 'src/shared/services/mongodb.service'
import { RegisterBodyType } from './auth.model'
import { HashingService } from 'src/shared/services/hashing.service'
import { RoleNameObject } from 'src/shared/constants/orther.constant'

@Injectable()
export class AuthRepo {
  constructor(
    private readonly mongoDBService: MongoDBService,
    private readonly hashingService: HashingService
  ) {}

  async register(data: RegisterBodyType): Promise<WithId<User> | null> {
    const hashPassword = await this.hashingService.hash(data.password)
    const userRole = await this.mongoDBService.getRoles().findOne({
      name: RoleNameObject.USER
    })
    const userId = await this.mongoDBService.getUsers().insertOne(
      new User({
        ...data,
        role: userRole?._id.toString() || '',
        password: hashPassword
      })
    )
    if (userId) {
      return this.mongoDBService.getUsers().findOne(
        {
          _id: userId.insertedId,
          deletedAt: null
        },
        {
          projection: {
            password: 0,
            refreshToken: 0
          }
        }
      )
    }
    return null
  }
}
