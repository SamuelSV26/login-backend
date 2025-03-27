import { PendingUser, PendingUserSchema } from './schemas/pending-user.schema';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel} from './schemas/user.schema';
import { UserSchema } from './schemas/user.schema';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema}
    ]),
    MongooseModule.forFeature([{ name: PendingUser.name, schema: PendingUserSchema }]),
    EmailModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
