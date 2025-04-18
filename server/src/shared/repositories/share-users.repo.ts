import { Injectable } from '@nestjs/common'
import { WithId } from 'mongodb'
import { MongoDBService } from 'src/shared/services/mongodb.service'
import { User } from 'src/shared/schemas/share-user.schema'

@Injectable()
export class ShareUsersRepo {
  constructor(private readonly mongoDBService: MongoDBService) {}

  findByEmail(email: string): Promise<WithId<User> | null> {
    return this.mongoDBService.getUsers().findOne({
      email,
      deletedAt: null
    })
  }
}
