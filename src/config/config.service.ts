export const PORT = process.env.PORT || 3000;
export const MONGO_URI = process.env.MONGO_URI || ""
export const SALT_ROUNDS = process.env.SALT_ROUNDS || "";
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


export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

export const AWS_REGION = process.env.AWS_REGION || "";
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "";
export const APPLICATION_NAME = process.env.APPLICATION_NAME || "social-app";