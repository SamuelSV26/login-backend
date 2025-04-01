import { Controller, Post, Request, UseGuards, Get, Query, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local.auth.guard';
import { UserService } from '../user/user.service';
import { ConfirmAccountDTO } from 'src/user/dto/user.dto';
import { User } from 'src/user/interfaces/user.interface';

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

  @Post('confirm')
  async confirmAccount(@Body() confirmAccountDto: ConfirmAccountDTO): Promise<User> {
    return this.userService.confirmAccount(confirmAccountDto);
}
}