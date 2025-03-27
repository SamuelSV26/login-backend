import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO, UpdateUserDTO, UpdateUserPasswordDTO } from './dto/user.dto';
import { User } from './interfaces/user.interface';
import { isValidObjectId } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService){}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createUserDTO: CreateUserDTO): Promise<{ message: string }> {
      await this.userService.create(createUserDTO);
      return { message: 'Se ha enviado un correo de confirmación' };
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<User[]>{
        return this.userService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findById(@Param('id') id: string): Promise<User> {
        if (!isValidObjectId(id)) {
            throw new BadRequestException(`El ID proporcionado no es válido: ${id}`);
        }
        return this.userService.findById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateUserDTO: UpdateUserDTO): Promise<User>{
        return this.userService.update(id, updateUserDTO);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/updatepass')
    async updatePassword(@Param('id') id: string, @Body() updateUserPasswordDTO: UpdateUserPasswordDTO): Promise<User>{
        return this.userService.updatePassword(id, updateUserPasswordDTO);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string): Promise<void>{
        return this.userService.delete(id);
    }
}
