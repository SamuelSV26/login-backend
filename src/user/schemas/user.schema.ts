import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type UserDocument =  UserModel & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;      
      return ret;
    }
  }
})

export class UserModel{
    @Prop({required: true})
    username: string;

    @Prop({required: true})
    email: string;

    @Prop({required: true})
    password: string;

    @Prop({required: true})
    phone: string;

    @Prop({ default: 'user' })
    role: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);