export default function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      code: err.status || 500,
      message: err.message || "Internal Server Error"
    }
  });
}