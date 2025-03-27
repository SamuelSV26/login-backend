import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UserDTO{
    readonly username: string;
    readonly email: string;
    readonly password: string;
}

export class CreateUserDTO{
    @IsNotEmpty()
    @IsString()
    readonly username: string;

    @IsNotEmpty()
    @IsString()
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    readonly password: string;
}

export class UpdateUserDTO{
    @IsOptional()
    @IsString()
    readonly username?: string;

    @IsOptional()
    @IsString()
    readonly email?: string;
}

export class UpdateUserPasswordDTO {
    @IsNotEmpty()
    @IsString()
    readonly password: string;
}
