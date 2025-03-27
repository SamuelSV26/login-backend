import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Contraseña incorrecta');
      }
  
      // Devuelve el usuario sin la contraseña
      const { password: _, ...result } = user;
      return result;
    }
  
    async login(user: any) {
      // Asegúrate de que el objeto `user` tenga las propiedades necesarias
      if (!user || !user.email || !user.id) {
        throw new Error('Usuario no válido');
      }
  
      const payload = { email: user.email, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
  }

