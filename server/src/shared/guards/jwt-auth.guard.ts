import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { IS_PUBLIC_KEY, SKIP_AUTH_KEY } from 'src/shared/decorators/auth.decorator'
import { TokenService } from 'src/shared/services/token.service'
import { MongoDBService } from 'src/shared/services/mongodb.service'
import { ObjectId } from 'mongodb'
import { RoleNameObject } from '../constants/orther.constant'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
    private readonly mongoDBService: MongoDBService
  ) {
    super()
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isPublicValue = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass()
      ])
      const isSkipScheckValue = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
        context.getHandler(),
        context.getClass()
      ])
      if (isPublicValue) {
        return true
      }
      const request = context.switchToHttp().getRequest()
      const accessToken = request.headers['authorization']?.split(' ')[1]
      if (!accessToken) {
        throw new UnauthorizedException('Token not found')
      }
      if (isSkipScheckValue) {
        const canActivate = await super.canActivate(context)
        return Boolean(canActivate)
      }
      const { role } = await this.tokenService.verifyAccessToken(accessToken)
      const path = request.route.path
      const method = request.method
      const access = await this.mongoDBService
        .getRoles()
        .aggregate([
          {
            $match: {
              deletedAt: null,
              _id: new ObjectId(role)
            }
          },
          {
            $addFields: {
              permissionsObjectId: {
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
              localField: 'permissionsObjectId',
              foreignField: '_id',
              as: 'permissions'
            }
          },
          {
            $match: {
              'permissions.apiPath': path,
              'permissions.method': method
            }
          },
          {
            $project: {
              _id: 1,
              name: 1
            }
          }
        ])
        .toArray()
      if (access.length === 0) {
        throw new UnauthorizedException('Permission denied')
      }

      if (
        path?.startsWith('/api/v1/auth') ||
        path?.startsWith('/api/v1/subscribers') ||
        path?.startsWith('/api/v1/files/upload') ||
        (path === '/api/v1/resumes' && method === 'POST')
      ) {
        const canActivate = await super.canActivate(context)
        return Boolean(canActivate)
      }

      const METHOD = ['POST', 'PUT', 'DELETE', 'PATCH']
      if (METHOD.includes(method) && access[0].name !== RoleNameObject.ADMIN) {
        throw new BadRequestException(
          'Bạn chỉ có thể sử dụng phương thức GET, chỉ có ADMIN mới có thể sử dụng phương thức này'
        )
      }
      const canActivate = await super.canActivate(context)
      return Boolean(canActivate)
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new UnauthorizedException('Permission denied')
    }
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid token')
    }
    return user
  }
}
