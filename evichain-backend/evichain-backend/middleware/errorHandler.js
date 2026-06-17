/**
 * Centralised error handler — must be the LAST app.use() in server.js.
 * Express identifies it as an error handler because it has 4 arguments.
 */
export function errorHandler(err, _req, res, _next) {
  const status  = err.statusCode || 500;
  const message = err.message    || 'Internal Server Error';

  // Print stack only in dev
  if (process.env.NODE_ENV !== 'production') {
    console.error(`\n[EviChain Error] ${status} — ${message}`);
    if (err.stack) console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * Create a structured HTTP error.
 * @param {string} message
 * @param {number} statusCode
 * @returns {Error}
 */
export function createError(message, statusCode = 500) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}
