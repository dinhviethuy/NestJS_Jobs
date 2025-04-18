import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LocalAuthGuard } from 'src/shared/guards/local.guard'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { UserType } from 'src/shared/models/shared-user.model'
import { LoginResponseDTO, RefreshTokenResDTO, RegisterBodyDTO, UserLoginDto } from './auth.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { UserDetailDTO } from 'src/shared/dtos/shared-user.dto'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { Response, Request } from 'express'
import { ActiveUser, FieldUserType } from 'src/shared/decorators/active-user.decorator'
import { AccountResponseSchema } from './auth.model'
import { ThrottlerGuard } from '@nestjs/throttler'
import { ApiBody, ApiProperty } from '@nestjs/swagger'
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  @ApiProperty({
    example: '123456',
    description: '密码'
  })
  @IsPublic()
  @ApiBody({ type: UserLoginDto })
  @MessageRes('Login successfully')
  @ZodSerializerDto(LoginResponseDTO)
  async login(@Req() req: Request & { user: UserType }, @Res({ passthrough: true }) res: Response) {
    return this.authService.login({
      email: req.user.email,
      userId: req.user._id!,
      name: req.user.name,
      role: req.user.role,
      iss: 'from server',
      sub: 'token login',
      res
    })
  }

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @IsPublic()
  @MessageRes('Register successfully')
  @ZodSerializerDto(UserDetailDTO)
  async register(@Body() body: RegisterBodyDTO) {
    return this.authService.register(body)
  }

  @Get('account')
  @MessageRes('Get account successfully')
  @ZodSerializerDto(AccountResponseSchema)
  account(@ActiveUser() user: FieldUserType) {
    return this.authService.account(user._id)
  }

  @Get('/refresh')
  @IsPublic()
  @ZodSerializerDto(RefreshTokenResDTO)
  @MessageRes('Refresh token successfully')
  refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refreshToken(req.cookies['refresh_token'], res)
  }

  @Post('/logout')
  @MessageRes('Logout successfully')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refresh_token = req.cookies['refresh_token']
    return this.authService.logout(refresh_token, res)
  }
}
