import { HttpException, Injectable, NotFoundException } from '@nestjs/common'
import { JobsRepo } from './jobs.repo'
import { CreateJobBodyType, PaginationType, UpdateJobBodyType } from './jobs.model'
import { ObjectId } from 'mongodb'

@Injectable()
export class JobsService {
  constructor(private readonly jobsRepo: JobsRepo) {}

  async find(pagination: PaginationType, user?) {
    const result = await this.jobsRepo.find(pagination)
    return result
  }

  async findById({ jobId }: { jobId: string | ObjectId }) {
    try {
      const job = await this.jobsRepo.findById({ jobId })
      if (!job) {
        throw new NotFoundException(`Job with id ${jobId.toString()} not found`)
      }
      return job
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        {
          status: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch job'
        },
        500
      )
    }
  }

  async create({
    data,
    createdById,
    email
  }: {
    data: CreateJobBodyType
    createdById: string | ObjectId
    email: string
  }) {
    try {
      const job = await this.jobsRepo.create({ data, createdById, email })
      return job
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        {
          status: 500,
          error: 'Internal Server Error',
          message: 'Failed to create job'
        },
        500
      )
    }
  }

  async update({
    data,
    email,
    jobId,
    updatedById
  }: {
    jobId: string | ObjectId
    data: UpdateJobBodyType
    updatedById: string | ObjectId
    email: string
  }) {
    try {
      const job = await this.jobsRepo.update({ data, jobId, updatedById, email })
      return job
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        {
          status: 500,
          error: 'Internal Server Error',
          message: 'Failed to update job'
        },
        500
      )
    }
  }

  async delete({
    jobId,
    deletedById,
    email
  }: {
    jobId: string | ObjectId
    deletedById: string | ObjectId
    email: string
  }) {
    try {
      const job = await this.jobsRepo.delete({ jobId, deletedById, email })
      if (!job) {
        throw new NotFoundException(`Job with id ${jobId.toString()} not found`)
      }
      return {
        ...job,
        deleted: job.matchedCount
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        {
          status: 500,
          error: 'Internal Server Error',
          message: 'Failed to delete job'
        },
        500
      )
    }
  }
}
