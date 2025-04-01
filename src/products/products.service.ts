import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable , NotFoundException } from '@nestjs/common';
import { CreateProductDTO, UpdateProductDto } from './dto/produc.dto';
import { Product, ProductDocument } from './schema/products.schema';

@Injectable()
export class ProductsService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    ) {}

    async findAll(userId?: string): Promise<Product[]> {
        const query = userId ? { createdBy: userId } : {};
        return this.productModel.find(query).exec();
      }
    
      async findById(id: string): Promise<Product> {
        const product = await this.productModel.findById(id).exec();
        if (!product) {
          throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
      }
    
      async create(createProductDto: CreateProductDTO, userId: string): Promise<Product> {
        const newProduct = new this.productModel({
          ...createProductDto,
          createdBy: userId,
        });
        return newProduct.save();
      }
    
      async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
        const updatedProduct = await this.productModel
          .findByIdAndUpdate(id, updateProductDto, { new: true })
          .exec();
        if (!updatedProduct) {
          throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return updatedProduct;
      }
    
      async delete(id: string): Promise<boolean> {
        const result = await this.productModel.findByIdAndDelete(id).exec();
        if (!result) {
          throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return true;
      }
    }
