import { UsersService } from './users.service'
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { User, UserDocument } from './schemas/user.schema'
import { UserDto } from './dto/create-user.dto'

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @ApiOperation({ summary: 'Creating a new user' })
    @ApiResponse({ status: 201, type: User })
    @Post()
    async create(@Body() userDto: UserDto): Promise<UserDocument> {
        return this.usersService.create(userDto)
    }

    @ApiOperation({ summary: 'Getting all users' })
    @ApiResponse({ status: 200, type: [User] })
    @Get()
    async findAll(): Promise<UserDocument[]> {
        return this.usersService.findAll()
    }

    @ApiOperation({ summary: 'Getting user by id' })
    @ApiResponse({ status: 200, type: User })
    @Get(':id')
    async findByID(@Param('id') id: string): Promise<UserDocument> {
        return this.usersService.findByID(id)
    }

    @ApiOperation({ summary: 'Updating users by id' })
    @ApiResponse({ status: 201, type: User })
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateDto: UserDto,
    ): Promise<UserDocument> {
        return this.usersService.update(id, updateDto)
    }

    @ApiOperation({ summary: 'Deleting user by id' })
    @ApiResponse({ status: 200, type: User })
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<UserDocument> {
        return this.usersService.delete(id)
    }
}
