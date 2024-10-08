import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class UserAvatar extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  hash: string;

  @Prop({ required: true })
  imagePath: string;

  @Prop({ required: true })
  image: Buffer;
}

export const UserAvatarSchema = SchemaFactory.createForClass(UserAvatar);
