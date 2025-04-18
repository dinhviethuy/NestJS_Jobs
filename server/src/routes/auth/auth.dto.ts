import { createZodDto } from 'nestjs-zod'
import {
  AccountResponseSchema,
  EmptyBodySchema,
  LoginBodySchema,
  LoginResponseSchema,
  RefreshTokenBodySchema,
  RefreshTokenResSchema,
  RegisterBodySchema
} from './auth.model'
import { ApiProperty } from '@nestjs/swagger'

export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}
export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}
export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema) {}
export class LoginResponseDTO extends createZodDto(LoginResponseSchema) {}
export class AccountResponseDTO extends createZodDto(AccountResponseSchema) {}
export class RefreshTokenResDTO extends createZodDto(RefreshTokenResSchema) {}
export class EmptyBodyDTO extends createZodDto(EmptyBodySchema) {}

export class UserLoginDto {
  @ApiProperty({
    example: 'dinhviethuy',
    description: 'username'
  })
  readonly username: string
  @ApiProperty({
    example: '123456',
    description: 'password'
  })
  readonly password: string
}
