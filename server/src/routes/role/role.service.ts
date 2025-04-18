import { HttpException, Injectable, NotFoundException } from '@nestjs/common'
import { RoleRepo } from './role.repo'
import { CreateRoleType, PaginationType } from './role.model'
import { ObjectId } from 'mongodb'
import { UpdateRoleDTO } from './role.dto'

@Injectable()
export class RoleService {
  constructor(private readonly roleRepo: RoleRepo) {}

  async find(pagination: PaginationType) {
    const result = await this.roleRepo.find(pagination)
    return result
  }

  async findById(idRole: string | ObjectId) {
    const role = await this.roleRepo.findById(idRole)
    if (!role) {
      throw new NotFoundException('Role không tồn tại')
    }
    return role
  }

  async create({ data, createdById, email }: { data: CreateRoleType; createdById: ObjectId | string; email: string }) {
    try {
      const result = await this.roleRepo.create({
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
    idRole
  }: {
    data: UpdateRoleDTO
    updatedById: ObjectId | string
    email: string
    idRole: string | ObjectId
  }) {
    try {
      const company = await this.roleRepo.update({
        data,
        email,
        updatedById,
        idRole
      })
      if (!company) {
        throw new NotFoundException('Role không tồn tại')
      }
      return company
    } catch (error) {
      throw error
    }
  }

  async delete({
    idRole,
    deletedById,
    email
  }: {
    idRole: string | ObjectId
    deletedById: ObjectId | string
    email: string
  }) {
    try {
      const company = await this.roleRepo.delete({
        idRole,
        deletedById,
        email
      })
      if (!company) {
        throw new NotFoundException('Role không tồn tại')
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
