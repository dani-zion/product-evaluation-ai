/**
 * Returns `next` when it is a same-site relative path, otherwise "/".
 * Rejects absolute URLs, protocol-relative URLs ("//evil.com") and the
 * backslash variant ("/\evil.com") that browsers also treat as another host.
 * Also rejects whitespace, control characters and backslashes anywhere:
 * browsers strip tabs and newlines from URLs, so "/\t/evil.com" would
 * become "//evil.com". Paths with spaces must be percent-encoded.
 */
export function getSafeRedirect(next: string | null | undefined): string {
  if (!next || !next.startsWith("/")) return "/";
  if (next.startsWith("//") || next.startsWith("/\\")) return "/";
  // biome-ignore lint/suspicious/noControlCharactersInRegex: rejecting them is the point
  if (/[\u0000-\u0020\u007f\\]/.test(next)) return "/";
  return next;
}
