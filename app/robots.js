export default function robots(){return {rules:[{userAgent:'*',allow:'/',disallow:['/admin','/portal','/api/']}],sitemap:(process.env.SITE_URL||'http://localhost:3000')+'/sitemap.xml'}}
