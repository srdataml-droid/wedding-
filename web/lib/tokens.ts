import "server-only";
import { createHash, randomBytes } from "node:crypto";

// Private links: a couple's edit link (D-010) and a vendor's shop link (D-012). Each carries a
// random token. The database stores only its SHA-256 hash and checks it in every function
// that reads or changes anything private.

export function newToken() {
  return randomBytes(24).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function isToken(value: string) {
  return /^[A-Za-z0-9_-]{32}$/.test(value);
}
