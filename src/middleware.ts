import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  if (!token && !request.nextUrl.pathname.startsWith('/docnum/api/auth') && !request.nextUrl.pathname.startsWith('/docnum/auth/access-denied')) {
    return NextResponse.redirect(new URL('/docnum/auth/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/docnum', '/docnum/generate', '/docnum/query', '/docnum/admin', '/docnum/api/:path*'],
};