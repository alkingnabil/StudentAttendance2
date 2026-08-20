function notFound(req, res) {
  res.status(404).json({ message: 'المسار غير موجود' });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);
  const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
  res.status(status).json({ message: err.message || 'حدث خطأ غير متوقع' });
}

module.exports = { notFound, errorHandler };
