import { ApiProperty } from '@nestjs/swagger'

export class Tokens {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEBnbWFpbC5jb20iLCJpYXQiOjE2NjU4NjY2MzYsImV4cCI6MTY2NTg2NjczNn0.ZUf-EDv3gA5tT2y-cMIVx-rJDR2h8gknMoW2DSc-84s',
    description: 'User access token',
  })
  access_token: string

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEBnbWFpbC5jb20iLCJpYXQiOjE2NjU4NjY2MzYsImV4cCI6MTY2NjQ3MTQzNn0.bC9f3F2Z4Z2c4JjJ3Y2c4JjJ3Y2c4JjJ3Y2c4JjJ3Y2c4JjI',
    description: 'User refresh token',
  })
  refresh_token: string
}
