import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class sendEmailDto {
    @IsEmail({}, { each: true })
    readonly recipients: string[];

    @IsString()
    subject: string;

    @IsString()
    readonly html: string;
}