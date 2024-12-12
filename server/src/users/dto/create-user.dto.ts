import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, Length } from 'class-validator'

export class UserDto {
    @ApiProperty({
        example: 'JohnDoe@mail.com',
        description: 'user`s email',
    })
    @IsEmail({}, { message: 'invalid email' })
    email: string

    @ApiProperty({
        example: 'qwerty123',
        description: 'Users`s password',
    })
    @IsString({ message: 'password must be string type' })
    @Length(6, 20, { message: 'password must be in between 6 and 20 symbols' })
    readonly password: string

    // @ApiProperty({
    //     example:
    //         'njq9Na8MVPx5X8/jAY/vWx77RI+Rx7ZQ14UOfQ/IqJ6KVSTcljpR1+1inNoQleODm7pvZv49Yt8oWt47SUpmzQ',
    //     description: 'unique link to verify user',
    // })
    @IsString({ message: 'activation link must be string type' })
    activationLink: string
}
