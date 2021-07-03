import { Module, ModuleMetadata } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ConversationsGateway } from './conversations.gateway';

export const metadata: ModuleMetadata = {
  imports: [AuthModule],
  providers: [ConversationsGateway],
};
@Module(metadata)
export class ConversationsModule {}
