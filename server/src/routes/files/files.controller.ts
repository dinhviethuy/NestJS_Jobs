import {
  Controller,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { CloudinaryService } from 'src/shared/services/cloudinary.service'
import { CustomParseFilePipe } from 'src/shared/pipes/custom-parse-file.pipe'
import { Response } from 'express'
import path from 'path'

@Controller('files')
export class FilesController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('fileUpload', {
      limits: {
        fileSize: 5 * 1024 * 1024
      }
    })
  )
  async uploadFile(
    @UploadedFile(
      new CustomParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }) // 5MB
        ]
      })
    )
    file: Express.Multer.File
  ) {
    return await this.cloudinaryService.uploadFile(file)
  }

  @Get('static/:filename')
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    if (!filename) {
      const notfound = new NotFoundException('File not found')
      return res.status(notfound.getStatus()).json(notfound.getResponse())
    }

    return res.sendFile(path.resolve('uploads', filename), (error) => {
      if (error) {
        const notfound = new NotFoundException('File not found')
        res.status(notfound.getStatus()).json(notfound.getResponse())
      }
    })
  }
}
