/**
 * Legacy Appwrite function entrypoint.
 *
 * ZippyGo checkout now uses the server-side PayFlow API instead of Cashfree.
 * This file is retained only for deployments that still reference the old
 * Appwrite function; it deliberately does not contain payment credentials.
 */
module.exports = async function (context) {
  return context.res.json({
    success: false,
    error: "This legacy payment function is disabled. Use the ZippyGo PayFlow backend endpoint.",
  }, 410);
};
