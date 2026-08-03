import { NextResponse, type NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
  const passkeyCookie = request.cookies.get('passkey_auth')?.value
  const { pathname } = request.nextUrl

  // Protect /dashboard route
  if (pathname.startsWith('/dashboard') && passkeyCookie !== 'true') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If authenticated user visits /login, send them to /dashboard
  if (pathname === '/login' && passkeyCookie === 'true') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}