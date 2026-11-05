import { z } from 'zod';

const email = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .max(254, 'Email is too long')
  .email('Please enter a valid email address');

const name = (label) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(50, `${label} is too long`)
    .regex(/^[A-Za-z' -]+$/, `${label} can only contain letters`);

export const subscribeSchema = z.object({ email });

export const registerSchema = z
  .object({
    firstName: name('First name'),
    lastName: name('Last name'),
    email,
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be 72 characters or less') // bcrypt limit
      .regex(/[A-Z]/, 'Password needs an uppercase letter')
      .regex(/[a-z]/, 'Password needs a lowercase letter')
      .regex(/[0-9]/, 'Password needs a number'),
    confirmPassword: z.string({ required_error: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email,
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

// ---- posts ----

const title = z
  .string({ required_error: 'Title is required' })
  .trim()
  .min(5, 'Title must be at least 5 characters')
  .max(100, 'Title must be 100 characters or less');

const tags = z
  .array(z.string().trim().min(1).max(20, 'Each tag must be 20 characters or less'))
  .min(1, 'Please add at least one tag')
  .max(3, 'You can add up to 3 tags');

// who is allowed to read the post
const plan = z.enum(['free', 'paid'], {
  errorMap: () => ({ message: 'Choose Free or Paid for this post' }),
});

export const postSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('question'),
    plan,
    title,
    description: z
      .string({ required_error: 'Description is required' })
      .trim()
      .min(20, 'Please describe your problem in at least 20 characters')
      .max(5000, 'Description is too long'),
    tags,
  }),
  z.object({
    type: z.literal('article'),
    plan,
    title,
    abstract: z
      .string({ required_error: 'Abstract is required' })
      .trim()
      .min(20, 'Abstract must be at least 20 characters')
      .max(300, 'Abstract must be 300 characters or less'),
    articleText: z
      .string({ required_error: 'Article text is required' })
      .trim()
      .min(50, 'Article text must be at least 50 characters')
      .max(20000, 'Article text is too long'),
    tags,
  }),
]);

// ---- payment (upgrade plan) ----

const digitsOnly = (value) => value.replace(/[\s-]/g, '');

// Luhn algorithm: the check that real card numbers pass
export function passesLuhn(number) {
  let sum = 0;
  let double = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = Number(number[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

// a card is valid until the end of the month printed on it
export function notExpired(expiry, now = new Date()) {
  const [month, year] = expiry.split('/').map(Number);
  return new Date(2000 + year, month, 1) > now;
}

export const upgradeSchema = z.object({
  billingCycle: z.enum(['monthly', 'yearly'], {
    errorMap: () => ({ message: 'Choose monthly or yearly billing' }),
  }),
  card: z.object({
    name: z
      .string({ required_error: 'Name on card is required' })
      .trim()
      .min(2, 'Enter the name on the card')
      .max(60, 'Name on card is too long')
      .regex(/^[A-Za-z' .-]+$/, 'Name can only contain letters'),
    number: z
      .string({ required_error: 'Card number is required' })
      .refine(
        (v) => /^\d{13,19}$/.test(digitsOnly(v)),
        'Card number must be 13 to 19 digits',
      )
      .refine((v) => passesLuhn(digitsOnly(v)), 'Card number is not valid'),
    expiry: z
      .string({ required_error: 'Expiry date is required' })
      .trim()
      .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Use the format MM/YY')
      .refine((v) => notExpired(v), 'This card has expired'),
    cvc: z
      .string({ required_error: 'CVC is required' })
      .regex(/^\d{3,4}$/, 'CVC must be 3 or 4 digits'),
  }),
});

// { fieldName: 'message' } so the frontend can show errors under each field
export function fieldErrors(zodError) {
  const errors = {};
  zodError.issues.forEach((issue) => {
    const key = issue.path[issue.path.length - 1];
    if (!errors[key]) errors[key] = issue.message;
  });
  return errors;
}
