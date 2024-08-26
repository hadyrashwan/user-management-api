import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserAvatar } from '../interfaces/user.interface';
import { UserAvatar } from '../entities/user-avatar.entity';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';
import axios from 'axios';

@Injectable()
export class UserAvatarService {
  constructor(
    @InjectModel(UserAvatar.name)
    private readonly avatarModel: Model<IUserAvatar>,
  ) {}

  async getAvatar(userId: string, avatarUrl: string): Promise<string> {
    const avatar = await this.avatarModel.findOne({ userId });

    if (avatar) {
      return fs.readFileSync(avatar.imagePath, 'base64');
    } else {
      const response = await this.fetchAvatar(avatarUrl);
      const hash = crypto.createHash('sha256').update(response).digest('hex');
      const imagePath = path.join(__dirname, `../../../avatars/${userId}.png`);
      fs.writeFileSync(imagePath, response);

      await new this.avatarModel({ userId, hash, imagePath }).save();
      return response.toString('base64');
    }
  }

  async deleteAvatar(userId: string): Promise<void> {
    const avatar = await this.avatarModel.findOne({ userId });
    if (!avatar) throw new NotFoundException('Avatar not found');

    fs.unlinkSync(avatar.imagePath);
    await avatar.deleteOne();
  }

  private async fetchAvatar(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
  }
}
