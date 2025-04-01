import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserModel } from './schemas/user.schema';
import { PendingUser } from './schemas/pending-user.schema'; // Importa PendingUser
import { User, UserService as UserServiceInterface } from './interfaces/user.interface';
import { CreateUserDTO, UpdateUserDTO, UpdateUserPasswordDTO } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/email.service';
import { sendEmailDto } from 'src/email/dto/email.dto';
import { TwilioService } from 'src/twilio/twilio.service';

@Injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserDocument>,
    @InjectModel(PendingUser.name) private pendingUserModel: Model<PendingUser>, 
    private emailService: EmailService,
    private twilioService: TwilioService, 
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
  
    if (createUserDto.confirmationMethod !== 1 && createUserDto.confirmationMethod !== 2) {
      throw new NotFoundException('Método de confirmación no soportado');      
    }else if (createUserDto.confirmationMethod === 1) {
      // Verifica si el email ya está pendiente de confirmación
      const existingPendingUser = await this.pendingUserModel.findOne({ email: createUserDto.email });
      if (existingPendingUser) {
        throw new NotFoundException('Ya hay una solicitud pendiente para este email');
      } else{
            // Encripta la contraseña
            const salt = 10;
            const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
  
            // Genera un token de confirmación único para la confirmación de cuenta en 6 numeros
            const confirmationToken = Math.floor(100000 + Math.random() * 900000).toString(); // Genera un token de 6 dígitos

            // empieza el proceso de registro
            const pendingUser = new this.pendingUserModel({
              username: createUserDto.username, 
              email: createUserDto.email,
              password: hashedPassword,
              confirmationToken,
              phone: createUserDto.phone, 
            });
          await pendingUser.save();
          await this.sendConfirmationEmail(createUserDto.email, confirmationToken);
      }
    } else if (createUserDto.confirmationMethod === 2) {
        if (existingUser) {
          throw new NotFoundException('Ya hay una solicitud pendiente para este numero de telefono');
        }else{
          // Encripta la contraseña
          const salt = 10;
          const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
  
          // Genera un token de confirmación único para la confirmación de cuenta en 6 numeros
          const confirmationToken = Math.floor(100000 + Math.random() * 900000).toString(); // Genera un token de 6 dígitos

          // empieza el proceso de registro
          const pendingUser = new this.pendingUserModel({
            username: createUserDto.username, 
            email: createUserDto.email,
            password: hashedPassword,
            confirmationToken,
            phone: createUserDto.phone,
          });
          await pendingUser.save();
          await this.sendConfirmationSMS(createUserDto.phone, confirmationToken);
        }
            
    }
  }

  async confirmAccount(confirmAccountDto: { token: string }): Promise<User> {
    const { token } = confirmAccountDto;

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
        phone: pendingUser.phone, 
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px; background-color: #ffffff;">
        <h2 style="color: #333; text-align: center;">Verificación de cuenta</h2>
        <p style="color: #555; font-size: 16px;">Hola,</p>
        <p style="color: #555; font-size: 16px;">Gracias por registrarte. Para completar tu registro, por favor utiliza el siguiente código de verificación:</p>
        <div style="background-color: #f5f5f5; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; padding: 10px; border-radius: 5px; color: #333;">
          ${token}
        </div>
        <p style="color: #555; font-size: 16px;">Este código expirará en 5 minutos.</p>
        <p style="color: #555; font-size: 16px;">Si no has solicitado este registro, por favor ignora este correo.</p>
        <p style="color: #555; font-size: 16px;">Saludos,<br><strong>El equipo de soporte</strong></p>
      </div>
    `,
    };

    await this.emailService.sendEmail(emailDto);
  }

  private async sendConfirmationSMS(phoneNumber: string, token: string): Promise<void> {
    const messageBody = `Tu código de verificación es: ${token}`;
    try {
        await this.twilioService.sendSMS(phoneNumber, messageBody);
        console.log(`Código de verificación enviado a ${phoneNumber}`);
    } catch (error) {
        console.error(`Error al enviar el SMS:`, error);
        throw new Error('Error al enviar el mensaje SMS');
    }
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
      phone: userDoc.phone,
      createdAt: userDoc.createdAt,
      role: userDoc.role,
    };
  }
}