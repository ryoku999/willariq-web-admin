import { z } from "zod";

export const loginSchema = z.object({
  dni: z.string(),
  password: z.string(),
});

export type LoginT = z.infer<typeof loginSchema>;
