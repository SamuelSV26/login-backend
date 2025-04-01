import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy} from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from "src/user/user.service";

//clase para la estrategia de autenticación con JWT
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(private readonly userService: UserService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            usernameField: 'email',
            secretOrKey: '1234'
        });
    }

    async validate(payload: any) {
      const user = await this.userService.findById(payload.sub);
      if (!user) {
          throw new UnauthorizedException('Usuario no encontrado');
      }
      return { id: user.id, username: user.username, role: user.role }; // Incluye el rol del usuario
  }
}