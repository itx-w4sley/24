export const BASE_SITE={
  studioName:'24xzvibx',tagline:'Designer. Developer. Digital creator.',
  heroTitle:'DIGITAL IDEAS. REAL IMPACT.',
  heroSubtitle:'A creative studio where expressive design meets thoughtful development. Explore work, see the process, and bring your next idea to life.',
  about:'I build brands, graphics, websites and digital experiences with strong visual direction and useful functionality. From original artwork to working products, every detail matters.',
  contactEmail:'',discordUrl:'https://discord.gg/P9wjyGFwFF',availability:'Open for commissions',
  accent:'#638bff',announcement:'Creative Studio 5.0 — the next chapter is live.'
};
export function formatDate(value){try{return new Date(value).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'});}catch{return '';}}
export function money(v){return new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD'}).format(Number(v)||0);}
