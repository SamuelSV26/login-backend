import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// Define el guardia de autenticación JWT (con token)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}