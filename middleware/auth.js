/**
 * Middleware: require artist to be logged in.
 * Redirects to /login if not authenticated.
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.artistId) {
    return next();
  }
  res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
}

module.exports = { requireAuth };
