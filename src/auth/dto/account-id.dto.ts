import { IsUUID } from 'class-validator';

export class AccountIdDto {
  @IsUUID()
  id: string;
}
