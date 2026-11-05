import express from 'express';
import { ZodError } from 'zod';
import { postSchema, fieldErrors } from '../utils/validation.js';
import { findUser } from '../services/userService.js';
import { savePost, listPosts, getPost } from '../services/postService.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// 'visitor' (not logged in), 'free' or 'paid'.
// The plan is read from Firestore every time, never from the token or the
// browser, so a user cannot give themselves access to paid posts.
async function getViewerPlan(email) {
  if (!email) return 'visitor';
  const user = await findUser(email);
  if (!user) return 'visitor';
  return user.plan === 'paid' ? 'paid' : 'free';
}

const canRead = (post, viewerPlan) =>
  post.plan === 'free' || viewerPlan === 'paid';

// first part of the text, for the list on the Browse Posts page
function makePreview(post) {
  const text =
    (post.type === 'article' ? post.abstract : post.description) || '';
  return text.length > 160 ? `${text.slice(0, 160).trim()}...` : text;
}

// The list only ever holds a short preview, never the whole post
function toListItem(post) {
  return {
    id: post.id,
    type: post.type,
    plan: post.plan,
    title: post.title,
    preview: makePreview(post),
    tags: post.tags,
    authorName: post.authorName,
    createdAt: post.createdAt,
  };
}

// the author's email is never sent to the browser, because visitors can
// open this page too
function toFullItem(post) {
  return {
    ...toListItem(post),
    description: post.description,
    abstract: post.abstract,
    articleText: post.articleText,
  };
}

// POST /api/posts  (must be logged in)
router.post('/', requireAuth, async (req, res) => {
  try {
    const post = postSchema.parse(req.body);

    const user = await findUser(req.userEmail);
    if (!user) {
      return res
        .status(401)
        .json({ message: 'Account not found. Please log in again.' });
    }

    const id = await savePost({
      ...post,
      authorId: user.email, // the user's ID (their Firestore document ID)
      authorName: `${user.firstName} ${user.lastName}`,
    });

    res.status(201).json({ message: 'Your post has been saved.', id });
  } catch (err) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: err.issues[0].message, errors: fieldErrors(err) });
    }
    console.error('Save post failed:', err.message);
    res.status(500).json({ message: 'Something went wrong on the server.' });
  }
});

// GET /api/posts  (anyone). Visitors and Free users get free posts only,
// Paid users get everything. Paid posts are removed here on the server, so a
// Free user never receives them at all.
router.get('/', optionalAuth, async (req, res) => {
  try {
    const viewerPlan = await getViewerPlan(req.userEmail);
    const all = await listPosts();
    const visible = all.filter((post) => canRead(post, viewerPlan));

    // the answer depends on who is asking, so it must never be cached
    res.set('Cache-Control', 'private, no-store');
    res.status(200).json({
      viewer: { plan: viewerPlan },
      // only a number, so the page can say "3 more posts with Paid"
      paidHidden: all.length - visible.length,
      posts: visible.map(toListItem),
    });
  } catch (err) {
    console.error('List posts failed:', err.message);
    res.status(500).json({ message: 'Something went wrong on the server.' });
  }
});

// GET /api/posts/:id  (anyone, but paid posts need a Paid plan)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    // Firestore IDs are plain letters and numbers
    if (!/^[A-Za-z0-9]{1,40}$/.test(req.params.id)) {
      return res.status(400).json({ message: 'Invalid post ID.' });
    }

    const post = await getPost(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const viewerPlan = await getViewerPlan(req.userEmail);
    if (!canRead(post, viewerPlan)) {
      return res.status(403).json({
        message: 'This is a Paid post. Upgrade your plan to read it.',
      });
    }

    res.set('Cache-Control', 'private, no-store');
    res.status(200).json({ post: toFullItem(post) });
  } catch (err) {
    console.error('Get post failed:', err.message);
    res.status(500).json({ message: 'Something went wrong on the server.' });
  }
});

export default router;
