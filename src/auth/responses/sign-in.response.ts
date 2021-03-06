import { ApiProperty } from '@nestjs/swagger';

export class SignInResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}
