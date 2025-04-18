import { Module } from '@nestjs/common'
import { FilesController } from './files.controller'
import { FilesService } from './files.service'
import { MulterModule } from '@nestjs/platform-express'
import multer from 'multer'
import { generateRandomFilename } from 'src/shared/helper'
import { existsSync, mkdirSync } from 'fs'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    const newFilename = generateRandomFilename(file.originalname)
    cb(null, newFilename)
  }
})
@Module({
  imports: [
    MulterModule.register({
      storage
    })
  ],
  controllers: [FilesController],
  providers: [FilesService]
})
export class FilesModule {
  constructor() {
    if (!existsSync('uploads')) {
      mkdirSync('uploads', { recursive: true })
    }
  }
}
