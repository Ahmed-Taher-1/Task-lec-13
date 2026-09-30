import jwt from "jsonwebtoken";
import { COOKIE_NAME, JWT_SECRET } from "../config.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token =
    req.cookies?.[COOKIE_NAME] ??
    (header?.startsWith("Bearer ") ? header.slice(7) : undefined);

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
    };
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}
