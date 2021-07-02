import { ApiProperty } from '@nestjs/swagger';
import { IsString, Max, Min } from 'class-validator';

export class CredentialsDto {
  /**
   * The user's username.
   */
  @IsString()
  @Min(3)
  @Max(256)
  username: string;
  /**
   * The user's password.
   */
  @IsString()
  @Min(8)
  @Max(256)
  @ApiProperty({ format: 'password' })
  password: string;
}
