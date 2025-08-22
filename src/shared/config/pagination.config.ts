// constants/pagination.constants.ts

import { config } from 'dotenv';

config(); // Load .env

export const BLOG_LIMIT = parseInt(process.env.BLOG_LIMIT ?? '10');
export const BLOG_MAX_LIMIT = parseInt(process.env.BLOG_MAX_LIMIT ?? '100');
export const BLOG_PAGE = parseInt(process.env.BLOG_PAGE ?? '1');

export const USERS_LIMIT = parseInt(process.env.USERS_LIMIT ?? '55');
export const USERS_MAX_LIMIT = parseInt(process.env.USERS_MAX_LIMIT ?? '200');
export const USERS_PAGE = parseInt(process.env.USERS_PAGE ?? '1');

export const PRODUCTS_LIMIT = parseInt(process.env.PRODUCTS_LIMIT ?? '55');
export const PRODUCTS_MAX_LIMIT = parseInt(process.env.PRODUCTS_MAX_LIMIT ?? '200');
export const PRODUCTS_PAGE = parseInt(process.env.PRODUCTS_PAGE ?? '1');

export const FRONT_INVENT_PRODUCTS_LIMIT = parseInt(process.env.FRONT_INVENT_PRODUCTS_LIMIT ?? '55');
export const FRONT_INVENT_PRODUCTS_MAX_LIMIT = parseInt(process.env.FRONT_INVENT_PRODUCTS_MAX_LIMIT ?? '200');
export const FRONT_INVENT_PRODUCTS_PAGE = parseInt(process.env.FRONT_INVENT_PRODUCTS_PAGE ?? '1');


 
export const INVENTORY_LIMIT = parseInt(process.env.INVENTORY_LIMIT ?? '55');
export const INVENTORY_MAX_LIMIT = parseInt(process.env.INVENTORY_MAX_LIMIT ?? '200');
export const INVENTORY_PAGE = parseInt(process.env.INVENTORY_PAGE ?? '1');

export const ORDER_LIMIT = parseInt(process.env.ORDER_LIMIT ?? '55');
export const ORDER_MAX_LIMIT = parseInt(process.env.ORDER_MAX_LIMIT ?? '200');
export const ORDER_PAGE = parseInt(process.env.ORDER_PAGE ?? '1');

 



  
export const USERS_LIMITss = 60;
export const USERS_MAX_LIMITss = 200;
export const USERS_PAGEss = 1;

 
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

