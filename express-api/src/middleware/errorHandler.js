/**
 * Global error handler middleware
 */

export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // SQLite constraint errors
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({
      success: false,
      error: 'Database constraint violation',
      message: err.message,
    });
  }

  // Generic server error
  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    error: message,
  });
}
