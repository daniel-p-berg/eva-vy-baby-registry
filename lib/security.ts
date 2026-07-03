import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const ADMIN_COOKIE = "eva_vy_admin";

function secureCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function signingKey() {
  return [
    process.env.ADMIN_SECRET,
    process.env.ADMIN_PASSWORD,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  ].join("|");
}

function hmac(value: string) {
  return createHmac("sha256", signingKey()).update(value).digest("base64url");
}

export function isValidAdminSecret(secret: string) {
  const expected = process.env.ADMIN_SECRET;
  return Boolean(expected && secureCompare(secret, expected));
}

export function isValidAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected && secureCompare(password, expected));
}

export function createAdminSessionToken(secret: string) {
  return hmac(`admin:${secret}`);
}

export function isValidAdminSession(secret: string, token?: string) {
  return Boolean(token && secureCompare(token, createAdminSessionToken(secret)));
}

export function signReceipt(claimId: string) {
  return hmac(`receipt:${claimId}`);
}

export function verifyReceipt(claimId: string, token?: string) {
  return Boolean(token && secureCompare(token, signReceipt(claimId)));
}

export { ADMIN_COOKIE };
