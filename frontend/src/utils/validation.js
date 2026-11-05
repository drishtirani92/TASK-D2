import { z } from 'zod';

const email = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, 'First name is required')
      .regex(/^[A-Za-z' -]+$/, 'First name can only contain letters'),
    lastName: z
      .string()
      .trim()
      .min(1, 'Last name is required')
      .regex(/^[A-Za-z' -]+$/, 'Last name can only contain letters'),
    email,
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password needs an uppercase letter')
      .regex(/[a-z]/, 'Password needs a lowercase letter')
      .regex(/[0-9]/, 'Password needs a number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Turns a Zod error into { fieldName: 'message' } for easy display.
export function getFieldErrors(error) {
  const errors = {};
  error.issues.forEach((issue) => {
    const key = issue.path[0];
    if (!errors[key]) errors[key] = issue.message;
  });
  return errors;
}
