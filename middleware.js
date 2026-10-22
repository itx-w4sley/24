import {NextResponse} from 'next/server';

// Vercel overwrites this header with the connecting PUBLIC IP.
// Never allow a client-supplied query parameter or cookie to bypass maintenance.
function clientPublicIp(request){
  return (request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || '')
    .split(',')[0].trim();
}

function allowedMaintenanceIp(request){
  const client=clientPublicIp(request);
  const ips=(process.env.STUDIO_MAINTENANCE_ADMIN_IPS || '')
    .split(',').map(ip=>ip.trim()).filter(Boolean);
  return !!client && ips.includes(client);
}

function isAdminWorkPath(path){
  // Don't whitelist /portal, /start, /commission or other public pages.
  return path==='/admin'||path.startsWith('/admin/') ||
    path==='/login'||path==='/401'||path==='/403'||path==='/session-expired'||
    path.startsWith('/api/auth/')||path.startsWith('/api/admin/')||
    path.startsWith('/api/app/'); // Admin's notifications and order messaging.
}

export function middleware(request){
  if(process.env.STUDIO_MAINTENANCE_MODE!=='1')return NextResponse.next();
  const path=request.nextUrl.pathname;
  if(path==='/maintenance')return NextResponse.next();
  if(allowedMaintenanceIp(request) && isAdminWorkPath(path))return NextResponse.next();

  // During maintenance, public APIs must NOT accept or process orders.
  if(path.startsWith('/api/')){
    return NextResponse.json({
      error:'The studio is undergoing maintenance. Please try again later.',
      code:'STUDIO_MAINTENANCE'
    },{status:503,headers:{'Retry-After':'300','Cache-Control':'no-store'}});
  }

  const response=NextResponse.rewrite(new URL('/maintenance',request.url),{status:503});
  response.headers.set('Retry-After','300');
  response.headers.set('Cache-Control','no-store');
  response.headers.set('X-Robots-Tag','noindex, nofollow');
  return response;
}

// Static assets stay available so the maintenance/admin pages render correctly.
export const config={matcher:['/((?!_next/|assets/|favicon.ico|robots.txt|sitemap.xml|.*\\.[a-zA-Z0-9]{2,8}$).*)']};
