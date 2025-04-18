import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException
} from '@nestjs/common'
import { ObjectId, WithId } from 'mongodb'
import { ShareUsersRepo } from 'src/shared/repositories/share-users.repo'
import { User } from 'src/shared/schemas/share-user.schema'
import { HashingService } from 'src/shared/services/hashing.service'
import { TokenService } from 'src/shared/services/token.service'
import { LoginResponseType, RefreshTokenResType, RegisterBodyType } from './auth.model'
import { AuthRepo } from './auth.repo'
import { MongoDBService } from 'src/shared/services/mongodb.service'
import { Response } from 'express'
import envConfig from 'src/shared/config'
import ms from 'ms'
import { addMilliseconds } from 'date-fns'

@Injectable()
export class AuthService {
  constructor(
    private readonly shareUserRepo: ShareUsersRepo,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly authRepo: AuthRepo,
    private readonly mongoDBService: MongoDBService
  ) {}
  async validateUser(username: string, password: string): Promise<WithId<User>> {
    const user = await this.shareUserRepo.findByEmail(username)
    if (!user) {
      throw new NotFoundException('User not found')
    }
    const isValidPassword = await this.hashingService.compare(password, user.password)
    if (!isValidPassword) {
      throw new UnprocessableEntityException('Invalid password')
    }
    return user
  }

