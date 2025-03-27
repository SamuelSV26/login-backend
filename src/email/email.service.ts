import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { sendEmailDto } from './dto/email.dto';

@Injectable()
export class EmailService {
    constructor(private readonly configService: ConfigService) {}

    emailTransporter() {
        const emailHost = this.configService.get<string>('EMAIL_HOST');
        const emailPort = this.configService.get<number>('EMAIL_PORT');
        const emailUser = this.configService.get<string>('EMAIL_USER');
        const emailPass = this.configService.get<string>('EMAIL_PASS');

        console.log('Email Host:', emailHost);
        console.log('Email Port:', emailPort);
        console.log('Email User:', emailUser);
        console.log('Email Pass:', emailPass ? '***' : 'undefined');

        const transporter = nodemailer.createTransport({
            host: emailHost,
            port: emailPort,
            secure: false, // Use true for port 465
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });
        return transporter;
    }

    async sendEmail(email: sendEmailDto) {
        const { recipients, subject, html } = email;
        const transporter = this.emailTransporter();
        const options: nodemailer.SendMailOptions = {
            from: this.configService.get<string>('EMAIL_USER'),
            to: recipients.join(','),
            subject: subject,
            html: html
        };

        console.log('Email options:', options);

        try {
            const info = await transporter.sendMail(options);
            console.log('Email sent:', info.response);
        } catch (error) {
            console.error('Error sending email:', error.message);
            throw new Error('Error sending email');
        }
    }
}