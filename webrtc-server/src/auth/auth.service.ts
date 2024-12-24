import { TokenService } from './token/token.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import { MailService } from 'src/auth/mail/mail.service';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
  ) {}

  async signup(userDto: UserDto) {
    const user = await this.usersService.existUser(userDto);
    if (user) {
      console.log(user);
      throw new BadRequestException('this email is already exist');
    }
    const hashPassword = await bcrypt.hash(userDto.password, 5);
    const activationLink = uuid.v4();
    const newUser = await this.usersService.create({
      ...userDto,
      activationLink,
      password: hashPassword,
    });

    this.mailService.sendActivationMail(
      newUser.email,
      `${process.env.API_URL}/auth/activate/${activationLink}`,
    );
  }
  async login(userDto: UserDto) {
    const user = await this.usersService.findByEmail(userDto.email);
    if (!user) {
      throw new BadRequestException('invalid email');
    }
    const isPassEquals = await bcrypt.compare(userDto.password, user.password);
    if (!isPassEquals) {
      throw new BadRequestException('invalid password');
    }
    if (!user.isActivated) {
      throw new ForbiddenException('email is not confirmed');
    }
    const authDto = new AuthDto(user);
    const tokens = await this.tokenService.generateToken({ ...authDto });
    await this.tokenService.saveToken(user._id as string, tokens.refreshToken);
    return {
      ...tokens,
      authDto,
    };
  }

  async logout(refreshToken: string) {
    return this.tokenService.removeToken(refreshToken);
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const userData = await this.tokenService.validateRefreshToken(refreshToken);
    const tokenFromDN = this.tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDN) {
      throw new UnauthorizedException();
    }
    const user = await this.usersService.findByID(userData.id);
    const authDto = new AuthDto(user);
    const tokens = await this.tokenService.generateToken({ ...authDto });
    await this.tokenService.saveToken(authDto.id, tokens.refreshToken);
    return {
      ...tokens,
      authDto,
    };
  }
}
