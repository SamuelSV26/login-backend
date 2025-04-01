import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { TwilioModule } from './twilio/twilio.module';
import { ProductsModule } from './products/products.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Obtener la URI del ConfigService pero usar las opciones de databaseConfig
        const uri = configService.get('MONGODB_URI');
        return {
          uri,
          ...databaseConfig.options,
        };
      },
    }),
    UserModule,
    AuthModule,
    EmailModule,
    TwilioModule,
    ProductsModule,
  ],
})
export class AppModule {}
