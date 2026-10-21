import './globals.css';
import SiteShell from '@/components/SiteShell';
export const metadata={
  title:{default:'24xzvibx — Creative Studio',template:'%s | 24xzvibx'},
  description:'Creative portfolio, identity design, graphics, digital experiences and bespoke commissions.',
  openGraph:{type:'website',title:'24xzvibx Creative Studio',description:'A selected collection of digital work and ideas.'},
  robots:{index:true,follow:true}
};
export default function RootLayout({children}){return <html lang="en" suppressHydrationWarning><body><SiteShell>{children}</SiteShell></body></html>}
