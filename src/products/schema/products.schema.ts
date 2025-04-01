import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type ProductDocument = Product & Document;

@Schema()
export class Product {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    price: number;

    @Prop({ default: true })
    IsActive: boolean;

    @Prop({type: MongooseSchema.Types.ObjectId, ref: 'user'})
    createdBy: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);