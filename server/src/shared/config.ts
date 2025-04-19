import fs from 'fs'
import { z } from 'zod'
import { config } from 'dotenv'
import { Logger } from '@nestjs/common'

const path = '.env'

config({
  path
})

if (!fs.existsSync(path)) {
  Logger.error(`.env file not found at ${path}`)
  process.exit(1)
}

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string(),
  MONGODB_DB_NAME: z.string(),
  USERS_COLLECTION: z.string(),
  COMPANIES_COLLECTION: z.string(),
  RESUMES_COLLECTION: z.string(),
  JOBS_COLLECTION: z.string(),
  PERMISSIONS_COLLECTION: z.string(),
  ROLES_COLLECTION: z.string(),
  SUBSCRIBERS_COLLECTION: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIIRES_IN: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  ADMIN_EMAIL: z.string(),
  ADMIN_PASSWORD: z.string(),
  ADMIN_NAME: z.string(),
  EMAIL_HOST: z.string(),
  EMAIL_ADDRESS: z.string(),
  EMAIL_PASSWORD: z.string()
})

const configServer = configSchema.safeParse(process.env)
if (!configServer.success) {
  Logger.error('Invalid environment variables')
  Logger.error(configServer.error.format())
  process.exit(1)
}

const envConfig = configServer.data

export default envConfig
