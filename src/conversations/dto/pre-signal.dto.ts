import { IsIn, IsUUID } from 'class-validator';

export class PreSignalDto {
  @IsIn(['initiate', 'accept'])
  type: 'initiate' | 'accept';

  @IsUUID()
  recipientId: string;
}
