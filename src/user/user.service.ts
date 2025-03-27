import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserModel } from './schemas/user.schema';
import { PendingUser, PendingUserSchema } from './schemas/pending-user.schema'; // Importa PendingUser
import { User, UserService as UserServiceInterface } from './interfaces/user.interface';
import { CreateUserDTO, UpdateUserDTO, UpdateUserPasswordDTO } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/email.service';
import { sendEmailDto } from 'src/email/dto/email.dto';
import * as crypto from 'crypto'; // Para generar tokens únicos

@Injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserDocument>,
    @InjectModel(PendingUser.name) private pendingUserModel: Model<PendingUser>, // Inyecta PendingUser
    private emailService: EmailService,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.userModel.find().lean().exec();
    return users.map(user => this.mapToUserInterface(user));
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).lean().exec();
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return this.mapToUserInterface(user);
  }

  async create(createUserDto: CreateUserDTO): Promise<void> {
    // Verifica si el email ya está en uso
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new NotFoundException(`El email ya existe`);
    }
  
    // Verifica si el email ya está pendiente de confirmación
    const existingPendingUser = await this.pendingUserModel.findOne({ email: createUserDto.email });
    if (existingPendingUser) {
      throw new NotFoundException('Ya hay una solicitud pendiente para este email');
    }
  
    // Encripta la contraseña
    const salt = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
  
    // Genera un token único para la confirmación
    const confirmationToken = crypto.randomBytes(32).toString('hex');
  
    // Guarda temporalmente los datos del usuario
    const pendingUser = new this.pendingUserModel({
      username: createUserDto.username, 
      email: createUserDto.email,
      password: hashedPassword,
      confirmationToken,
    });

    console.log(pendingUser);
    
    await pendingUser.save();
  
    // Envía un correo de confirmación
    await this.sendConfirmationEmail(createUserDto.email, confirmationToken);
  }

  async confirmAccount(token: string): Promise<User> {
    // Busca el usuario pendiente por el token
    const pendingUser = await this.pendingUserModel.findOne({ confirmationToken: token });
    if (!pendingUser) {
      throw new NotFoundException('Token de confirmación inválido o expirado');
    }

    // Crea el usuario en la base de datos
    const newUser = new this.userModel({
      username: pendingUser.username,
      email: pendingUser.email,
      password: pendingUser.password,
    });
    const savedUser = await newUser.save();

    // Elimina el usuario pendiente
    await this.pendingUserModel.deleteOne({ _id: pendingUser._id });

    return this.mapToUserInterface(savedUser.toObject());
  }

  private async sendConfirmationEmail(email: string, token: string) {
    const emailDto: sendEmailDto = {
      recipients: [email],
      subject: 'Confirmación de cuenta',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Verificación de cuenta</h2>
          <p>Hola,</p>
          <p>Gracias por registrarte. Para completar tu registro, por favor haz clic en el siguiente enlace:</p>
          <div style="background-color: #f5f5f5; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
            <a href="http://localhost:3000/auth/confirm?token=${token}" style="text-decoration: none; color: #fff; background-color: #007bff; padding: 10px 20px; border-radius: 5px;">Confirmar cuenta</a>
          </div>
          <p>Este enlace expirará en 5 minutos.</p>
          <p>Si no has solicitado este registro, por favor ignora este correo.</p>
          <p>Saludos,<br>El equipo de soporte</p>
        </div>
      `,
    };

    await this.emailService.sendEmail(emailDto);
  }

  async update(id: string, updateUserDto: UpdateUserDTO): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).lean().exec();
    if (!updatedUser) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return this.mapToUserInterface(updatedUser);
  }

  async updatePassword(id: string, updateUserPasswordDTO: UpdateUserPasswordDTO): Promise<User> {
    // Encriptar la nueva contraseña
    const salt = 10;
    const hashedPassword = await bcrypt.hash(updateUserPasswordDTO.password, salt);

    // Actualizar la contraseña encriptada
    const updatedUser = await this.userModel.findByIdAndUpdate(id, { password: hashedPassword }, { new: true }).lean().exec();

    if (!updatedUser) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.mapToUserInterface(updatedUser);
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }
    return this.mapToUserInterface(user);
  }

  private mapToUserInterface(userDoc: any): User {
    return {
      id: userDoc._id ? userDoc._id.toString() : userDoc.id,
      email: userDoc.email,
      username: userDoc.username,
      password: userDoc.password,
      createdAt: userDoc.createdAt,
    };
  }
}