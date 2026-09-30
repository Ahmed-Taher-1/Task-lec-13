import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const homeRouter = Router();

// every endpoint in this router requires a valid JWT
homeRouter.use(requireAuth);

/**
 * @swagger /api/home
 * GET /api/home
 *
 * @description Retrieve the home page message. Requires authentication.
 *
 * @success {200} { message: string }
 *   Returns the welcome message.
 *   Example: { message: "Welcome to the home page!" }
 *
 * @error {401} { error: string }
 *   User is not authenticated.
 *   Example: { error: "Unauthorized" }
 *
 * @error {500} { error: string }
 *   Internal server error.
 *   Example: { error: "something went wrong" }
 */
homeRouter.get("/home", (req, res) => {
  res.json({ message: `Welcome to the home page, ${req.user.username}!` });
});
