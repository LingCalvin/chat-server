import { ApiProperty } from '@nestjs/swagger';

export class SignUpResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}
