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
    const avatarUrl = `https://reqres.in/api/users/${userId}/avatar`;
    return this.userAvatarService.getAvatar(userId, avatarUrl);
  }

  @Delete(':userId/avatar')
  async deleteAvatar(@Param('userId') userId: string) {
    return this.userAvatarService.deleteAvatar(userId);
  }
}
