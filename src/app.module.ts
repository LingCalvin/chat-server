import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConversationsModule } from './conversations/conversations.module';

@Module({
  imports: [AuthModule, PrismaModule, ConversationsModule],
})
export class AppModule {}
