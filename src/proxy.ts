import { NextRequest, NextResponse } from 'next/server';
// Ensure this utility is Edge-compatible (e.g., uses 'jose' rather than 'jsonwebtoken')
import { verifyToken } from '@/lib/auth_utils/jwtTokenUtil'; 

// 1. Define paths that DO NOT require authentication (Public Routes)
const PUBLIC_PATHS = ['/']; 

export default async function middleware(request: NextRequest) {
  
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get('session');
  const token = tokenCookie?.value;

  // 2. Redirect to Home if trying to access a protected route without a token
  if (!token && !PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. Prevent token verification on public pages to avoid infinite redirects
  if (token && PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  // 4. Verify the token for routes that require it
  if (token) {
    // Added 'await' in case your verifyToken is asynchronous
    const verificationResult = await Promise.resolve(verifyToken(token));

    // If verification fails, redirect to home
    if (!verificationResult || verificationResult.success !== true) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Allow the request to proceed if no redirects are triggered
  return NextResponse.next();
}

// 5. Use a matcher config so the middleware doesn't run on static files/images
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