  async login({
    email,
    userId,
    name,
    role,
    iss,
    sub,
    res
  }: {
    userId: string | ObjectId
    email: string
    name: string
    role: string
    sub?: string
    iss?: string
    res: Response
  }): Promise<LoginResponseType> {
    const [access_token, refresh_token] = await Promise.all([
      this.tokenService.signAccessToken({ _id: userId, email, name, role, iss, sub }),
      this.tokenService.signRefreshToken({ _id: userId, email, name, role, iss, sub })
    ])
    await this.mongoDBService.getUsers().updateOne(
      {
        _id: new ObjectId(userId as string)
      },
      {
        $set: {
          refreshToken: refresh_token
        }
      }
    )
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      expires: addMilliseconds(new Date(), Number(ms(envConfig.REFRESH_TOKEN_EXPIIRES_IN as any)))
    })
    const userPermission = await this.mongoDBService
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
            as: 'role'
          }
        },
        {
          $unwind: '$role'
        },
        {
          // convert permission ids to ObjectId[] nếu là string
          $addFields: {
            permissionObjectIds: {
              $map: {
                input: '$role.permissions',
                as: 'permId',
                in: { $toObjectId: '$$permId' }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'permissions',
            localField: 'permissionObjectIds',
            foreignField: '_id',
            as: 'rolePermissions'
          }
        },
        {
          $project: {
            _id: 1,
            email: 1,
            name: 1,
            role: {
              _id: '$role._id',
              name: '$role.name'
            },
            permissions: {
              $map: {
                input: '$rolePermissions',
                as: 'perm',
                in: {
                  _id: '$$perm._id',
                  name: '$$perm.name',
                  apiPath: '$$perm.apiPath',
                  method: '$$perm.method',
                  module: '$$perm.module'
                }
              }
            }
          }
        }
      ])
      .next()
    return {
      access_token,
      user: {
        _id: userId,
        email,
        name,
        role: userPermission?.role,
        permissions: userPermission?.permissions
      }
    }
  }

  async register(data: RegisterBodyType) {
    try {
      const existingUser = await this.shareUserRepo.findByEmail(data.email)
      if (existingUser) {
        throw new ConflictException('Email already exists')
      }
      const user = await this.authRepo.register(data)
      if (!user) {
        throw new ConflictException('User already exists')
      }
      return user
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new BadRequestException('Invalid data')
    }
  }

  async refreshToken(token: string, res: Response): Promise<RefreshTokenResType> {
    try {
      const { _id, email, exp, name, role, iss, sub } = await this.tokenService.verifyRefreshToken(token)
      if (exp < Date.now() / 1000) {
        throw new BadRequestException('Refresh token expired')
      }
      const user = await this.shareUserRepo.findByEmail(email)
      if (!user) {
        throw new BadRequestException('User not found')
      }
      if (user.refreshToken !== token) {
        throw new BadRequestException('Invalid refresh token')
      }
      const [access_token, new_refresh_token] = await Promise.all([
        this.tokenService.signAccessToken({ _id, email, name, role, iss, sub }),
        this.tokenService.signRefreshToken({ _id, email, name, role: user.role, iss, sub })
      ])
      await this.mongoDBService.getUsers().updateOne(
        {
          _id: new ObjectId(_id as string)
        },
        {
          $set: {
            refreshToken: new_refresh_token
          },
          $currentDate: {
            updatedAt: true
          }
        }
      )
      res.cookie('refresh_token', new_refresh_token, {
        httpOnly: true,
        expires: addMilliseconds(new Date(), Number(ms(envConfig.REFRESH_TOKEN_EXPIIRES_IN as any)))
      })
      const userPermission = await this.mongoDBService
        .getUsers()
        .aggregate([
          {
            $match: {
              _id: user._id,
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
              as: 'role'
            }
          },
          {
            $unwind: '$role'
          },
          {
            // convert permission ids to ObjectId[] nếu là string
            $addFields: {
              permissionObjectIds: {
                $map: {
                  input: '$role.permissions',
                  as: 'permId',
                  in: { $toObjectId: '$$permId' }
                }
              }
            }
          },
          {
            $lookup: {
              from: 'permissions',
              localField: 'permissionObjectIds',
              foreignField: '_id',
              as: 'rolePermissions'
            }
          },
          {
            $project: {
              _id: 1,
              email: 1,
              name: 1,
              role: {
                _id: '$role._id',
                name: '$role.name'
              },
              permissions: {
                $map: {
                  input: '$rolePermissions',
                  as: 'perm',
                  in: {
                    _id: '$$perm._id',
                    name: '$$perm.name',
                    apiPath: '$$perm.apiPath',
                    method: '$$perm.method',
                    module: '$$perm.module'
                  }
                }
              }
            }
          }
        ])
        .next()
      return {
        access_token,
        user: {
          _id,
          email,
          name,
          role: userPermission?.role,
          permissions: userPermission?.permissions
        }
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new BadRequestException('Invalid refresh token')
    }
  }

  async logout(token: string, res: Response) {
    try {
      if (!token) {
        throw new UnauthorizedException('Invalid refresh token')
      }
      const { _id, email, exp } = await this.tokenService.verifyRefreshToken(token)
      if (exp < Date.now() / 1000) {
        throw new UnauthorizedException('Invalid refresh token')
      }
      const user = await this.shareUserRepo.findByEmail(email)
      if (!user) {
        throw new NotFoundException('User not found')
      }
      if (token !== user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token')
      }
      await this.mongoDBService.getUsers().updateOne(
        {
          _id: new ObjectId(_id as string),
          deletedAt: null
        },
        {
          $set: {
            refreshToken: null
          },
          $currentDate: {
            updatedAt: true
          }
        }
      )
      res.clearCookie('refresh_token')
      return {
        message: 'Logout successfully'
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async account(userId: string | ObjectId) {
    const user = await this.mongoDBService
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
            as: 'role'
          }
        },
        {
          $unwind: '$role'
        },
        {
          // convert permission ids to ObjectId[] nếu là string
          $addFields: {
            permissionObjectIds: {
              $map: {
                input: '$role.permissions',
                as: 'permId',
                in: { $toObjectId: '$$permId' }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'permissions',
            localField: 'permissionObjectIds',
            foreignField: '_id',
            as: 'rolePermissions'
          }
        },
        {
          $project: {
            _id: 1,
            email: 1,
            name: 1,
            role: {
              _id: '$role._id',
              name: '$role.name'
            },
            permissions: {
              $map: {
                input: '$rolePermissions',
                as: 'perm',
                in: {
                  _id: '$$perm._id',
                  name: '$$perm.name',
                  apiPath: '$$perm.apiPath',
                  method: '$$perm.method',
                  module: '$$perm.module'
                }
              }
            }
          }
        }
      ])
      .next()
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return {
      user
    }
  }
}
