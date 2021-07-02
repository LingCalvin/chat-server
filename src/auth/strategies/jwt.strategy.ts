import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedRequest } from '../interfaces/authenticated-request';
import { JwtPayload } from '../interfaces/jwt-payload';
import * as JwtUtils from '../utils/jwt.utils';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: JwtUtils.extractFromRequest,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: JwtPayload,
  ): Promise<AuthenticatedRequest['user']> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (user === null) {
      throw new UnauthorizedException();
    }
    return {
      ...user,
      jwtPayload: payload,
    };
  }
}
