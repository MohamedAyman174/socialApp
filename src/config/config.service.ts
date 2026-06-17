import {resolve} from "path";
import {config} from "dotenv";
import e from "express";
import { number } from "zod";


export const PORT = process.env.PORT || 3000;
export const MONGO_URI = process.env.MONGO_URI || ""
export const SALT_ROUNDS = number(process.env.SALT_ROUNDS || "");
export const EMAIL = process.env.EMAIL || "";
export const PASSWORD = process.env.PASSWORD || "";
export const REDIS_URL = process.env.REDIS_URL || "";
export const secret_key = process.env.secret_key;
export const prefix = process.env.prefix
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
export const REDIS_PORT = process.env.REDIS_PORT;
export const ACCESS_TOKEN_EXPIRE_TIME = process.env.ACCESS_TOKEN_EXPIRE_TIME || "15m";
export const REFRESH_TOKEN_EXPIRE_TIME = process.env.REFRESH_TOKEN_EXPIRE_TIME || "7d";
export const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY || "";
export const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || ""; 