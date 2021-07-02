import { Module, ModuleMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';

export const metadata: ModuleMetadata = {
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    PrismaModule,
  ],
  exports: [AuthService, JwtModule],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  controllers: [AuthController],
};
@Module(metadata)
export class AuthModule {}
