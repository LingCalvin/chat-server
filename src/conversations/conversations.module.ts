import { Module, ModuleMetadata } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ConversationsController } from './conversations.controller';
import { ConversationsGateway } from './conversations.gateway';

export const metadata: ModuleMetadata = {
  imports: [AuthModule],
  providers: [ConversationsGateway],
  controllers: [ConversationsController],
};
@Module(metadata)
export class ConversationsModule {}
