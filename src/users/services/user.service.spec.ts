import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { CreateUserDto, GetUserDto } from '../dto';
import { IUser } from '../interfaces/user.interface';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';
import * as nodemailer from 'nodemailer';

jest.mock('axios');
jest.mock('nodemailer');

describe('UserService', () => {
  let service: UserService;
  let channelWrapper: any;

  const mockUser: IUser = {
    id: 1,
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    avatar: 'https://example.com/avatar.png',
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    avatar: 'https://example.com/avatar.png',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            new: jest.fn().mockImplementation((dto) => ({
              ...dto,
              save: jest.fn().mockResolvedValue(mockUser),
            })),
            find: jest.fn().mockReturnThis(),
            create: jest.fn().mockResolvedValue(mockUser),
            save: jest.fn().mockResolvedValue(mockUser),
            exec: jest.fn().mockResolvedValue(mockUser),
            constructor: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: 'RABBITMQ_CHANNEL',
          useValue: {
            publish: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    channelWrapper = module.get('RABBITMQ_CHANNEL');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      jest.spyOn(service as any, 'createInReqres').mockResolvedValue(1);
      jest.spyOn(service as any, 'sendEmail').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'publishEvent').mockResolvedValue(undefined);
      (service as any).createModel = jest.fn().mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockUser),
      }));

      const result = await service.create(mockCreateUserDto);

      expect(result).toEqual(mockUser);
      expect(service['createInReqres']).toHaveBeenCalledWith(mockCreateUserDto);
      expect(service['sendEmail']).toHaveBeenCalledWith(mockUser.email);
      expect(service['publishEvent']).toHaveBeenCalledWith(mockUser);
    });

    it('should throw ServiceUnavailableException if Reqres service is unavailable', async () => {
      jest
        .spyOn(service as any, 'createInReqres')
        .mockRejectedValue(
          new ServiceUnavailableException('Reqres service unavailable'),
        );

      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const mockGetUserDto: GetUserDto = { ...mockUser };
      (axios.get as jest.Mock).mockResolvedValue({
        data: { data: mockGetUserDto },
      });

      const result = await service.findOne(1);

      expect(result).toEqual(mockGetUserDto);
      expect(axios.get).toHaveBeenCalledWith('https://reqres.in/api/users/1');
    });

    it('should throw NotFoundException if user is not found', async () => {
      (axios.get as jest.Mock).mockRejectedValue({ response: { status: 404 } });

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it("should throw the original error if it's not a 404", async () => {
      const error = new Error('Network error');
      (axios.get as jest.Mock).mockRejectedValue(error);

      await expect(service.findOne(1)).rejects.toThrow(error);
    });
  });

  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      const mockTransporter = {
        sendMail: jest.fn().mockResolvedValue(undefined),
      };
      (nodemailer.createTransport as jest.Mock).mockReturnValue(
        mockTransporter,
      );

      await service['sendEmail']('test@example.com');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: process.env.SFTP_EMAIL,
        to: 'test@example.com',
        subject: 'Welcome to User Management API',
        text: 'User created successfully.',
      });
    });
  });

  describe('createInReqres', () => {
    it('should create a user in Reqres and return the id', async () => {
      (axios.post as jest.Mock).mockResolvedValue({
        status: 201,
        data: { id: 1 },
      });

      const result = await service['createInReqres'](mockCreateUserDto);

      expect(result).toBe(1);
      expect(axios.post).toHaveBeenCalledWith(
        'https://reqres.in/api/users',
        mockCreateUserDto,
      );
    });

    it('should throw ServiceUnavailableException if Reqres returns non-201 status', async () => {
      (axios.post as jest.Mock).mockResolvedValue({ status: 500 });

      await expect(
        service['createInReqres'](mockCreateUserDto),
      ).rejects.toThrow(ServiceUnavailableException);
    });
  });

  describe('publishEvent', () => {
    it('should publish an event successfully', async () => {
      const result = await service['publishEvent'](mockUser);

      expect(result).toBeUndefined();
      expect(channelWrapper.publish).toHaveBeenCalledWith(
        'exchange1',
        'user.created',
        Buffer.from(JSON.stringify(mockUser)),
      );
    });

    it('should throw ServiceUnavailableException if publishing fails', async () => {
      channelWrapper.publish.mockResolvedValue(false);

      await expect(service['publishEvent'](mockUser)).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });
});
