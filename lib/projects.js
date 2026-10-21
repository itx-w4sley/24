export const CATEGORIES = ['Banners','Generic Banners','Logos','Posters','Photography'];
export const LEGACY_ARTWORK = {
  'Banners':['banner1','banner2','banner3','TechuraSolutionsC2_Dashboard','TechuraSolutions_Assistance','ProfileBanners','Australia Roleplay Banners','DO NOT TOUCH CHRP','TECHURA_WRAPPED'],
  'Generic Banners':['wasleygeneric1','wasleygeneric2','Australia Roleplay_Banner1','Port (1)','Techura Celebration 1 Year','Branding'],
  'Logos':['AussieRP_LOGO1','SydneyRoleplayLogo','TechuraSolutions','AusRP','JRTT','wasleylogo5'],
  'Posters':['wasleyposter1_dubai','wasleyposter2_aus','wasleyposter3_sydney'],
  'Photography':['Photo1','Photo2','photo3','photo4','photo5','photo6','photo7','photo8','photo9']
};
export const slugify = (s='') => String(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,96);
export const demoProjects = Object.entries(LEGACY_ARTWORK).flatMap(([category,names],g)=>names.map((name,i)=>({
  _id:`legacy-${g}-${i}`, slug: `${slugify(name)}-${g}-${i}`,
  name:name.replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim(),
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
