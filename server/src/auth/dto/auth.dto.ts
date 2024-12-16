import { ApiProperty } from '@nestjs/swagger'
import { User, UserDocument } from 'src/users/schemas/user.schema'

export class AuthDto {
    @ApiProperty({ example: 'johndoe@mail.com', description: 'email of user' })
    email

    @ApiProperty({
        example: '64452e85e6e7815101f3a671',
        description: 'unique id for user',
    })
    id

    @ApiProperty({ example: true, description: 'user is activated by email' })
    isActivated

    constructor(user: UserDocument) {
        this.email = user.email
        this.id = user._id
        this.isActivated = user.isActivated
    }
}
