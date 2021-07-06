import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';

export function extractFromRequest(req: Request) {
  return ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    (req: Request) => req.cookies.accessToken,
  ])(req);
}
