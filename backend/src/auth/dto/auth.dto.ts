import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class AuthDto {
  @ApiProperty({ example: 'test@gmail.com', description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({ example: '12345', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string
}
