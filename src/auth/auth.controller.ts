import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { ApiAuthenticatedEndpoint } from '../common/decorators/api-authenticated-endpoint.decorator';
import { ApiErrorResponse } from '../common/decorators/api-error-response.decorator';
import { ApiFailedValidationResponse } from '../common/decorators/api-failed-validation-response.decorator';
import { ApiInsufficientPermissionsResponse } from '../common/decorators/api-insufficient-permissions-response.decorator';
import { AuthService } from './auth.service';
import { AccountIdDto } from './dto/account-id.dto';
import { CredentialsDto } from './dto/credentials.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthenticatedRequest } from './interfaces/authenticated-request';
import { SignInResponse } from './responses/sign-in.response';
import { FailedAuthenticationSchema } from './schema/failed-authentication.schema';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Sign in using username and password' })
  @ApiOkResponse({
    description: 'The client has successfully authenticated.',
    type: SignInResponse,
  })
  @ApiBadRequestResponse({
    description: `The client's attempt to authenticate was unsuccessful.`,
    schema: FailedAuthenticationSchema,
  })
  async signIn(
    @Req() req: Omit<AuthenticatedRequest, 'jwtPayload'>,
    @Body() {}: CredentialsDto,
  ): Promise<SignInResponse> {
    const accessToken = await this.auth.signIn(req.user);
    const { id, username, createdAt, updatedAt } = req.user;
    return { accessToken, user: { id, username, createdAt, updatedAt } };
  }

  @Post('sign-up')
  @ApiOperation({ summary: 'Register a new account' })
  @ApiCreatedResponse({
    description: 'The account was successfully registered.',
  })
  @ApiFailedValidationResponse()
  @ApiErrorResponse({
    status: HttpStatus.CONFLICT,
    description: 'An account with the specified username already exists.',
  })
  async signUp(
    @Body() dto: CredentialsDto,
  ): Promise<Omit<User, 'password' | 'lastLogin'>> {
    try {
      return await this.auth.signUp(dto);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException();
      }
      throw new InternalServerErrorException();
    }
  }

  @Post('delete-account')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an account' })
  @ApiAuthenticatedEndpoint()
  @ApiOkResponse({ description: 'The account has been deleted' })
  @ApiInsufficientPermissionsResponse()
  deleteAccount(
    @Req() req: AuthenticatedRequest,
    @Body() { id }: AccountIdDto,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException();
    }
    return this.auth.deleteAccount(id);
  }
}
