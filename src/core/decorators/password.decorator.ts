// validators/password.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { IsString, MinLength, Matches } from 'class-validator';

export function IsValidPassword() {
  return applyDecorators(
    IsString(),
    MinLength(8, { message: 'Password must be at least 8 characters long' }),
    Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, {
      message: 'Password must contain upper, lower case letters, and numbers',
    }),
  );
}
