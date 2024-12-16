import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MSchema } from 'mongoose'
import { User } from 'src/users/schemas/user.schema'

export type TokenDocument = Token & Document

@Schema()
export class Token {
    @Prop({ type: MSchema.Types.ObjectId, ref: User.name })
    user: User

    @Prop({ required: true })
    refreshToken: string
}

export const TokenSchema = SchemaFactory.createForClass(Token)
