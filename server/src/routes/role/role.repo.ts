import { Injectable, NotFoundException } from '@nestjs/common'
import { MongoDBService } from 'src/shared/services/mongodb.service'
import { CreateRoleType, PaginationType, UpdateRoleType } from './role.model'
import aqp from 'api-query-params'
import { ObjectId, UpdateResult, WithId } from 'mongodb'
import { Role } from './role.schema'
import { RoleName, RoleNameObject } from 'src/shared/constants/orther.constant'

@Injectable()
export class RoleRepo {
  constructor(private readonly mongoDbService: MongoDBService) {}

  async find(pagination: PaginationType) {
    const { current, pageSize, index, ...rest } = pagination
    const { filter, sort } = aqp(rest)
    const skip = (current - 1) * pageSize
    if (index !== undefined && index !== null) {
      const result = await this.mongoDbService
        .getRoles()
        .aggregate([
          {
            $match: {
              deletedAt: null,
              ...filter
            }
          },
          {
            $addFields: {
              permissions: {
                $map: {
                  input: '$permissions',
                  as: 'permId',
                  in: { $toObjectId: '$$permId' }
                }
              }
            }
          },
          {
            $sort: sort || { createdAt: -1 }
          },
          {
            $skip: skip > 0 ? skip - 1 : 0
          },
          {
            $limit: 1
          },
          {
            $lookup: {
              from: 'permissions',
              localField: 'permissions',
              foreignField: '_id',
              as: 'permissions'
            }
          }
        ])
        .toArray()
      // .find({ deletedAt: null, ...filter })
      // .skip(Number(index) - 1)
      // .sort(sort as any)
      // .limit(1)
      // .toArray()
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

    const [roles, total] = await Promise.all([
      this.mongoDbService
        .getRoles()
        .aggregate([
          {
            $match: {
              deletedAt: null,
              ...filter
            }
          },
          {
            $addFields: {
              permissions: {
                $map: {
                  input: '$permissions',
                  as: 'permId',
                  in: { $toObjectId: '$$permId' }
                }
              }
            }
          },
          {
            $sort: sort || { createdAt: -1 }
          },
          {
            $skip: skip > 0 ? skip - 1 : 0
          },
          {
            $limit: pageSize
          },
          {
            $lookup: {
              from: 'permissions',
              localField: 'permissions',
              foreignField: '_id',
              as: 'permissions'
            }
          }
        ])
        .toArray(),
      // .find({
      //   deletedAt: null,
      //   ...filter
      // })
      // .skip(skip)
      // .limit(pageSize)
      // .sort(sort as any)
      // .toArray(),
      this.mongoDbService.getRoles().countDocuments({
        deletedAt: null,
        ...filter
      })
    ])
    return {
      meta: {
        current,
        total,
        pageSize: roles.length,
        pages: Math.ceil(total / pageSize)
      },
      result: roles
    }
  }

  async findById(idRole: string | ObjectId) {
    return this.mongoDbService
      .getRoles()
      .aggregate([
        {
          $match: {
            _id: new ObjectId(idRole),
            deletedAt: null
          }
        },
        {
          $addFields: {
            permissions: {
              $map: {
                input: '$permissions',
                as: 'permId',
                in: { $toObjectId: '$$permId' }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'permissions',
            localField: 'permissions',
            foreignField: '_id',
            as: 'permissions'
          }
        }
      ])
      .next()
  }

  async create({
    data,
    createdById,
    email
  }: {
    data: CreateRoleType
    createdById: string | ObjectId
    email: string
  }): Promise<WithId<Role> | null> {
    const permissonId = await this.mongoDbService.getRoles().insertOne(
      new Role({
        ...data,
        createdBy: {
          _id: new ObjectId(createdById),
          email
        }
      })
    )
    if (!permissonId) {
      return null
    }
    const permissonData = await this.mongoDbService.getRoles().findOne({
      _id: permissonId.insertedId,
      deletedAt: null
    })
    return permissonData
  }

  async update({
    data,
    email,
    idRole,
    updatedById
  }: {
    data: UpdateRoleType
    updatedById: string | ObjectId
    email: string
    idRole: string | ObjectId
  }): Promise<UpdateResult<Role> | null> {
    const role = await this.mongoDbService.getRoles().findOne({
      _id: new ObjectId(idRole),
      deletedAt: null
    })
    if (!role) {
      throw new NotFoundException('Vai trò không tồn tại')
    }
    if (RoleNameObject.ADMIN === role.name) {
      throw new NotFoundException(`${RoleNameObject.ADMIN} không thể sửa`)
    }
    return this.mongoDbService.getRoles().updateOne(
      {
        _id: new ObjectId(idRole),
        deletedAt: null
      },
      {
        $set: {
          ...data,
          updatedBy: {
            _id: new ObjectId(updatedById),
            email
          }
        },
        $currentDate: {
          updatedAt: true
        }
      }
    )
  }

  async delete({
    deletedById,
    idRole,
    email
  }: {
    idRole: string | ObjectId
    deletedById: string | ObjectId
    email: string
  }): Promise<UpdateResult<Role> | null> {
    const role = await this.mongoDbService.getRoles().findOne({
      _id: new ObjectId(idRole),
      deletedAt: null
    })
    if (!role) {
      throw new NotFoundException('Vai trò không tồn tại')
    }
    if (RoleName.includes(role.name)) {
      throw new NotFoundException('Vai trò này không thể xóa')
    }
    return this.mongoDbService.getRoles().updateOne(
      {
        _id: new ObjectId(idRole),
        deletedAt: null
      },
      {
        $set: {
          deletedAt: new Date(),
          deletedBy: {
            _id: new ObjectId(deletedById),
            email
          }
        }
      }
    )
  }
}
