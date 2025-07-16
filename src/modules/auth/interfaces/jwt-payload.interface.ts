export interface JwtPayload {
  //   username: string;
  //   sub: number; // this is user ID
  //   roles: string[];

  // custom payload
  sub: number; // 👈 your custom name instead of 'sub'
  username: string;
  roles: string[]; // optional, if you include it in token
  permissions?: string; // optional if needed
}
