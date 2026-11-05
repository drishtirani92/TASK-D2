import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Please enter your email')
  .email('Please enter a valid email address');

// returns an error message, or an empty string if the email is fine
export function checkEmail(email) {
  const result = emailSchema.safeParse(email);
  if (result.success) {
    return '';
  }
  return result.error.issues[0].message;
}
