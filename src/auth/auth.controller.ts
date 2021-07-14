import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { Response } from 'express';
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
import { SignUpResponse } from './responses/sign-up.response';
import { FailedAuthenticationSchema } from './schema/failed-authentication.schema';
import { v4 as uuidv4 } from 'uuid';
import { TicketResponse } from './responses/ticket.response';
import { OneTimeJwtPayload } from './interfaces/one-time-jwt-payload';
import { WhoAmIResponse } from './responses/who-am-i.response';
@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService, private jwt: JwtService) {}

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
    @Res({ passthrough: true }) res: Response,
    @Body() {}: CredentialsDto,
  ): Promise<SignInResponse> {
    const accessToken = await this.auth.signIn(req.user);
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
    const { id, username, createdAt, updatedAt } = req.user;
    return { id, username, createdAt, updatedAt };
  }

  @Post('sign-up')
  @ApiOperation({ summary: 'Register a new account' })
  @ApiCreatedResponse({
    description: 'The account was successfully registered.',
    type: SignUpResponse,
  })
  @ApiFailedValidationResponse()
  @ApiErrorResponse({
    status: HttpStatus.CONFLICT,
    description: 'An account with the specified username already exists.',
  })
  async signUp(@Body() dto: CredentialsDto): Promise<SignUpResponse> {
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

  @Post('tickets')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: TicketResponse })
  createTicket(@Req() req: AuthenticatedRequest): TicketResponse {
    const payload: Omit<OneTimeJwtPayload, 'exp'> = {
      jti: uuidv4(),
      sub: req.user.id,
      type: 'one-time',
      username: req.user.username,
    };
    const ticket = this.jwt.sign(payload, { expiresIn: '3m' });
    return { ticket };
  }

  @Get('who-am-i')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: WhoAmIResponse })
  whoAmI(@Req() req: AuthenticatedRequest): WhoAmIResponse {
    return req.user.jwtPayload;
  }
}
