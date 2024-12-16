import { ApiProperty } from '@nestjs/swagger'
import { AuthDto } from './auth.dto'

export class LoginDto {
    @ApiProperty({
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InMzbnZrbkBnbWFpbC5jb20iLCJpZCI6IjY0NDY4ZDFlNmRkZDk1NTBjODAxNzU0OSIsImlzQWN0aXZhdGVkIjp0cnVlLCJpYXQiOjE2ODIzNDUyNzAsImV4cCI6MTY4MjM0NzA3MH0.kt-650XrBE4zpviJHhRGpQ5x4njELDyCG8TxCVxX1Fs',
        description: 'unique jwt token which using for any request',
    })
    accessToken: string

    @ApiProperty({
        example: {
            email: 'johndoe@mail.com',
            _id: '64468d1e6ddd9550c8017549',
            isActivated: false,
        },
        description: 'service information about the user',
    })
    authDto: AuthDto

    constructor(accessToken: string, authDto: AuthDto) {
        this.accessToken = accessToken
        this.authDto = authDto
    }
}
