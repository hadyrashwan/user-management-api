import {
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from '../interfaces/user.interface';
import { User } from '../entities/user.entity';
import { CreateUserDto, GetUserDto } from '../dto/create-user.dto';
import * as nodemailer from 'nodemailer';
import axios from 'axios';
import { ChannelWrapper } from 'amqp-connection-manager';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<IUser>,
    // private readonly amqpConnection: AmqpConnection,
    @Inject('RABBITMQ_CHANNEL') private readonly channelWrapper: ChannelWrapper,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<IUser> {
    const id = await this.createInReqres(createUserDto);
    const createdUser = new this.userModel({ ...createUserDto, id });
    const user = await createdUser.save();

    this.sendEmail(user.email);
    this.publishEvent(user);

    return user;
  }

  async findOne(userId: string): Promise<GetUserDto> {
    try {
      const response = await axios.get(`https://reqres.in/api/users/${userId}`);
      return response.data.data as GetUserDto;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new NotFoundException('User not found');
      }

      throw error;
    }
  }

  private async sendEmail(email: string) {
    const transporter = nodemailer.createTransport({
      host: process.env.SFTP_HOST,
      port: process.env.SFTP_PORT,
      auth: {
        user: process.env.SFTP_EMAIL,
        pass: process.env.SFTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SFTP_EMAIL,
      to: email,
      subject: 'Welcome to User Management API',
      text: 'User created successfully.',
    });
  }

  private async createInReqres(user: CreateUserDto): Promise<number> {
    const response = await axios.post('https://reqres.in/api/users', user);

    if (response.status !== 201)
      throw new ServiceUnavailableException('Reqres service unavailable');

    return response.data?.id;
  }

  private async publishEvent(user: IUser): Promise<void> {
    const response = await this.channelWrapper.publish(
      'exchange1',
      'user.created',
      Buffer.from(JSON.stringify(user)),
    );
    if (response != true)
      throw new ServiceUnavailableException(' Queue service unavailable');
  }
}
