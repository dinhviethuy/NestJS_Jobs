import { UnprocessableEntityException } from '@nestjs/common'
import { createZodValidationPipe } from 'nestjs-zod'
import { ZodError } from 'zod'

const CustomValidatorPipe = createZodValidationPipe({
  createValidationException: (e: ZodError) => {
    return new UnprocessableEntityException(
      e.errors.map((error) => ({
        ...error,
        path: error.path.join('.')
      }))
    )
  }
})

export default CustomValidatorPipe
