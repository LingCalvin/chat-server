import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CredentialsDto } from './dto/credentials.dto';
import { User } from '@prisma/client';
import { JwtPayload } from './interfaces/jwt-payload';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async validateCredentials({ username, password }: CredentialsDto) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (user === null || !(await argon2.verify(user.password, password))) {
      return null;
    }
    return user;
  }

  async signUp({ username, password }: CredentialsDto) {
    return this.prisma.user.create({
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
      data: {
        username,
        password: await argon2.hash(password, { type: argon2.argon2id }),
      },
    });
  }

  async signIn(user: Omit<User, 'password' | 'lastLogin'>) {
    const payload: Omit<JwtPayload, 'exp'> = {
      sub: user.id,
      username: user.username,
    };
    await this.prisma.user.update({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      data: { lastLogin: new Date() },
    });
    return this.jwt.sign(payload);
  }

  deleteAccount(id: string) {
    return this.prisma.user.delete({
      select: {
        id: true,
        username: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      where: { id },
    });
  }
}
