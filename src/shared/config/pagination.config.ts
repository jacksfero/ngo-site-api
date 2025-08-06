// constants/pagination.constants.ts

import { config } from 'dotenv';

config(); // Load .env

export const BLOG_LIMIT = parseInt(process.env.BLOG_LIMIT ?? '10');
export const BLOG_MAX_LIMIT = parseInt(process.env.BLOG_MAX_LIMIT ?? '100');
export const BLOG_PAGE = parseInt(process.env.BLOG_PAGE ?? '1');

export const USERS_LIMIT = parseInt(process.env.USERS_LIMIT ?? '55');
export const USERS_MAX_LIMIT = parseInt(process.env.USERS_MAX_LIMIT ?? '200');
export const USERS_PAGE = parseInt(process.env.USERS_PAGE ?? '1');



 
export const USERS_LIMITss = 60;
export const USERS_MAX_LIMITss = 200;
export const USERS_PAGEss = 1;



export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;
