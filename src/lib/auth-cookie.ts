export function isSecureAuthCookie() {
  return process.env.COOKIE_SECURE === "true";
}
