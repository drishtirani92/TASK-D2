import { z } from 'zod';

const digitsOnly = (value) => value.replace(/[\s-]/g, '');

// Luhn algorithm: the check that real card numbers pass
function passesLuhn(number) {
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
function notExpired(expiry) {
  const [month, year] = expiry.split('/').map(Number);
  return new Date(2000 + year, month, 1) > new Date();
}

export const cardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter the name on the card')
    .max(60, 'Name on card is too long')
    .regex(/^[A-Za-z' .-]+$/, 'Name can only contain letters'),
  number: z
    .string()
    .min(1, 'Card number is required')
    .refine(
      (v) => /^\d{13,19}$/.test(digitsOnly(v)),
      'Card number must be 13 to 19 digits',
    )
    .refine((v) => passesLuhn(digitsOnly(v)), 'Card number is not valid'),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Use the format MM/YY')
    .refine((v) => notExpired(v), 'This card has expired'),
  cvc: z.string().regex(/^\d{3,4}$/, 'CVC must be 3 or 4 digits'),
});

// "42424242" -> "4242 4242"
export function formatCardNumber(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

// "1228" -> "12/28"
export function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
