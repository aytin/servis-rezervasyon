import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const userRole = request.cookies.get('user_role')?.value;
  const hasSession = request.cookies.has('session');

  // 1. Yönetici Sayfaları Koruması (/admin)
  if (path.startsWith('/admin')) {
    if (!hasSession || userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Şoför Sayfaları Koruması (/sofor)
  if (path.startsWith('/sofor')) {
    if (!hasSession || userRole !== 'DRIVER') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 3. Müşteri/Kullanıcı Sayfaları Koruması (/musteri)
  if (path.startsWith('/musteri')) {
    if (!hasSession || (userRole !== 'USER' && userRole !== 'ADMIN')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/sofor/:path*', '/musteri/:path*'],
};