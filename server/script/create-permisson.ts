import { NestFactory } from '@nestjs/core'
import { AppModule } from 'src/app.module'
import { Permission } from 'src/routes/permisson/permission.schema'
import { Role } from 'src/routes/role/role.schema'
import { RoleNameObject } from 'src/shared/constants/orther.constant'
import { User } from 'src/shared/schemas/share-user.schema'
import { HashingService } from 'src/shared/services/hashing.service'
import { MongoDBService } from 'src/shared/services/mongodb.service'
import envConfig from 'src/shared/config'

const mongodb = new MongoDBService()
const hashingService = new HashingService()

const apiVersion = '/api/v1'

interface AvailableRoutes {
  apiPath: string
  method: string
  name: string
  module: string
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3010)
  const server = app.getHttpAdapter().getInstance()
  const router = server.router

  await mongodb.getPermissions().deleteMany({})
  await mongodb.getRoles().deleteMany({})
  await mongodb.getUsers().deleteMany({})
  const availableRoutes: AvailableRoutes[] = router.stack
    .map((layer) => {
      if (layer.route) {
        const path = layer.route?.path
        const method = String(layer.route?.stack[0].method).toUpperCase()
        const module = String(path.split('/')[1]).toUpperCase()
        return {
          apiPath: apiVersion + path,
          method,
          name: method + ' ' + apiVersion + path,
          module
        }
      }
    })
    .filter((item) => item !== undefined)

  if (availableRoutes.length > 0) {
    await mongodb.getPermissions().insertMany([
      ...availableRoutes.map((item) => {
        return new Permission({
          name: item.name,
          method: item.method,
          apiPath: item.apiPath,
          module: item.module
        })
      })
    ])
    const permissions = await mongodb.getPermissions().find().toArray()

    const permissionIds = permissions.map((item) => item._id.toString())

    const [adminRoleId, userRoleId] = await Promise.all([
      mongodb.getRoles().insertOne(
        new Role({
          name: RoleNameObject.ADMIN,
          isActive: true,
          permissions: permissionIds,
          description: 'Quản trị viên'
        })
      ),
      mongodb.getRoles().insertOne(
        new Role({
          name: RoleNameObject.USER,
          isActive: true,
          permissions: [],
          description: 'Người dùng'
        })
      )
    ])
    const hashedPassword = await hashingService.hash(envConfig.ADMIN_PASSWORD)
    await Promise.all([
      mongodb.getUsers().insertOne(
        new User({
          email: envConfig.ADMIN_EMAIL,
          password: hashedPassword,
          name: envConfig.ADMIN_NAME,
          role: adminRoleId.insertedId.toString()
        })
      ),
      mongodb.getUsers().insertOne(
        new User({
          email: 'user@gmail.com',
          password: hashedPassword,
          name: 'User',
          role: userRoleId.insertedId.toString()
        })
      )
    ])
  }
  process.exit(0)
}
bootstrap()
