// Sends the welcome email using the Mailjet email API (Send API v3.1).
// The url can be changed in .env, which is handy for testing.
const EMAIL_API_URL =
  process.env.EMAIL_API_URL || 'https://api.mailjet.com/v3.1/send';

export class EmailError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'EmailError';
    this.status = status;
  }
}

export async function sendWelcomeEmail(to) {
  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;
  const sender = process.env.EMAIL_FROM;

  if (!apiKey || !secretKey || !sender) {
    throw new EmailError(
      'MAILJET_API_KEY, MAILJET_SECRET_KEY or EMAIL_FROM is missing in the .env file',
      500,
    );
  }

  // Mailjet uses basic auth: the api key is the username, the secret key the password
  const login = Buffer.from(`${apiKey}:${secretKey}`).toString('base64');

  const response = await fetch(EMAIL_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${login}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Messages: [
        {
          From: { Email: sender, Name: 'DEV@Deakin' },
          To: [{ Email: to }],
          Subject: 'Welcome to the DEV@Deakin Daily Insider',
          TextPart:
            'Thanks for subscribing to the DEV@Deakin Daily Insider! Every day we will send you new articles, tutorials and questions from the community.',
          HTMLPart: `
            <h2>Thanks for subscribing!</h2>
            <p>You are now signed up to the DEV@Deakin Daily Insider.</p>
            <p>Every day we will send you new articles, tutorials and questions from the community.</p>
            <p>- The DEV@Deakin team</p>
          `,
        },
      ],
    }),
  });

  // the task wants to see the status code from the email API in the terminal
  const data = await response.json().catch(() => ({}));
  console.log('Email API status:', response.status);
  console.log('Email API response:', JSON.stringify(data));

  const message = data.Messages?.[0];
  if (!response.ok || message?.Status === 'error') {
    const reason =
      data.ErrorMessage ||
      message?.Errors?.[0]?.ErrorMessage ||
      'Email API request failed';
    throw new EmailError(reason, response.status);
  }

  return data;
}
