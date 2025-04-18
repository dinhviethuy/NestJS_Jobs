import { Injectable } from '@nestjs/common'
import { v2 as cloudinary } from 'cloudinary'
import envConfig from 'src/shared/config'
import { unlink } from 'fs'

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
      api_key: envConfig.CLOUDINARY_API_KEY,
      api_secret: envConfig.CLOUDINARY_API_SECRET
    })
  }
  uploadFile(file: Express.Multer.File) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(file.path, { resource_type: 'auto' }, (error, result) => {
        if (error) {
          unlink(file.path, () => {
            if (error) console.error('Error deleting file:', error)
          })
          return reject(error)
        }
        if (result) {
          unlink(file.path, () => {
            if (error) console.error('Error deleting file:', error)
          })
          resolve({ fileName: result.secure_url })
        }
      })

      // streamifier.createReadStream(readFileSync(file.path)).pipe(uploadStream)
    })
  }
}
