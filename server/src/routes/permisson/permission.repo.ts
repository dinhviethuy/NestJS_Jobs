import { ConflictException, Injectable } from '@nestjs/common'
import { MongoDBService } from 'src/shared/services/mongodb.service'
import { CreatePermissionType, PaginationResType, PaginationType, UpdatePermissionType } from './permission.model'
import aqp from 'api-query-params'
import { ObjectId, UpdateResult, WithId } from 'mongodb'
import { Permission } from './permission.schema'

@Injectable()
export class PermissionRepo {
  constructor(private readonly mongoDbService: MongoDBService) {}

  private async checkPermissionExist({
    apiPath,
    method,
    permissionId
  }: {
    apiPath?: string
    method?: string
    permissionId?: string
  }): Promise<boolean> {
    const permisson = await this.mongoDbService.getPermissions().findOne({
      _id: { $ne: new ObjectId(permissionId) },
      deletedAt: null,
      apiPath,
      method
    })
    if (!permisson) {
      return true
    }
    throw new ConflictException(`Permission ${method} ${apiPath} already exists`)
  }

  async find(pagination: PaginationType): Promise<PaginationResType> {
    const { current, pageSize, index, ...rest } = pagination
    const { filter, sort } = aqp(rest)
    const skip = (current - 1) * pageSize
    if (index !== undefined && index !== null) {
      const result = await this.mongoDbService
        .getPermissions()
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

    const [permissons, total] = await Promise.all([
      this.mongoDbService
        .getPermissions()
        .find({
          deletedAt: null,
          ...filter
        })
        .skip(skip)
        .limit(pageSize)
        .sort(sort as any)
        .toArray(),
      this.mongoDbService.getPermissions().countDocuments({
        deletedAt: null,
        ...filter
      })
    ])
    return {
      meta: {
        current,
        total,
        pageSize: permissons.length,
        pages: Math.ceil(total / pageSize)
      },
      result: permissons
    }
  }

  async findById(idPermisson: string | ObjectId): Promise<WithId<Permission> | null> {
    return this.mongoDbService.getPermissions().findOne({
      _id: new ObjectId(idPermisson),
      deletedAt: null
    })
  }

  async create({
    data,
    createdById,
    email
  }: {
    data: CreatePermissionType
    createdById: string | ObjectId
    email: string
  }): Promise<WithId<Permission> | null> {
    await this.checkPermissionExist({
      apiPath: data.apiPath,
      method: data.method
    })
    const permissonId = await this.mongoDbService.getPermissions().insertOne(
      new Permission({
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
    const permissonData = await this.mongoDbService.getPermissions().findOne({
      _id: permissonId.insertedId,
      deletedAt: null
    })
    return permissonData
  }

  async update({
    data,
    email,
    idPermission,
    updatedById
  }: {
    data: UpdatePermissionType
    updatedById: string | ObjectId
    email: string
    idPermission: string | ObjectId
  }): Promise<UpdateResult<Permission> | null> {
    await this.checkPermissionExist({
      apiPath: data.apiPath,
      method: data.method,
      permissionId: idPermission.toString()
    })
    return this.mongoDbService.getPermissions().updateOne(
      {
        _id: new ObjectId(idPermission),
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
    idPermission,
    email
  }: {
    idPermission: string | ObjectId
    deletedById: string | ObjectId
    email: string
  }): Promise<UpdateResult<Permission> | null> {
    return this.mongoDbService.getPermissions().updateOne(
      {
        _id: new ObjectId(idPermission),
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
