import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// PocketBase URL
const PB_URL =
  // to make TS happy
  process.env.NEXT_PUBLIC_POCKETBASE_URL || "";

// Validate environment variable
if (!PB_URL) {
  console.error("NEXT_PUBLIC_POCKETBASE_URL environment variable is not set");
}

// Cookie name for authentication token
const TOKEN_COOKIE = "pb_token";

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  "/protected",
  "/protected/dashboard",
  "/protected/account",
];

// Public routes that should redirect to account if already authenticated
const PUBLIC_ROUTES = ["/auth/login", "/auth/signup", "/auth/reset-password"];

/**
 * Get token from request cookies
 */
function getTokenFromRequest(req: NextRequest): string | null {
  try {
    const token = req.cookies.get(TOKEN_COOKIE);
    return token?.value || null;
  } catch (error) {
    console.error("Error reading token from cookies:", error);
    return null;
  }
}

/**
 * Validate token freshness by calling PocketBase auth-refresh endpoint
 */
async function validateTokenFreshness(token: string): Promise<boolean> {
  try {
    // Add timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(
      `${PB_URL}/api/collections/users/auth-refresh`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    // Token is valid if we get a successful response (200-299)
    return response.ok;
  } catch (error) {
    // Network errors, timeouts, or other issues - treat as invalid token
    console.error("Token validation error:", error);
    return false;
  }
}

/**
 * Clear authentication token from response
 */
function clearAuthToken(response: NextResponse): NextResponse {
  response.cookies.delete(TOKEN_COOKIE);
  return response;
}

/**
 * Redirect to login with optional return URL
 */
function redirectToLogin(req: NextRequest, returnUrl?: string): NextResponse {
  const loginUrl = new URL("/login", req.url);

  // Only set returnUrl for protected routes, not for public routes
  if (
    returnUrl &&
    !returnUrl.startsWith("/auth/login") &&
    !returnUrl.startsWith("/auth/signup")
  ) {
    loginUrl.searchParams.set("returnUrl", returnUrl);
  }

  return NextResponse.redirect(loginUrl);
}

/**
 * Redirect to account page
 */
function redirectToAccount(req: NextRequest): NextResponse {
  const accountUrl = new URL("/protected/account", req.url);
  return NextResponse.redirect(accountUrl);
}

/**
 * Redirect to login page
 */
function redirectToLoginPage(
  req: NextRequest,
  returnUrl?: string
): NextResponse {
  const loginUrl = new URL("/auth/login", req.url);

  // Only set returnUrl for protected routes, not for public routes
  if (
    returnUrl &&
    !returnUrl.startsWith("/auth/login") &&
    !returnUrl.startsWith("/auth/signup")
  ) {
    loginUrl.searchParams.set("returnUrl", returnUrl);
  }

  return NextResponse.redirect(loginUrl);
}

/**
 * Check if the current request should be excluded from middleware
 */
function shouldExcludeFromMiddleware(pathname: string): boolean {
  // Exclude static files, API routes, and auth routes
  const excludedPatterns = [
    /^\/api\//,
    /^\/_next\//,
    /^\/static\//,
    /\.(ico|png|jpg|jpeg|gif|svg|css|js)$/,
    /^\/auth\//,
  ];

  return excludedPatterns.some((pattern) => pattern.test(pathname));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for excluded paths
  if (shouldExcludeFromMiddleware(pathname)) {
    return NextResponse.next();
  }

  const token = getTokenFromRequest(req);

  // Check if current path is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if current path is the home page
  const isHomePage = pathname === "/";

  // Check if current path is a public route that should redirect if authenticated
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Handle protected routes
  if (isProtectedRoute) {
    if (!token) {
      // No token - redirect to login with return URL
      return redirectToLoginPage(req, pathname);
    }

    // Validate token freshness for protected routes
    const isTokenValid = await validateTokenFreshness(token);
    if (!isTokenValid) {
      // Invalid token - clear it and redirect to login
      const response = redirectToLoginPage(req, pathname);
      return clearAuthToken(response);
    }

    // Token is valid - allow access to protected route
    return NextResponse.next();
  }

  // Handle home page for authenticated users - allow access without redirect
  if (isHomePage && token) {
    const isTokenValid = await validateTokenFreshness(token);
    if (!isTokenValid) {
      // Clear invalid token and stay on home page
      const response = NextResponse.next();
      return clearAuthToken(response);
    }
    // Token is valid - allow access to home page without redirect
    return NextResponse.next();
  }

  // Handle public routes (login, signup) when user is authenticated
  if (isPublicRoute && token) {
    // Validate token freshness for authenticated users on public routes
    const isTokenValid = await validateTokenFreshness(token);

    if (isTokenValid) {
      // Token is fresh - redirect to account page
      return redirectToAccount(req);
    } else {
      // Token is invalid - clear it and allow access to public route
      const response = NextResponse.next();
      return clearAuthToken(response);
    }
  }

  // For all other routes, just continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth routes
     */
    "/((?!api|_next/static|_next/image|favicon.ico|auth|.*\\..*).*)",
  ],
};
