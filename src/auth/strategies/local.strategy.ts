import { Strategy } from 'passport-local'; // Importa Strategy desde passport-local
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

// Define la estrategia de autenticación local (con usuario y contraseña)
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email', // Define el campo que se usará como nombre de usuario (en este caso, email)
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return user; // Devuelve el usuario válido
  }
}