import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserAvatarService } from './user-avatar.service';
import { UserAvatar } from '../entities/user-avatar.entity';
import { IFindAvatar, IUserAvatar } from '../interfaces/user.interface';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import axios from 'axios';
import { GetUserDto } from '../dto';
import { InternalServerErrorException } from '@nestjs/common';

import * as crypto from 'crypto';

// Mocking modules
jest.mock('fs/promises');
jest.mock('axios');

Object.defineProperty(global, 'crypto', {
  value: {
    createHash: () => crypto.createHash('sha256'),
  },
});

// Mock data
const tempDirectory = path.join(os.tmpdir(), 'images');

const mockAvatar: IUserAvatar = {
  userId: 1,
  hash: 'somehash',
  imagePath: path.join(tempDirectory, '1.png'),
  image: Buffer.from('mockImageData'),
};

const mockFindAvatar: IFindAvatar = {
  found: true,
  image: 'bW9ja0ltYWdlRGF0YQ==',
};

const mockUserDto: GetUserDto = {
  id: 1,
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  avatar: 'https://example.com/avatar.png',
};

describe('UserAvatarService', () => {
  let service: UserAvatarService;
  let avatarModel: Model<IUserAvatar>;

  beforeEach(async () => {
    jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined);

    const avatarDocument = {
      save: jest.fn().mockResolvedValue(mockAvatar),
      deleteOne: jest.fn().mockResolvedValue({}),
      imagePath: mockAvatar.imagePath,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAvatarService,
        {
          provide: getModelToken(UserAvatar.name),
          useValue: {
            findOne: jest.fn().mockResolvedValue(avatarDocument),
            create: jest.fn(),
            save: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserAvatarService>(UserAvatarService);
    avatarModel = module.get<Model<IUserAvatar>>(
      getModelToken(UserAvatar.name),
    );
  });

  describe('getAvatarFromDB', () => {
    it('should return the avatar if found', async () => {
      jest.spyOn(avatarModel, 'findOne').mockResolvedValue(mockAvatar as any);

      const result = await service.getAvatarFromDB(1);

      expect(result).toEqual(mockFindAvatar);
    });

    it('should return { found: false } if avatar not found', async () => {
      jest.spyOn(avatarModel, 'findOne').mockResolvedValue(null);

      const result = await service.getAvatarFromDB(1);

      expect(result).toEqual({ found: false });
    });
  });

  describe('SaveAvatarToDB', () => {
    it('should save the avatar and return base64 image', async () => {
      jest
        .spyOn(service as any, 'fetchAvatar')
        .mockResolvedValue(Buffer.from('mockImageData'));

      jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

      const mockCreatedAvatar = {
        userId: 1,
        hash: 'somehash',
        imagePath: path.join(tempDirectory, '1.png'),
        image: Buffer.from('mockImageData'),
        save: jest.fn().mockResolvedValue(mockAvatar),
      };
      jest
        .spyOn(avatarModel, 'create')
        .mockResolvedValue(mockCreatedAvatar as any);

      (service as any).createModel = jest.fn().mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockAvatar),
      }));

      const result = await service.SaveAvatarToDB(
        1,
        'https://example.com/avatar.png',
      );

      expect(result).toBe('bW9ja0ltYWdlRGF0YQ==');
      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(tempDirectory, '1.png'),
        Buffer.from('mockImageData'),
      );
    });
  });

  describe('ensureDirectoryExists', () => {
    it('should create directory if it does not exist', async () => {
      jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined);

      await service['ensureDirectoryExists']();

      expect(fs.mkdir).toHaveBeenCalledWith(tempDirectory, { recursive: true });
    });

    it('should throw InternalServerErrorException on failure', async () => {
      jest
        .spyOn(fs, 'mkdir')
        .mockRejectedValue(new Error('Failed to create directory'));

      await expect(service['ensureDirectoryExists']()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('deleteAvatar', () => {
    it('should delete the avatar and return success', async () => {
      jest
        .spyOn(avatarModel, 'findOne')
        .mockResolvedValue({ ...mockAvatar, deleteOne: jest.fn() } as any);
      jest.spyOn(fs, 'unlink').mockResolvedValue(undefined);
      jest.spyOn(avatarModel, 'deleteOne').mockResolvedValue({} as any);

      const result = await service.deleteAvatar('1');

      expect(result).toEqual({ success: true });
      expect(fs.unlink).toHaveBeenCalledWith(mockAvatar.imagePath);
    });

    it('should return { success: false } if avatar not found', async () => {
      jest.spyOn(avatarModel, 'findOne').mockResolvedValue(null);

      const result = await service.deleteAvatar('1');

      expect(result).toEqual({ success: false });
    });
  });

  describe('fetchUserById', () => {
    it('should return user details if found', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: { data: mockUserDto },
      });

      const result = await service.fetchUserById('1');

      expect(result).toEqual(mockUserDto);
      expect(axios.get).toHaveBeenCalledWith('https://reqres.in/api/users/1');
    });

    it('should throw NotFoundException if user is not found', async () => {
      (axios.get as jest.Mock).mockRejectedValue({ response: { status: 404 } });

      await expect(service.fetchUserById('999')).rejects.toThrow();
    });

    it('should throw the original error if not a 404 error', async () => {
      const error = new Error('Network error');
      (axios.get as jest.Mock).mockRejectedValue(error);

      await expect(service.fetchUserById('1')).rejects.toThrow(error);
    });
  });
});
