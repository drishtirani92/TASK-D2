import { z } from 'zod';

const title = z
  .string()
  .trim()
  .min(5, 'Title must be at least 5 characters')
  .max(100, 'Title must be 100 characters or less');

const tags = z
  .array(z.string().max(20, 'Each tag must be 20 characters or less'))
  .min(1, 'Please add at least one tag')
  .max(3, 'You can add up to 3 tags');

const plan = z.enum(['free', 'paid'], {
  errorMap: () => ({ message: 'Choose Free or Paid for this post' }),
});

const questionSchema = z.object({
  plan,
  title,
  description: z
    .string()
    .trim()
    .min(20, 'Please describe your problem in at least 20 characters'),
  tags,
});

const articleSchema = z.object({
  plan,
  title,
  abstract: z
    .string()
    .trim()
    .min(20, 'Abstract must be at least 20 characters')
    .max(300, 'Abstract must be 300 characters or less'),
  articleText: z
    .string()
    .trim()
    .min(50, 'Article text must be at least 50 characters'),
  tags,
});

// "react, hooks" -> ['react', 'hooks']
export function splitTags(text) {
  return text
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t !== '');
}

// Checks the form for the chosen post type and returns any error messages
export function validatePost(type, form) {
  let result;

  if (type === 'question') {
    result = questionSchema.safeParse({
      plan: form.plan,
      title: form.title,
      description: form.description,
      tags: splitTags(form.tags),
    });
  } else {
    result = articleSchema.safeParse({
      plan: form.plan,
      title: form.title,
      abstract: form.abstract,
      articleText: form.articleText,
      tags: splitTags(form.tags),
    });
  }

  if (result.success) {
    return { ok: true, errors: {} };
  }

  const errors = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0];
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  });
  return { ok: false, errors };
}
