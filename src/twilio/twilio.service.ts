import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwilioService {
    private twilioClient: Twilio;
    
    constructor(private configService: ConfigService) {
        const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
        
        this.twilioClient = new Twilio(accountSid, authToken);
    }
    
    async sendSMS(to: string, messageBody: string): Promise<void> {
        try {
            const message = await this.twilioClient.messages.create({
                body: messageBody,
                from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
                to: to,
            });
            console.log(`Mensaje enviado: ${message.sid}`);
        } catch (error) {
            console.error(`Detalles del error:`, error); // Imprime detalles del error
            throw new Error('Error al enviar el mensaje SMS');
        }
    }
}
