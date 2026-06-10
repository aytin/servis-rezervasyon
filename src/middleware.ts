import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('admin_session')?.value;
  const { pathname } = request.nextUrl;

  // Eğer kullanıcı /admin sayfalarına gitmeye çalışıyorsa VE giriş çerezi yoksa
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!session || session !== 'true') {
      // Şifre girme sayfasına postala
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Eğer zaten giriş yapmışsa ve tekrar login sayfasına girmeye çalışıyorsa ana panele gönder
  if (pathname === '/admin/login' && session === 'true') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

// Middleware'in hangi sayfalarda tetikleneceğini belirliyoruz
export const config = {
  matcher: ['/admin/:path*'],
}