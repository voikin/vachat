import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEmail, IsString } from 'class-validator'
import { Document } from 'mongoose'

export type UserDocument = User & Document

@Schema()
export class User {
    @ApiProperty({
        example: 'JohnDoe@mail.com',
        description: 'user`s email',
    })
    @IsEmail({}, { message: 'invalid email' })
    @Prop({ required: true, unique: true })
    email: string

    @ApiProperty({
        example: 'qwerty123',
        description: 'user`s password',
    })
    @Prop({ required: true })
    password: string

    @ApiProperty({
        example: true,
        description: 'user has been activated or not'
    })
    @IsBoolean({message: 'isActivated must be boolean type'})
    @Prop({default: false})
    isActivated: boolean

    @ApiProperty({
        example: 'njq9Na8MVPx5X8/jAY/vWx77RI+Rx7ZQ14UOfQ/IqJ6KVSTcljpR1+1inNoQleODm7pvZv49Yt8oWt47SUpmzQ',
        description: 'unique link to verify user'
    })
    @IsString({message: 'activation link must be string type'})
    @Prop()
    activationLink: string

    @ApiProperty({
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        description: 'users`s refresh token',
    })
    @Prop()
    refreshToken: string
}

export const UserSchema = SchemaFactory.createForClass(User)
