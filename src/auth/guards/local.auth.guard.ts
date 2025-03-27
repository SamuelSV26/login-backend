import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


// Define el guardia de autenticación local (con usuario y contraseña)
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}