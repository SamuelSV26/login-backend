import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UserDTO{
    readonly role: string;
    readonly username: string;
    readonly email: string;
    readonly password: string;
    readonly phone: string; 
}

export class CreateUserDTO{
    @IsNotEmpty()
    @IsString()
    readonly role: string; 

    @IsNotEmpty()
    @IsString()
    readonly username: string;

    @IsNotEmpty()
    @IsString()
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    readonly password: string;

    @IsNotEmpty()
    @IsString()
    readonly phone: string; 

    @IsNotEmpty()
    @IsNumber()
    readonly confirmationMethod: number; // Puede ser 'email' o 'sms' (1 o 2)
}

export class UpdateUserDTO{
    @IsOptional()
    @IsString()
    readonly role?: string;

    @IsOptional()
    @IsString()
    readonly username?: string;

    @IsOptional()
    @IsString()
    readonly email?: string;

    @IsOptional()
    @IsString()
    readonly phone?: string;
}

export class UpdateUserPasswordDTO {
    @IsNotEmpty()
    @IsString()
    readonly password: string;
}

export class ConfirmAccountDTO {
    @IsNotEmpty()
    @IsString()
    token: string;
}
