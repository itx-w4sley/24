import {NextResponse} from 'next/server';
/** Optional scheduled maintenance mode: set STUDIO_MAINTENANCE_MODE=1 in Vercel. */
export function middleware(request){
 if(process.env.STUDIO_MAINTENANCE_MODE!=='1')return NextResponse.next();
 const path=request.nextUrl.pathname;
 if(path==='/maintenance'||/\.[a-z0-9]{2,8}$/i.test(path))return NextResponse.next();
 const rewritten=NextResponse.rewrite(new URL('/maintenance',request.url),{status:503});
 rewritten.headers.set('Retry-After','3600');
 rewritten.headers.set('Cache-Control','no-store');
 return rewritten;
}
export const config={matcher:['/((?!api/|_next/|assets/|maintenance|favicon.ico|robots.txt|sitemap.xml).*)']};
