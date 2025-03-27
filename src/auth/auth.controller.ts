import { Controller, Post, Request, UseGuards, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local.auth.guard';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService, // Inyecta UserService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    // req.user contiene el usuario devuelto por LocalStrategy
    return this.authService.login(req.user);
  }

  @Get('confirm')
  async confirm(@Query('token') token: string) {
    const user = await this.userService.confirmAccount(token);
    return { message: 'Cuenta confirmada exitosamente', user };
  }
}