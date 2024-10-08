import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { UserAvatarService } from '../services/user-avatar.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { GetUserDto } from '../dto';

@ApiTags('users')
@Controller('api/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userAvatarService: UserAvatarService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'userId', type: String, description: 'ID of the user' })
  @ApiResponse({
    status: 200,
    description: 'Return the user data.',
    type: GetUserDto,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(@Param('userId') userId: number) {
    try {
      const response = await this.userService.findOne(userId);
      if (!response.id) {
        throw new NotFoundException();
      }
      return response;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new NotFoundException('User not found');
      }

      throw new BadRequestException(error);
    }
  }

  @Get(':userId/avatar')
  @ApiOperation({ summary: 'Get user avatar by user ID' })
  @ApiParam({ name: 'userId', type: String, description: 'ID of the user' })
  @ApiResponse({
    status: 200,
    description: 'Return the avatar image in base64 format.',
  })
  @ApiResponse({ status: 404, description: 'Avatar not found.' })
  async getAvatar(@Param('userId') userId: number) {
    const avatar = await this.userAvatarService.getAvatarFromDB(userId);
    if (avatar.found) {
      return avatar.image;
    }
    const user = await this.userService.findOne(userId);
    return this.userAvatarService.SaveAvatarToDB(userId, user.avatar);
  }

  @Delete(':userId/avatar')
  @ApiOperation({ summary: 'Delete user avatar by user ID' })
  @ApiParam({ name: 'userId', type: String, description: 'ID of the user' })
  @ApiResponse({ status: 200, description: 'Avatar successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Avatar not found.' })
  async deleteAvatar(@Param('userId') userId: string) {
    const response = await this.userAvatarService.deleteAvatar(userId);
    if (response.success) {
      return { success: true, message: 'Avatar successfully deleted.' };
    } else {
      throw new NotFoundException('Avatar not found.');
    }
  }
}
