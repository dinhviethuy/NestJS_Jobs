// import fs from 'fs'
// import { z } from 'zod'
// import { config } from 'dotenv'
// import { Logger } from '@nestjs/common'

// const path = '.env'

// config({
//   path
// })

// if (!fs.existsSync(path)) {
//   Logger.error(`.env file not found at ${path}`)
//   process.exit(1)
// }

// const configSchema = z.object({
//   PORT: z.coerce.number().default(3000),
//   MONGODB_URI: z.string(),
//   MONGODB_DB_NAME: z.string(),
//   USERS_COLLECTION: z.string(),
//   COMPANIES_COLLECTION: z.string(),
//   RESUMES_COLLECTION: z.string(),
//   JOBS_COLLECTION: z.string(),
//   PERMISSIONS_COLLECTION: z.string(),
//   ROLES_COLLECTION: z.string(),
//   SUBSCRIBERS_COLLECTION: z.string(),
//   ACCESS_TOKEN_SECRET: z.string(),
//   ACCESS_TOKEN_EXPIIRES_IN: z.string(),
//   REFRESH_TOKEN_SECRET: z.string(),
//   REFRESH_TOKEN_EXPIIRES_IN: z.string(),
//   CLOUDINARY_CLOUD_NAME: z.string(),
//   CLOUDINARY_API_KEY: z.string(),
//   CLOUDINARY_API_SECRET: z.string(),
//   ADMIN_EMAIL: z.string(),
//   ADMIN_PASSWORD: z.string(),
//   ADMIN_NAME: z.string(),
//   EMAIL_HOST: z.string(),
//   EMAIL_ADDRESS: z.string(),
//   EMAIL_PASSWORD: z.string()
// })

// const configServer = configSchema.safeParse(process.env)
// if (!configServer.success) {
//   Logger.error('Invalid environment variables')
//   Logger.error(configServer.error.format())
//   process.exit(1)
// }

// const envConfig = configServer.data

// export default envConfig

import { config } from 'dotenv'
config()

const envConfig = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || '',
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || '',
  USERS_COLLECTION: process.env.USERS_COLLECTION || '',
  COMPANIES_COLLECTION: process.env.COMPANIES_COLLECTION || '',
  RESUMES_COLLECTION: process.env.RESUMES_COLLECTION || '',
  JOBS_COLLECTION: process.env.JOBS_COLLECTION || '',
  PERMISSIONS_COLLECTION: process.env.PERMISSIONS_COLLECTION || '',
  ROLES_COLLECTION: process.env.ROLES_COLLECTION || '',
  SUBSCRIBERS_COLLECTION: process.env.SUBSCRIBERS_COLLECTION || '',
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || '',
  ACCESS_TOKEN_EXPIIRES_IN: process.env.ACCESS_TOKEN_EXPIIRES_IN || '1h',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || '',
  REFRESH_TOKEN_EXPIIRES_IN: process.env.REFRESH_TOKEN_EXPIIRES_IN || '30d',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
  ADMIN_NAME: process.env.ADMIN_NAME || '',
  EMAIL_HOST: process.env.EMAIL_HOST || '',
  EMAIL_ADDRESS: process.env.EMAIL_ADDRESS || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || ''
}

export default envConfig
