import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateUserBodyType, PaginationType, UpdateUserBodyType } from './users.model'
import { HashingService } from 'src/shared/services/hashing.service'
import { MongoDBService } from 'src/shared/services/mongodb.service'
import { ObjectId, UpdateResult, WithId } from 'mongodb'
import { User } from 'src/shared/schemas/share-user.schema'
import { FieldUserType } from 'src/shared/decorators/active-user.decorator'
import aqp from 'api-query-params'
import { RoleNameObject } from 'src/shared/constants/orther.constant'

@Injectable()
export class UsersRepo {
  constructor(
    private readonly hashingService: HashingService,
    private readonly mongodbService: MongoDBService
  ) {}

  async find(pagination: PaginationType) {
    const { current, pageSize, index, ...rest } = pagination
    const { filter, sort } = aqp(rest)
    const skip = (current - 1) * pageSize
    if (index !== undefined && index !== null) {
      const result = await this.mongodbService
        .getUsers()
        .find({ deletedAt: null, ...filter })
        .skip(Number(index) - 1)
        .sort(sort as any)
        .limit(1)
        .toArray()
      return {
        meta: {
          current: 1,
          total: result.length,
          pageSize: 1,
          pages: 1
        },
        result
      }
    }
    const [users, total] = await Promise.all([
      this.mongodbService
        .getUsers()
        .aggregate([
          {
            $match: {
              deletedAt: null,
              ...filter
            }
          },
          {
            $addFields: {
              roleObject: { $toObjectId: '$role' }
            }
          },
          {
            $lookup: {
              from: 'roles',
              localField: 'roleObject',
              foreignField: '_id',
              as: 'roleDetails'
            }
          },
          {
            $unwind: '$roleDetails'
          },
          {
            $addFields: {
              role: {
                _id: '$roleDetails._id',
                name: '$roleDetails.name'
              }
            }
          },
          {
            $project: {
              roleDetails: 0
            }
          },
          { $skip: skip > 0 ? skip - 1 : 0 },
          { $limit: pageSize },
          { $sort: sort || { createdAt: -1 } }
        ])
        .toArray(),
      this.mongodbService.getUsers().countDocuments({
        deletedAt: null,
        ...filter
      })
    ])
    return {
      meta: {
        current,
        total,
        pageSize: users.length,
        pages: Math.ceil(total / pageSize)
      },
      result: users
    }
  }

  async findById(userId: string) {
    return this.mongodbService
      .getUsers()
      .aggregate([
        {
          $match: {
            _id: new ObjectId(userId),
            deletedAt: null
          }
        },
        {
          $addFields: {
            roleObject: { $toObjectId: '$role' }
          }
        },
        {
          $lookup: {
            from: 'roles',
            localField: 'roleObject',
            foreignField: '_id',
            as: 'roleDetails'
          }
        },
        {
          $unwind: '$roleDetails'
        },
        {
          $addFields: {
            role: {
              _id: '$roleDetails._id',
              name: '$roleDetails.name'
            }
          }
        },
        {
          $project: {
            roleDetails: 0
          }
        }
      ])
      .next()
  }

  async create(data: CreateUserBodyType, user: FieldUserType): Promise<WithId<User> | null> {
    const hashedPassword = await this.hashingService.hash(data.password)
    if (data.company?._id) {
      const company = await this.mongodbService.getCompanies().findOne({
        _id: new ObjectId(data.company._id),
        deletedAt: null
      })
      if (!company) {
        throw new NotFoundException('Company not found')
      }
    }
    const userId = await this.mongodbService.getUsers().insertOne(
      new User({
        ...data,
        createdBy: {
          _id: user._id,
          email: user.email
        },
        password: hashedPassword
      })
    )
    if (userId) {
      return this.mongodbService.getUsers().findOne(
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

  async update({
    data,
    userId,
    user
  }: {
    data: UpdateUserBodyType
    userId: string | ObjectId
    user: FieldUserType
  }): Promise<UpdateResult<User> | null> {
    if (data.company?._id) {
      const company = await this.mongodbService.getCompanies().findOne({
        _id: new ObjectId(data.company._id),
        deletedAt: null
      })
      if (!company) {
        throw new NotFoundException('Company not found')
      }
    }
    if (data.company && Object.keys(data.company).length === 0) {
      delete data.company
    }
    return this.mongodbService.getUsers().updateOne(
      {
        _id: new ObjectId(userId),
        deletedAt: null
      },
      {
        $set: {
          ...data,
          updatedBy: {
            _id: user._id,
            email: user.email
          }
        },
        $currentDate: {
          updatedAt: true
        }
      }
    )
  }

  async delete(userId: string, user: FieldUserType): Promise<UpdateResult<User> | null> {
    const admin = await this.mongodbService
      .getUsers()
      .aggregate([
        {
          $addFields: {
            roleObject: { $toObjectId: '$role' }
          }
        },
        {
          $lookup: {
            from: 'roles',
            localField: 'roleObject',
            foreignField: '_id',
            as: 'roleDetails'
          }
        },
        {
          $unwind: '$roleDetails'
        },
        {
          $addFields: {
            'role.name': '$roleDetails.name'
          }
        },
        {
          $project: {
            role: 1
          }
        }
      ])
      .next()
    const me = await this.mongodbService.getUsers().findOne({
      _id: new ObjectId(user._id),
      deletedAt: null
    })
    if (userId === me?._id.toString()) {
      throw new BadRequestException('Không thể xóa chính mình')
    }
    if (RoleNameObject.ADMIN === admin?.role.name) {
      throw new BadRequestException('Không thể xóa admin')
    }
    return this.mongodbService.getUsers().updateOne(
      {
        _id: new ObjectId(userId),
        deletedAt: null
      },
      {
        $set: {
          deletedAt: new Date(),
          deletedBy: {
            _id: user._id,
            email: user.email
          }
        }
      }
    )
  }
}
