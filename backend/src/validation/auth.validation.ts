import z from "zod";

/**
 * Validation schema for login credentials
 */
export const loginSchema = z.object({
 username: z
 .string()
 .trim()
 .min(3, 'Username must be at least 3 characters')
 .max(50, 'Username must not exceed 50 characters'),

 password: z
 .string()
 .min(8, 'Password must be at least 8 characters')
 .max(100, 'Password must not exceed 100 characters'),
});

/**
 * Type inference from Zod schema
 */
export type LoginValidated = z.infer<typeof loginSchema>;