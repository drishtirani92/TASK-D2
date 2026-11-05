import express from 'express';
import { ZodError } from 'zod';
import { subscribeSchema } from '../utils/validation.js';
import { sendWelcomeEmail, EmailError } from '../services/emailService.js';

const router = express.Router();

// POST /api/subscribe  { "email": "someone@example.com" }
router.post('/', async (req, res) => {
  try {
    const { email } = subscribeSchema.parse(req.body);

    await sendWelcomeEmail(email);

    res.status(200).json({
      message: `Thanks for subscribing! A welcome email has been sent to ${email}.`,
    });
  } catch (err) {
    // 400: the data we got was not valid
    if (err instanceof ZodError) {
      return res.status(400).json({ message: err.issues[0].message });
    }

    console.error('Subscribe failed:', err.message);

    // 502: our server is fine but the email API said no
    if (err instanceof EmailError && err.status !== 500) {
      return res.status(502).json({
        message:
          'We could not send the email right now. Please try again later.',
      });
    }

    // 500: anything else, like a missing API key
    res.status(500).json({ message: 'Something went wrong on the server.' });
  }
});

export default router;
