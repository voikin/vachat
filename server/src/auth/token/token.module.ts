import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { TokenService } from './token.service'
import { MongooseModule } from '@nestjs/mongoose'
import { Token, TokenSchema } from './schemas/token.schema'

@Module({
    imports: [
        JwtModule.register({}),
        MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
    ],
    providers: [TokenService],
    exports: [TokenService],
})
export class TokenModule {}
