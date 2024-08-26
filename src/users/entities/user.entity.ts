import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  readonly id: number;
  @Prop({ required: true })
  readonly email: string;
  @Prop({ required: true })
  readonly first_name: string;
  @Prop({ required: true })
  readonly last_name: string;
  @Prop({ required: true })
  readonly avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
