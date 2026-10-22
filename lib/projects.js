export const CATEGORIES = ['Discord Bots','Discord Servers','Websites','Web Apps','Branding','Banners','Generic Banners','Logos','Posters','Photography'];
export const LEGACY_ARTWORK = {
  'Banners':['banner1','banner2','banner3','TechuraSolutionsC2_Dashboard','TechuraSolutions_Assistance','ProfileBanners','Australia Roleplay Banners','DO NOT TOUCH CHRP','TECHURA_WRAPPED'],
  'Generic Banners':['wasleygeneric1','wasleygeneric2','Australia Roleplay_Banner1','Port (1)','Techura Celebration 1 Year','Branding'],
  'Logos':['AussieRP_LOGO1','SydneyRoleplayLogo','TechuraSolutions','AusRP','JRTT','wasleylogo5'],
  'Posters':['wasleyposter1_dubai','wasleyposter2_aus','wasleyposter3_sydney'],
  'Photography':['Photo1','Photo2','photo3','photo4','photo5','photo6','photo7','photo8','photo9']
};
// Display titles are separate from the original file basenames.
// Keep the keys unchanged so all /assets/<original filename>.png paths continue working.
// Edit a value below whenever you want a different public-facing title.
export const LEGACY_DISPLAY_TITLES = {
  'banner1': 'Banner Design 01',
  'banner2': 'Banner Design 02',
  'banner3': 'Banner Design 03',
  'TechuraSolutionsC2_Dashboard': 'Techura — Dashboard Design',
  'TechuraSolutions_Assistance': 'Techura — Assistance Graphic',
  'ProfileBanners': 'Profile Banner Collection',
  'Australia Roleplay Banners': 'Australia Roleplay — Banners',
  'DO NOT TOUCH CHRP': 'CHRP — Banner Artwork',
  'TECHURA_WRAPPED': 'Techura Wrapped — Event Artwork',
  'wasleygeneric1': 'Creative Banner 01',
  'wasleygeneric2': 'Creative Banner 02',
  'Australia Roleplay_Banner1': 'Australia Roleplay — Banner Design',
  'Port (1)': 'Port — Promotional Banner',
  'Techura Celebration 1 Year': 'Techura — First Anniversary',
  'Branding': 'Branding & Identity Artwork',
  'AussieRP_LOGO1': 'Aussie Roleplay — Logo Concept',
  'SydneyRoleplayLogo': 'Sydney Roleplay — Logo Design',
  'TechuraSolutions': 'Techura — Corporate Logo',
  'AusRP': 'Australia Roleplay — Identity Mark',
  'JRTT': 'JRTT — Logo Design',
  'wasleylogo5': 'Personal Branding — Logo Concept',
  'wasleyposter1_dubai': 'Dubai — Poster Design',
  'wasleyposter2_aus': 'Australia — Poster Design',
  'wasleyposter3_sydney': 'Sydney — Poster Design',
  'Photo1': 'Photography Collection — 01',
  'Photo2': 'Photography Collection — 02',
  'photo3': 'Photography Collection — 03',
  'photo4': 'Photography Collection — 04',
  'photo5': 'Photography Collection — 05',
  'photo6': 'Photography Collection — 06',
  'photo7': 'Photography Collection — 07',
  'photo8': 'Photography Collection — 08',
  'photo9': 'Photography Collection — 09'
};
export const slugify = (s='') => String(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,96);
export const demoProjects = Object.entries(LEGACY_ARTWORK).flatMap(([category,names],g)=>names.map((name,i)=>({
  _id:`legacy-${g}-${i}`, slug: `${slugify(name)}-${g}-${i}`,
  name:LEGACY_DISPLAY_TITLES[name] || name.replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim(),
  category, image:`/assets/${encodeURIComponent(name)}.png`,
  description:`${category} · selected work from the 24xzvibx creative archive.`,
  status:'published',featured:i===0,tags:[category,'Creative archive'],client:'',year:2026,
  tools:[],body:'',position:g*50+i,createdAt:'2026-01-01T00:00:00.000Z'
})));
export const initialServices = [
  {title:'Visual identities',slug:'visual-identities',icon:'sparkles',description:'Distinctive logos, brand systems, identity refreshes and launch-ready assets.',features:['Logos & symbols','Brand guidelines','Identity packs'],status:'published'},
  {title:'Digital experiences',slug:'digital-experiences',icon:'monitor',description:'Websites, dashboards, user interfaces and useful products with personality.',features:['UI/UX design','Web development','Interactive prototypes'],status:'published'},
  {title:'Creative assets',slug:'creative-assets',icon:'layers',description:'Banners, community graphics, promotional artwork and presentation kits.',features:['Social banners','Posters & key art','Custom game assets'],status:'published'}
];
export const seedNews=[{_id:'demo-news',title:'Creative Studio 5.0',slug:'creative-studio-5-0',summary:'A new space for selected work, creative commissions and studio updates.',body:'Welcome to the new studio. Explore the archive, browse services and enquire about a new commission.',status:'published',createdAt:'2026-10-22T00:00:00.000Z'}];