import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from './schemas/user.schema'
import { UserDto } from './dto/create-user.dto'

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) {}

    async create(userDto: UserDto): Promise<UserDocument> {
        const exist = await this.userModel.exists({
            email: userDto.email,
        })
        if (exist) {
            throw new BadRequestException('this username is already taken')
        }
        const newUser = new this.userModel(userDto)
        return newUser.save()
    }

    async findAll(): Promise<UserDocument[]> {
        return this.userModel.find().exec()
    }

    async findByID(id: string): Promise<UserDocument> {
        return this.userModel.findById(id)
    }

    async findByEmail(email: string): Promise<UserDocument> {
        return this.userModel.findOne({ email }).exec()
    }

    async update(id: string, updateDto: UserDto): Promise<UserDocument> {
        return this.userModel.findByIdAndUpdate(id, updateDto).exec()
    }

    async delete(id: string): Promise<UserDocument> {
        return this.userModel.findByIdAndDelete(id).exec()
    }

    async getUser(query: object): Promise<User> {
        return this.userModel.findOne(query)
    }

    async existUser(userDto: UserDto): Promise<Boolean> {
        const count = await this.userModel.countDocuments({
            email: userDto.email,
        })
        return count > 0
    }

    async activate(activationLink: string) {
        const user = await this.userModel.findOne({ activationLink })
        if (!user) {
            throw new BadRequestException('invalid link')
        }
        user.isActivated = true
        await user.save()
    }
}
