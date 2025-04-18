import { ParseFileOptions, ParseFilePipe } from '@nestjs/common'
import { unlink } from 'fs/promises'

export class CustomParseFilePipe extends ParseFilePipe {
  constructor(options?: ParseFileOptions) {
    super(options)
  }

  async transform(file: Express.Multer.File): Promise<any> {
    return super.transform(file).catch(async (error) => {
      await unlink(file.path)
      throw error
    })
  }
}
