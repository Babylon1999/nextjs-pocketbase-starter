import Cookies from "js-cookie";

// PocketBase URL
export const PB_URL =
  // to make TS happy
  process.env.NEXT_PUBLIC_POCKETBASE_URL || "";

// Cookie config - strict and HTTPS only
const TOKEN_COOKIE = "pb_token";
const COOKIE_OPTIONS = {
  expires: 7,
  sameSite: "strict" as const,
  secure: true, // HTTPS only
};

// Get token from cookie
export function getToken(): string | null {
  return Cookies.get(TOKEN_COOKIE) || null;
}

// Save token to cookie
export function saveToken(token: string): void {
  Cookies.set(TOKEN_COOKIE, token, COOKIE_OPTIONS);
}

// Clear token (logout)
export function clearToken(): void {
  Cookies.remove(TOKEN_COOKIE);
}

// Check if authenticated
export function isAuthenticated(): boolean {
  return !!getToken();
}
