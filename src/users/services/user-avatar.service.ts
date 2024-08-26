import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IFindAvatar, IUserAvatar } from '../interfaces/user.interface';
import { UserAvatar } from '../entities/user-avatar.entity';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import * as path from 'path';
import * as os from 'os';
import axios from 'axios';
import { GetUserDto } from '../dto';

@Injectable()
export class UserAvatarService {
  private readonly tempDirectory = path.join(os.tmpdir(), 'images');
  constructor(
    @InjectModel(UserAvatar.name)
    private readonly avatarModel: Model<IUserAvatar>,
  ) {
    this.ensureDirectoryExists();
  }

  async getAvatarFromDB(userId: number): Promise<IFindAvatar> {
    const avatar = await this.avatarModel.findOne({ userId });
    if (avatar) {
      return { found: true, image: avatar.image.toString('base64') };
    } else {
      return { found: false };
    }
  }

  async SaveAvatarToDB(userId: number, avatarUrl: string): Promise<string> {
    const response = await this.fetchAvatar(avatarUrl);
    const hash = crypto.createHash('sha256').update(response).digest('hex');
    const imagePath = path.join(this.tempDirectory, `${userId}.png`);
    await fs.writeFile(imagePath, response);

    await new this.avatarModel({
      userId,
      hash,
      imagePath,
      image: response,
    }).save();
    return response.toString('base64');
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.mkdir(this.tempDirectory, { recursive: true });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteAvatar(userId: string): Promise<{ success: boolean }> {
    const avatar = await this.avatarModel.findOne({ userId });

    if (!avatar) {
      return { success: false };
    }

    await fs.unlink(avatar.imagePath);
    await avatar.deleteOne();
    return { success: true };
  }

  async fetchUserById(userId: string): Promise<GetUserDto> {
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

  private async fetchAvatar(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' }); // image/jpeg
    return Buffer.from(response.data, 'binary');
  }
}
