import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./schema";

// Drizzle schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// Validation schemas
export const createUserSchema = z.object({
  id: z.string().min(1),
});

// Types
export type User = z.infer<typeof selectUserSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;
export type CreateUserRequest = z.infer<typeof createUserSchema>;
