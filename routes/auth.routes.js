import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createDB } from "../db.js";
import {
  COOKIE_MAX_AGE,
  COOKIE_NAME,
  JWT_EXPIRES_IN,
  JWT_SECRET,
} from "../config.js";
import { validateBody } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";

export const authRouter = Router();
const db = createDB();

const cookieOptions = {
  httpOnly: true, // JavaScript in the page can't read the token
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

function setAuthCookie(res, user) {
  const token = jwt.sign(
    { email: user.email, username: user.username },
    JWT_SECRET,
    { subject: user.id, expiresIn: JWT_EXPIRES_IN }
  );
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: COOKIE_MAX_AGE });
}

/**
 * @swagger /auth/login
 * POST /auth/login
 *
 * @description Authenticate a user with email and password.
 *   On success a JWT is sent in an httpOnly "token" cookie.
 *
 * @body {string} email - User's email address
 * @body {string} password - User's password
 *
 * @success {200} { message: string }
 *   Returns a success message on successful login.
 *
 * @error {401} { error: string }
 *   Wrong email or password.
 *   Example: { error: "Invalid email or password" }
 *
 * @error {422} { errors: { [field]: { errors: string[] } } }
 *   Validation failed (missing or invalid fields).
 *   Example: { errors: { email: { errors: ["Required"] }, password: { errors: ["Required"] } } }
 *
 * @error {500} { error: string }
 *   Internal server error.
 *   Example: { error: "something went wrong" }
 */
authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.validated;

  const users = await db.getAll("auth_users");
  const user = users.find((u) => u.email === email);

  // same message for unknown email and wrong password
  const valid = user && (await bcrypt.compare(password, user.passwordHash));
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  setAuthCookie(res, user);
  res.json({ message: "Logged in successfully" });
});

/**
 * @swagger /auth/register
 * POST /auth/register
 *
 * @description Register a new user account.
 *
 * @body {string} username - Desired username
 * @body {string} email - User's email address
 * @body {string} password - User's password
 * @body {string} password_confirmation - Password confirmation (must match password)
 *
 * @success {201} { message: string }
 *   Returns a success message on successful registration.
 *
 * @error {422} { errors: { [field]: { errors: string[] } } }
 *   Validation failed (missing fields, passwords don't match, or email already used).
 *   Example: { errors: { email: { errors: ["Email is already registered"] }, password_confirmation: { errors: ["Passwords do not match"] } } }
 *
 * @error {500} { error: string }
 *   Internal server error.
 *   Example: { error: "something went wrong" }
 */
authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  const { username, email, password } = req.validated;

  const users = await db.getAll("auth_users");
  if (users.some((u) => u.email === email)) {
    return res
      .status(422)
      .json({ errors: { email: { errors: ["Email is already registered"] } } });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.create("auth_users", {
    email,
    username,
    passwordHash,
    is_verified: false,
  });

  res.status(201).json({ message: "Registered successfully" });
});

/**
 * @swagger /auth/logout
 * POST /auth/logout
 *
 * @description Log out the current user by clearing the token cookie.
 *
 * @success {200} { message: string }
 *   Returns a success message on successful logout.
 *
 * @error {500} { error: string }
 *   Internal server error.
 *   Example: { error: "something went wrong" }
 */
authRouter.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.json({ message: "Logged out successfully" });
});
