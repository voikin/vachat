import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { Token, TokenDocument } from './schemas/token.schema'
import { Model } from 'mongoose'

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        @InjectModel(Token.name)
        private readonly tokenModel: Model<TokenDocument>,
    ) {}

    async generateToken(payload: any) {
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '30m',
        })
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '30d',
        })
        return {
            accessToken,
            refreshToken,
        }
    }

    validateAccessToken(token: string) {
        try {
            return  this.jwtService.verify(token, {
                secret: process.env.JWT_ACCESS_SECRET,
            })
        } catch (e) {
            return null
        }
    }

    validateRefreshToken(token: string) {
        try {
            return this.jwtService.verify(token, {
                secret: process.env.JWT_REFRESH_SECRET,
            })
        } catch (e) {
            return null
        }
    }

    async saveToken(
        userId: string,
        refreshToken: string,
    ): Promise<TokenDocument> {
        const tokenData = await this.tokenModel.findOne({ user: userId })
        if (tokenData) {
            tokenData.refreshToken = refreshToken
            return tokenData.save()
        }
        return this.tokenModel.create({ user: userId, refreshToken })
    }

    async findToken(refreshToken) {
        return this.tokenModel.findOne({ refreshToken })
    }

    async removeToken(refreshToken: string): Promise<any> {
        return this.tokenModel.deleteOne({ refreshToken })
    }
}
