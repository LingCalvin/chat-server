import { IsDefined, IsUUID } from 'class-validator';

export class SignalDto {
  @IsUUID()
  recipientId: string;
  @IsDefined()
  signalData: unknown;
}
