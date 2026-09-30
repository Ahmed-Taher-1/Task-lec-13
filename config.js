export const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";
export const JWT_EXPIRES_IN = "1h";
export const COOKIE_NAME = "token";
export const COOKIE_MAX_AGE = 60 * 60 * 1000; 

if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is not set - using an insecure development secret.");
}
