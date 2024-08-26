import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { UserAvatar, UserAvatarSchema } from './entities/user-avatar.entity';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserAvatarService } from './services/user-avatar.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: UserAvatar.name, schema: UserAvatarSchema },
    ]),
    QueueModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserAvatarService],
})
export class UsersModule {}
