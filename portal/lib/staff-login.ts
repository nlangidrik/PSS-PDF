/** Password form stands in for Google while the OAuth client is unset. */
export function staffPasswordLoginEnabled(): boolean {
  const id = process.env.GOOGLE_CLIENT_ID?.trim();
  const secret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  return !id || !secret;
}

/** Editor the staff member should land on. `/` when nginx serves it at the site root. */
export function editorPublicUrl(): string {
  return process.env.EDITOR_PUBLIC_URL?.trim() || "/";
}
