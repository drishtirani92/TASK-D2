import express from 'express';
import { ZodError } from 'zod';
import { upgradeSchema, fieldErrors } from '../utils/validation.js';
import {
  findUser,
  upgradeToPaid,
  toPublicUser,
} from '../services/userService.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/plan/upgrade
// { billingCycle: "monthly" | "yearly", card: { name, number, expiry, cvc } }
router.post('/upgrade', requireAuth, async (req, res) => {
  try {
    const { billingCycle } = upgradeSchema.parse(req.body);

    const user = await findUser(req.userEmail);
    if (!user) {
      return res
        .status(401)
        .json({ message: 'Account not found. Please log in again.' });
    }

    if ((user.plan || 'free') === 'paid') {
      return res
        .status(409)
        .json({ message: 'You are already on the Paid plan.' });
    }

    // This is a demo, so no real payment is taken. The card details are only
    // checked and then thrown away: they are never saved or logged.
    await upgradeToPaid(req.userEmail, billingCycle);

    const updated = await findUser(req.userEmail);
    res.status(200).json({
      message: 'Payment successful. Welcome to the Paid plan!',
      user: toPublicUser(updated),
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: err.issues[0].message, errors: fieldErrors(err) });
    }
    console.error('Upgrade failed:', err.message);
    res.status(500).json({ message: 'Something went wrong on the server.' });
  }
});

export default router;
