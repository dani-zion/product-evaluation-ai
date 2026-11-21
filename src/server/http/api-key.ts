import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/**
 * True when the request carries `Authorization: Bearer <expectedKey>`.
 * Both sides are hashed first so the comparison takes the same time whatever
 * the length or content of the given key. An unset key rejects every request.
 */
export function hasValidApiKey(
  request: Request,
  expectedKey: string | undefined,
): boolean {
  if (!expectedKey) return false;

  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) return false;

  return timingSafeEqual(digest(match[1]), digest(expectedKey));
}
