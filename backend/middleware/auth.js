import jwt from 'jsonwebtoken';

// Protects a route. The frontend sends the token like this:
//   Authorization: Bearer <token>
export function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Please log in first.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });
    req.userEmail = payload.sub;
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Your session has expired. Please log in again.'
        : 'Invalid session. Please log in again.';
    res.status(401).json({ message });
  }
}

// For pages that anyone can open (like Browse Posts). If a valid token is
// sent we know who the user is, otherwise they are treated as a visitor.
export function optionalAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme === 'Bearer' && token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
      });
      req.userEmail = payload.sub;
    } catch {
      // expired or fake token: carry on as a visitor
    }
  }
  next();
}
