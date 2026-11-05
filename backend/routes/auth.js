import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import { registerSchema, loginSchema, fieldErrors } from '../utils/validation.js';
import {
  findUser,
  createUser,
  toPublicUser,
  EmailTakenError,
} from '../services/userService.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const SALT_ROUNDS = 10;

// Compared against when the email does not exist, so a login for an unknown
// email takes as long as a wrong password (stops "does this account exist?" guessing).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', SALT_ROUNDS);

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    await createUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
    });

    res
      .status(201)
      .json({ message: 'Account created! You can now log in.' });
  } catch (err) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: err.issues[0].message, errors: fieldErrors(err) });
    }
    // 409: the request was fine, but it clashes with an existing account
    if (err instanceof EmailTakenError) {
      return res
        .status(409)
        .json({ message: 'An account with this email already exists.' });
    }
    console.error('Register failed:', err.message);
    res.status(500).json({ message: 'Something went wrong on the server.' });
  }
});

// POST /api/auth/login  -> { token, user }
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await findUser(email);
    const isMatch = await bcrypt.compare(
      password,
      user ? user.passwordHash : DUMMY_HASH,
    );

    // same message for "no such email" and "wrong password" on purpose
    if (!user || !isMatch) {
      return res
        .status(401)
        .json({ message: 'Incorrect email or password.' });
    }

    // the signed JWT is the user's session
    const token = jwt.sign({ sub: user.email }, process.env.JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: process.env.JWT_EXPIRES_IN || '2h',
    });

    res.status(200).json({
      message: 'Logged in successfully.',
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: err.issues[0].message, errors: fieldErrors(err) });
    }
    console.error('Login failed:', err.message);
    res.status(500).json({ message: 'Something went wrong on the server.' });
  }
});

// GET /api/auth/me -> the current user, based on the token
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await findUser(req.userEmail);
    if (!user) {
      return res
        .status(401)
        .json({ message: 'Account not found. Please log in again.' });
    }
    res.status(200).json({ user: toPublicUser(user) });
  } catch (err) {
    console.error('Load user failed:', err.message);
    res.status(500).json({ message: 'Something went wrong on the server.' });
  }
});

export default router;
