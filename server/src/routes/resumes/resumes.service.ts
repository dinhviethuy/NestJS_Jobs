import { ForbiddenException, HttpException, Injectable, NotFoundException } from '@nestjs/common'
import { ResumeRepo } from './resumes.repo'
import { CreateResumeBodyType, PaginationType, UpdateResumeBodyType } from './resumes.model'
import { ObjectId } from 'mongodb'

@Injectable()
export class ResumesService {
  constructor(private readonly resumeRepo: ResumeRepo) {}

  private validatePermissions(roleRequest: string) {
    if (roleRequest.toLocaleLowerCase() === 'user') {
      throw new ForbiddenException('You do not have permission to perform this action')
    }
  }

  async find(pagination: PaginationType, role: string) {
    this.validatePermissions(role)
    const result = await this.resumeRepo.find(pagination)
    return result
  }

  async findById({ resumeId, role }: { resumeId: string | ObjectId; role: string }) {
    try {
      this.validatePermissions(role)
      const resume = await this.resumeRepo.findById(resumeId)
      if (!resume) {
        throw new NotFoundException(`Resume with id ${resumeId.toString()} not found`)
      }
      return resume
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        {
          status: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch resume'
        },
        500
      )
    }
  }

  async findByUserId({ userId }: { userId: ObjectId }) {
    try {
      const resume = await this.resumeRepo.findByUserId(userId)
      if (!resume) {
        throw new NotFoundException(`Resume with user id ${userId.toString()} not found`)
      }
      return resume
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        {
          status: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch resume'
        },
        500
      )
    }
  }

  async create({ data, userId, email }: { data: CreateResumeBodyType; userId: ObjectId; email: string }) {
    try {
      const resume = await this.resumeRepo.create({ data, userId, email })
      return resume
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        {
          status: 500,
          error: 'Internal Server Error',
          message: 'Failed to create resume'
        },
        500
      )
    }
  }

  async update({
    data,
    email,
    resumeId,
    updatedById,
    role
  }: {
    resumeId: string | ObjectId
    data: UpdateResumeBodyType
    updatedById: string | ObjectId
    email: string
    role: string
  }) {
    try {
      this.validatePermissions(role)
      const resume = await this.resumeRepo.update({ data, resumeId, updatedById, email })
      return resume
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        {
          status: 500,
          error: 'Internal Server Error',
          message: 'Failed to update resume'
        },
        500
      )
    }
  }

  async delete({
    resumeId,
    deletedById,
    email,
    role
  }: {
    resumeId: string | ObjectId
    deletedById: string | ObjectId
    email: string
    role: string
  }) {
    try {
      this.validatePermissions(role)
      const resume = await this.resumeRepo.delete({ resumeId, deletedById, email })
      if (!resume) {
        throw new NotFoundException(`Resume with id ${resumeId.toString()} not found`)
      }
      return {
        ...resume,
        deleted: resume.matchedCount
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        {
          status: 500,
          error: 'Internal Server Error',
          message: 'Failed to delete resume'
        },
        500
      )
    }
  }
}
