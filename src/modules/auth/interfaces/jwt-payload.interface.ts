import { Cart } from "src/shared/entities/cart.entity";

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


export interface RegisterCartUserResponse {
  success: true;
  message: string;
  data: {
    token: string;
    user: { id: number; username: string; email?: string; mobile?: string };
    cart?: Cart;
  };
}