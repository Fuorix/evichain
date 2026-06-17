import jwt from 'jsonwebtoken';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    throw new Error('JWT_SECRET is missing from .env');
  }
  return secret;
}

/**
 * Express middleware — verifies JWT Bearer token.
 * Attaches decoded payload to req.user on success.
 */
export function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication token required' });
  }

  const token = header.split(' ')[1];

  try {
    req.user = jwt.verify(token, getJwtSecret());
    next();
  } catch (err) {
    if (err.message === 'JWT_SECRET is missing from .env') {
      return res.status(500).json({ success: false, message: err.message });
    }

    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

/**
 * Sign and return a JWT for the given payload.
 * @param {object} payload
 * @returns {string}
 */
export function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/**
 * Authorize only specific roles.
 * Usage: router.post('/submit', authenticate, requireRoles('police_officer'), ...)
 */
export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    const role = String(req.user?.role || '').toLowerCase();
    if (!allowedRoles.map((value) => String(value).toLowerCase()).includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
}
