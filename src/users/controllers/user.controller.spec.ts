import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { UserAvatarService } from '../services/user-avatar.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { GetUserDto } from '../dto';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;
  let userAvatarService: UserAvatarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: UserAvatarService,
          useValue: {
            getAvatarFromDB: jest.fn(),
            SaveAvatarToDB: jest.fn(),
            deleteAvatar: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    userAvatarService = module.get<UserAvatarService>(UserAvatarService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        avatar: 'https://example.com/avatar.png',
      };
      const expectedResult: GetUserDto = {
        id: 1,
        ...createUserDto,
      };

      jest.spyOn(userService, 'create').mockResolvedValue(expectedResult);

      expect(await userController.create(createUserDto)).toBe(expectedResult);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw BadRequestException when creation fails', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        avatar: 'https://example.com/avatar.png',
      };

      jest
        .spyOn(userService, 'create')
        .mockRejectedValue(new Error('Creation failed'));

      await expect(userController.create(createUserDto)).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const userId = 1;
      const expectedResult: GetUserDto = {
        id: userId,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        avatar: 'https://example.com/avatar.png',
      };

      jest.spyOn(userService, 'findOne').mockResolvedValue(expectedResult);

      expect(await userController.findOne(userId)).toBe(expectedResult);
      expect(userService.findOne).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException when user is not found', async () => {
      const userId = 999;

      jest.spyOn(userService, 'findOne').mockResolvedValue(null);

      await expect(userController.findOne(userId)).rejects.toThrow();
    });
  });

  describe('getAvatar', () => {
    it('should return avatar from DB if found', async () => {
      const userId = 1;
      const avatarImage = 'base64encodedimage';

      jest
        .spyOn(userAvatarService, 'getAvatarFromDB')
        .mockResolvedValue({ found: true, image: avatarImage });

      expect(await userController.getAvatar(userId)).toBe(avatarImage);
      expect(userAvatarService.getAvatarFromDB).toHaveBeenCalledWith(userId);
    });

    it('should save and return avatar if not found in DB', async () => {
      const userId = 1;
      const avatarUrl = 'https://example.com/avatar.png';
      const avatarImage = 'base64encodedimage';

      jest
        .spyOn(userAvatarService, 'getAvatarFromDB')
        .mockResolvedValue({ found: false });
      jest.spyOn(userService, 'findOne').mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        avatar: avatarUrl,
      } as GetUserDto);
      jest
        .spyOn(userAvatarService, 'SaveAvatarToDB')
        .mockResolvedValue(avatarImage);

      expect(await userController.getAvatar(userId)).toBe(avatarImage);
      expect(userAvatarService.getAvatarFromDB).toHaveBeenCalledWith(userId);
      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(userAvatarService.SaveAvatarToDB).toHaveBeenCalledWith(
        userId,
        avatarUrl,
      );
    });

    it('should throw NotFoundException when user is not found', async () => {
      const userId = 999;

      jest
        .spyOn(userAvatarService, 'getAvatarFromDB')
        .mockResolvedValue({ found: false });
      jest.spyOn(userService, 'findOne').mockResolvedValue(null);

      await expect(userController.getAvatar(userId)).rejects.toThrow();
    });
  });

  describe('deleteAvatar', () => {
    it('should delete user avatar', async () => {
      const userId = '1';
      const expectedResult = { success: true };

      jest
        .spyOn(userAvatarService, 'deleteAvatar')
        .mockResolvedValue(expectedResult);

      expect((await userController.deleteAvatar(userId)).success).toBe(true);
      expect(userAvatarService.deleteAvatar).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException when avatar is not found', async () => {
      const userId = '999';

      jest
        .spyOn(userAvatarService, 'deleteAvatar')
        .mockResolvedValue({ success: false });

      await expect(userController.deleteAvatar(userId)).rejects.toThrow();
    });
  });
});
