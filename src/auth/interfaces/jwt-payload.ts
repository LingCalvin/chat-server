export interface JwtPayload {
  exp: number;
  jti: string;
  sub: string;
  username: string;
}
