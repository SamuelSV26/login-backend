import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({
    timestamps: true,
})
export class PendingUser extends Document {
    @Prop({ type: String, required: true }) 
    username: string;

    @Prop({ type: String, required: true, unique: true }) // email of the user
    email: string;

    @Prop({ type: String, required: true }) // hashed password
    password: string;

    @Prop({ type: String, required: true }) // token to be sent to the user's email
    confirmationToken: string;

    @Prop({ type: String, required: true })
     phone: string; // phone number of the user

    @Prop({ type: Date, default: Date.now, expires: 5 }) // expires in 5 minutes
    createdAt: Date;
}

export const PendingUserSchema = SchemaFactory.createForClass(PendingUser);

