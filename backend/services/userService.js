import { getDb, FieldValue } from './firebase.js';

export class EmailTakenError extends Error {
  constructor() {
    super('EMAIL_TAKEN');
    this.name = 'EmailTakenError';
  }
}

const users = () => getDb().collection('users');

// The lower-cased email is the document ID, so two accounts can never
// share an email address.
export const emailKey = (email) => email.trim().toLowerCase();

export async function findUser(email) {
  const snapshot = await users().doc(emailKey(email)).get();
  return snapshot.exists ? snapshot.data() : null;
}

export async function createUser({ firstName, lastName, email, passwordHash }) {
  try {
    // create() fails if the document already exists, which also protects
    // us when two people sign up with the same email at the same moment
    await users().doc(emailKey(email)).create({
      firstName,
      lastName,
      email: emailKey(email),
      passwordHash, // only the bcrypt hash is stored, never the password
      plan: 'free',
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    // 6 is the gRPC code for ALREADY_EXISTS
    if (err.code === 6 || err.code === 'already-exists') {
      throw new EmailTakenError();
    }
    throw err;
  }
}

export async function upgradeToPaid(email, billingCycle) {
  await users().doc(emailKey(email)).update({
    plan: 'paid',
    billingCycle,
    upgradedAt: FieldValue.serverTimestamp(),
  });
}

// What the frontend is allowed to see. The password hash never leaves the server.
export function toPublicUser(data) {
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    plan: data.plan || 'free', // accounts made before D1 have no plan field
  };
}
