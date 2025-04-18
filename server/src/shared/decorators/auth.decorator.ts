import { SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'isPublic'

export const IsPublic = () => SetMetadata(IS_PUBLIC_KEY, true)

export const SKIP_AUTH_KEY = 'skipAuth'

export const SkipCheckPermission = () => SetMetadata(SKIP_AUTH_KEY, true)
