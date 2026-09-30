import { z } from "zod";

const email = z
  .string({ error: "Required" })
  .trim()
  .toLowerCase()
  .pipe(z.email("Invalid email"));

export const registerSchema = z
  .object({
    username: z
      .string({ error: "Required" })
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must be at most 50 characters"),
    email,
    password: z
      .string({ error: "Required" })
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters"),
    password_confirmation: z.string({ error: "Required" }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export const loginSchema = z.object({
  email,
  password: z.string({ error: "Required" }).min(1, "Required"),
});
