import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { UsersModule } from 'src/users/users.module'
import { MailModule } from 'src/auth/mail/mail.module'
import { TokenModule } from './token/token.module'
import { AuthController } from './auth.controller'
import { AccessTokenStrategy } from './strategies/accessToken.strategy'

@Module({
    imports: [PassportModule, UsersModule, MailModule, TokenModule, PassportModule],
    providers: [AuthService, AccessTokenStrategy],
    controllers: [AuthController],
})
export class AuthModule {}
