import { HttpException, Injectable, NotFoundException } from '@nestjs/common'
import { PermissionRepo } from './permission.repo'
import { CreatePermissionType, PaginationType } from './permission.model'
import { ObjectId } from 'mongodb'
import { UpdatePermissionDTO } from './permission.dto'

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepo: PermissionRepo) {}

  async find(pagination: PaginationType) {
    const result = await this.permissionRepo.find(pagination)
    return result
  }

  async findById(idPermisson: string | ObjectId) {
    const permisson = await this.permissionRepo.findById(idPermisson)
    if (!permisson) {
      throw new NotFoundException('Permission không tồn tại')
    }
    return permisson
  }

  async create({
    data,
    createdById,
    email
  }: {
    data: CreatePermissionType
    createdById: ObjectId | string
    email: string
  }) {
    try {
      const result = await this.permissionRepo.create({
        data,
        createdById,
        email
      })
      return result
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error, 500)
    }
  }

  async update({
    data,
    email,
    updatedById,
    idPermission
  }: {
    data: UpdatePermissionDTO
    updatedById: ObjectId | string
    email: string
    idPermission: string | ObjectId
  }) {
    try {
      const company = await this.permissionRepo.update({
        data,
        email,
        updatedById,
        idPermission
      })
      if (!company) {
        throw new NotFoundException('Công ty không tồn tại')
      }
      return company
    } catch (error) {
      throw error
    }
  }

  async delete({
    idPermission,
    deletedById,
    email
  }: {
    idPermission: string | ObjectId
    deletedById: ObjectId | string
    email: string
  }) {
    try {
      const company = await this.permissionRepo.delete({
        idPermission,
        deletedById,
        email
      })
      if (!company) {
        throw new NotFoundException('Công ty không tồn tại')
      }
      return {
        ...company,
        deleted: company.matchedCount
      }
    } catch (error) {
      throw error
    }
  }
}
