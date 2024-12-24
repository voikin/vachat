import { MiddlewareConsumer, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule } from '@nestjs/config'
import { UsersModule } from './users/users.module'
import { MailModule } from './auth/mail/mail.module'
import { MailService } from './auth/mail/mail.service'
import { AuthModule } from './auth/auth.module'

import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import * as cors from 'cors'
import { SignalingModule } from './signaling/signaling.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
        }),
        MongooseModule.forRoot(process.env.MONGO_CONNECTION_STRING),
        UsersModule,
        AuthModule,
        MailModule,
        SignalingModule,
    ],
    providers: [
        MailService
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        const corsOptions: CorsOptions = {
            origin: true,
            methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'X-Requested-With',
                'Accept',
            ],
            credentials: true,
        }

        consumer.apply(cors(corsOptions)).forRoutes('*')
    }
}
