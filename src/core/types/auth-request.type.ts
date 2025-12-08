 

import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number | string;
  };
  cookies: Record<string, any>; // ✅ MUST NOT be optional
}