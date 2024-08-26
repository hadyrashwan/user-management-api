import { Controller, Get, Post, Param, Body, Delete } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserAvatarService } from '../services/user-avatar.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller('api/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userAvatarService: UserAvatarService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get(':userId')
  async findOne(@Param('userId') userId: string) {
    return this.userService.findOne(userId);
  }

  @Get(':userId/avatar')
  async getAvatar(@Param('userId') userId: string) {
    const avatar = await this.userAvatarService.getAvatarFromDB(userId);
    if (avatar.found) {
      return avatar.image;
    }
    const user = await this.userService.findOne(userId);
    return this.userAvatarService.SaveAvatarToDB(userId, user.avatar);
  }

  @Delete(':userId/avatar')
  async deleteAvatar(@Param('userId') userId: string) {
    return this.userAvatarService.deleteAvatar(userId);
  }
}
