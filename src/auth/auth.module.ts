import { UserModule } from './../user/user.module';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    // Importa el módulo de Passport y lo configura para usar JWT
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      // Importa el módulo de JWT y lo configura con una clave secreta y un tiempo de expiración de 1 hora
      secret: '1234',
      signOptions: {
        expiresIn: '1h'
      }
    }),
    UserModule,
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule]
})
export class AuthModule {}
