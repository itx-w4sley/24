'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {
  Bot,Server,Cloud,Globe2,PenTool,Camera,Shapes,ArrowRight,ArrowLeft,
  CheckCircle2,Send,ShieldCheck,Sparkles,Check,Layers3,CalendarDays,
  MessageCircle,Info,RotateCcw,FileText
} from 'lucide-react';

// Values deliberately match the existing commission API and Studio Admin categories.
const SERVICES = [
  {value:'Discord Bot Development', label:'Discord bot development', description:'Commands, moderation, tickets, automation and integrations.', Icon:Bot,
    features:['Moderation commands','Ticket system','Slash commands','Staff management','Infraction system','Order management','Digital product delivery','Logging and audit trail','Dashboard / web panel','MongoDB integration','API integrations','Custom embeds and menus']},
  {value:'Discord Server Development', label:'Discord server development', description:'Channels, roles, permissions, onboarding and community configuration.', Icon:Server,
    features:['Channel structure','Roles and permissions','Onboarding and verification','Moderation setup','Staff areas','Ticket support channels','Announcements and embeds','Community automation','Security review','Server branding']},
  {value:'Discord Bot Hosting', label:'Discord bot hosting', description:'Deployment, running environments, monitoring and maintenance.', Icon:Cloud,
    features:['Initial bot deployment','Existing bot migration','Environment configuration','Uptime monitoring','Logs and diagnostics','Scheduled backups','Maintenance / updates','MongoDB connection','Custom domain / endpoint','Hosting consultation']},
  {value:'Website / App Development', label:'Website & app development', description:'Websites, dashboards, client portals and custom applications.', Icon:Globe2,
    features:['Responsive website','Portfolio website','Admin dashboard','Customer portal','Authentication','MongoDB database','Content management','API integrations','Deployment to Vercel','Analytics','Contact / enquiry form','Light / dark mode']},
  {value:'Logo / Branding', label:'Logos & brand identity', description:'Logos, colours, typography and cohesive brand assets.', Icon:PenTool,
    features:['Primary logo','Alternative logo','Profile icon','Brand colour palette','Typography guidance','Brand guidelines','Discord server icon','Social branding package','Source / editable files']},
  {value:'Banners / Graphics', label:'Banners & graphics', description:'Discord, social and promotional artwork.', Icon:Shapes,
    features:['Discord server banner','Profile banner','Social media banner','Poster / announcement','YouTube thumbnail','Event artwork','Website header','Multiple size exports','Editable source files']},
  {value:'Photography / Photo Editing', label:'Photography & photo editing', description:'Photography, editing and retouching.', Icon:Camera,
    features:['Photo session enquiry','Colour correction','Retouching','Background clean-up','Image enhancement','Cropping / resizing','Batch photo editing','Social / web exports','Gallery / portfolio presentation']},
];
const BUDGETS=['Prefer to discuss','Under $100','$100–$250','$250–$500','$500–$1,000','$1,000–$2,500','$2,500+'];
const TIMELINES=['Flexible','As soon as practical','Within 1 week','Within 2–4 weeks','Within 1–3 months','Specific date'];
const STAGES=['New idea','Existing project / redesign','Upgrade or new features','Fix or rebuild'];
const AUDIENCES=['Community / Discord server','Business / organisation','Personal / creator','Other'];
const CONTACTS=['Email','Discord','Either'];
const STEPS=['Service','Scope','Brief','Budget & timing','Contact','Review'];
const INITIAL={
  type:'',features:[],stage:'New idea',audience:'Community / Discord server',platform:'',complexity:'Not sure yet',
  title:'',description:'',deliverables:'',references:'',additionalFeatures:'',
  budget:'Prefer to discuss',timeline:'Flexible',deadline:'',maintenance:'Not sure yet',
  name:'',email:'',discord:'',organisation:'',contactPreference:'Email',website:'',consent:false
};
const emailValid=email=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const dateToday=()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10);};
const validStep=(step,v)=>{
  if(step===0)return !!v.type;
  if(step===1)return true;
  if(step===2)return v.title.trim().length>=3 && v.description.trim().length>=20;
  if(step===3)return v.timeline!=='Specific date'||!!v.deadline&&v.deadline>=dateToday();
  if(step===4)return v.name.trim().length>=2&&emailValid(v.email)&&(v.contactPreference!=='Discord'||v.discord.trim().length>=2);
  if(step===5)return v.consent;
  return true;
};
const errors={0:'Select a service to continue.',2:'Add a project name and at least 20 characters describing what you need.',3:'Choose a future preferred deadline.',4:'Enter your name, valid email address and Discord username if you selected Discord contact.',5:'Confirm you understand this is an enquiry, not a confirmed order.'};
function labelValue(value){return value?.trim()||'Not specified';}
function projectDescription(v){
  const sections=[v.description.trim()];
  const details=[
    ['Project stage',v.stage],['Intended audience',v.audience],['Platform / existing links',v.platform.trim()],
    ['Complexity',v.complexity],['Requested features',v.features.join(', ')],
    ['Other features / technical notes',v.additionalFeatures.trim()],
    ['Deliverables',v.deliverables.trim()],['References',v.references.trim()],
    ['Timeline',v.timeline],['Ongoing maintenance',v.maintenance],
    ['Preferred contact',v.contactPreference],['Discord username',v.discord.trim()],
    ['Organisation',v.organisation.trim()]
  ];
  for(const [name,value] of details){if(value)sections.push(`${name}: ${value}`);}
  return sections.join('\n\n');
}
function Field({id,label,optional=false,children}){
  return <div className="field"><label htmlFor={id}>{label}{!optional&&' *'}</label>{children}</div>;
}

export default function ProjectRequestWizard(){
  const [step,setStep]=useState(0);
  const [values,setValues]=useState(INITIAL);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [result,setResult]=useState(null);
  const [user,setUser]=useState(null);
  const [minDate,setMinDate]=useState('');
  useEffect(()=>{
    setMinDate(dateToday());
    fetch('/api/auth/me').then(r=>r.json()).then(x=>{
      if(x.user){setUser(x.user);setValues(v=>({...v,name:v.name||x.user.name||'',email:v.email||x.user.email||''}));}
    }).catch(()=>{});
  },[]);
  const update=(k,value)=>setValues(v=>({...v,[k]:value}));
  const selectService=(service)=>{setValues(v=>({...v,type:service,features:[]}));setError('');};
  const toggleFeature=feature=>setValues(v=>({...v,features:v.features.includes(feature)?v.features.filter(x=>x!==feature):v.features.length<12?[...v.features,feature]:v.features}));
  const next=()=>{
    setError('');
    if(!validStep(step,values)){setError(errors[step]||'Complete this step before continuing.');return;}
    setStep(s=>Math.min(STEPS.length-1,s+1));
  };
  const submit=async()=>{
    if(!STEPS.every((_,index)=>validStep(index,values))){setError('Please review all required information before submitting.');return;}
    const description=projectDescription(values);
    if(description.length>6000){setError('Your project brief is too long. Shorten the description or technical notes before submitting.');return;}
    setLoading(true);setError('');
    try{
      const payload={
        name:values.name.trim(),email:values.email.trim(),title:values.title.trim(),type:values.type,
        description,budget:values.budget==='Prefer to discuss'?'':values.budget,
        deadline:values.timeline==='Specific date'?values.deadline:'',website:values.website,
        requestDetails:{
          features:values.features,stage:values.stage,audience:values.audience,platform:values.platform,
          complexity:values.complexity,otherFeatures:values.additionalFeatures,
          deliverables:values.deliverables,references:values.references,
          timeline:values.timeline,maintenance:values.maintenance,contactPreference:values.contactPreference,
          discord:values.discord,organisation:values.organisation
        }
      };
      const res=await fetch('/api/public/commission',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||'Unable to submit the request. Please try again.');
      setResult({id:data.id||'',title:values.title,linked:!!user&&user.email?.toLowerCase()===values.email?.trim().toLowerCase()});
    }catch(err){setError(err.message||'Unable to submit your request.');}
    finally{setLoading(false);}
  };
  const service=SERVICES.find(s=>s.value===values.type);
  if(result)return <div className="request-complete surface">
    <div className="round-icon"><CheckCircle2 size={28}/></div><div className="eyebrow">PROJECT ENQUIRY RECEIVED</div>
    <h1>Request submitted<span className="gradient-text">.</span></h1>
    <p>Your brief for <strong>{result.title}</strong> has been sent. The studio can review the requirements and discuss availability and pricing. No order is confirmed and no payment has been taken.</p>
    {result.id&&<p className="micro-label">REQUEST REFERENCE / {result.id.slice(-8).toUpperCase()}</p>}
    <div className="hstack"><Link href={result.linked?'/portal':'/'} className="button button-primary">{result.linked?'Open client portal':'Back to home'} <ArrowRight size={15}/></Link><Link href="/support" className="button">Customer support</Link></div>
    {!result.linked&&<p className="hint">Guest requests are not automatically associated with a client account. The studio can link a request to a verified account later.</p>}
  </div>;
  return <>
    <div className="page-heading"><div className="eyebrow">CREATIVE STUDIO / NEW PROJECT ENQUIRY</div><h1>Tell us what you're <span className="gradient-text">building.</span></h1><p>Outline your Discord, hosting, website, branding or photography project in six guided steps. You can review your brief before sending it. No payment or commitment required.</p></div>
    <div className="wizard-layout">
      <div className="wizard-main surface">
        <div className="wizard-progress-top"><div className="eyebrow">PROJECT REQUEST</div><span className="micro-label">STEP {String(step+1).padStart(2,'0')} / {String(STEPS.length).padStart(2,'0')}</span></div>
        <div className="request-meter" role="progressbar" aria-label="Project brief completion" aria-valuenow={step+1} aria-valuemin={1} aria-valuemax={STEPS.length}><span style={{width:`${(step+1)/STEPS.length*100}%`}}/></div>
        <div className="wizard-progress request-progress" aria-label="Project request steps">{STEPS.map((label,index)=><div className={'wizard-progress-item '+(step===index?'current':step>index?'done':'')} key={label} aria-current={step===index?'step':undefined}><span>{step>index?<CheckCircle2 size={15}/>:String(index+1).padStart(2,'0')}</span><small>{label}</small></div>)}</div>
        {error&&<p className="form-error" role="alert" style={{margin:'15px 0'}}>{error}</p>}

        {step===0&&<section aria-label="Choose a service"><div className="eyebrow">01 / THE SERVICE</div><h2>What can we create for you?</h2><p className="hint">Select one primary service. You can describe connected work in the brief.</p><div className="wizard-service-grid">{SERVICES.map(({value,label,description,Icon})=><button key={value} type="button" aria-pressed={values.type===value} className={'wizard-service '+(values.type===value?'active':'')} onClick={()=>selectService(value)}><span className="round-icon"><Icon size={20}/></span><strong>{label}</strong><span>{description}</span>{values.type===value&&<CheckCircle2 className="wizard-selected" size={17}/>}</button>)}</div></section>}

        {step===1&&<section><div className="eyebrow">02 / PROJECT SCOPE</div><h2>Define the scope.</h2><p className="hint">Select any features you'd like included. Suggestions adapt to your selected service; none are mandatory.</p>
          <div className="form-grid"><Field id="request-stage" label="Project stage" optional><select id="request-stage" value={values.stage} onChange={e=>update('stage',e.target.value)}>{STAGES.map(x=><option key={x}>{x}</option>)}</select></Field><Field id="request-audience" label="Who is it for?" optional><select id="request-audience" value={values.audience} onChange={e=>update('audience',e.target.value)}>{AUDIENCES.map(x=><option key={x}>{x}</option>)}</select></Field></div>
          <div className="request-subhead"><h3>{service?.label||'Project'} features</h3><span className="micro-label">{values.features.length} SELECTED</span></div>
          <div className="request-feature-grid">{(service?.features||[]).map(feature=><button key={feature} type="button" className={'request-feature '+(values.features.includes(feature)?'active':'')} aria-pressed={values.features.includes(feature)} onClick={()=>toggleFeature(feature)}><span className="request-feature-check">{values.features.includes(feature)?<Check size={12}/>:<Layers3 size={12}/>}</span>{feature}</button>)}</div>
          <div className="form-stack request-fields-after"><Field id="request-platform" label="Existing website, platform or community link" optional><input id="request-platform" maxLength={300} value={values.platform} onChange={e=>update('platform',e.target.value)} placeholder="e.g. your website or Discord invite (no private credentials)"/></Field><Field id="request-other" label="Additional features or technical requirements" optional><textarea id="request-other" rows={3} maxLength={600} value={values.additionalFeatures} onChange={e=>update('additionalFeatures',e.target.value)} placeholder="Languages, databases, integrations, file formats or anything not listed"/></Field></div>
        </section>}

        {step===2&&<section><div className="eyebrow">03 / THE PROJECT BRIEF</div><h2>Bring your idea to life.</h2><p className="hint">Tell us what success would look like. Include any requirements that aren't covered by the feature selections.</p>
          <div className="form-stack"><Field id="request-title" label="Project name"><input id="request-title" required minLength={3} maxLength={180} value={values.title} onChange={e=>update('title',e.target.value)} placeholder="e.g. Newcastle Roleplay — Management Bot"/></Field>
            <Field id="request-description" label="Project goals and requirements"><textarea id="request-description" required rows={7} minLength={20} maxLength={3500} value={values.description} onChange={e=>update('description',e.target.value)} placeholder="What should it do? Who will use it? What problem should it solve? What design style do you want?"/><span className="request-counter">{values.description.length} / 3500 characters</span></Field>
            <Field id="request-deliverables" label="Expected deliverables" optional><textarea id="request-deliverables" rows={3} maxLength={450} value={values.deliverables} onChange={e=>update('deliverables',e.target.value)} placeholder="e.g. source code, dashboard, deployment, 2 logo concepts or 4 banners"/></Field>
            <Field id="request-references" label="Inspiration, reference URLs or examples" optional><textarea id="request-references" rows={3} maxLength={450} value={values.references} onChange={e=>update('references',e.target.value)} placeholder="Paste links to examples or explain the look and feel"/></Field></div>
          <div className="support-note"><Info size={18}/><p>Reference URLs only for now. File uploads are not enabled on this form; the studio can arrange a secure way to exchange files after reviewing your enquiry.</p></div>
        </section>}

        {step===3&&<section><div className="eyebrow">04 / PLANNING</div><h2>Budget and timeline.</h2><p className="hint">These are preferences, not prices or delivery guarantees. You can leave the budget open for discussion.</p>
          <div className="form-grid"><Field id="request-budget" label="Estimated budget (AUD)" optional><select id="request-budget" value={values.budget} onChange={e=>update('budget',e.target.value)}>{BUDGETS.map(x=><option key={x}>{x}</option>)}</select></Field><Field id="request-timeline" label="Preferred timeframe" optional><select id="request-timeline" value={values.timeline} onChange={e=>update('timeline',e.target.value)}>{TIMELINES.map(x=><option key={x}>{x}</option>)}</select></Field></div>
          {values.timeline==='Specific date'&&<div className="request-fields-after"><Field id="request-deadline" label="Preferred delivery date"><input id="request-deadline" type="date" min={minDate||undefined} value={values.deadline} onChange={e=>update('deadline',e.target.value)}/></Field></div>}
          <div className="form-grid request-fields-after"><Field id="request-maintenance" label="Need ongoing maintenance?" optional><select id="request-maintenance" value={values.maintenance} onChange={e=>update('maintenance',e.target.value)}>{['Not sure yet','Yes, ongoing support','No, one-time delivery','Would like to discuss'].map(x=><option key={x}>{x}</option>)}</select></Field><Field id="request-complexity" label="Project complexity" optional><select id="request-complexity" value={values.complexity} onChange={e=>update('complexity',e.target.value)}>{['Not sure yet','Small task','Medium-sized project','Large / multi-stage project'].map(x=><option key={x}>{x}</option>)}</select></Field></div>
          <div className="support-note"><CalendarDays size={18}/><p>A requested deadline is not a confirmed booking. Delivery dates and scope are agreed during quotation and planning.</p></div>
        </section>}

        {step===4&&<section><div className="eyebrow">05 / YOUR DETAILS</div><h2>How should we reach you?</h2><p className="hint">We need an email for replying to every enquiry. Discord contact is optional.</p>
          <div className="form-grid"><Field id="request-name" label="Your name"><input id="request-name" value={values.name} minLength={2} maxLength={120} required onChange={e=>update('name',e.target.value)} placeholder="Your name" autoComplete="name"/></Field><Field id="request-email" label="Email address"><input id="request-email" type="email" value={values.email} maxLength={254} required onChange={e=>update('email',e.target.value)} placeholder="you@example.com" autoComplete="email"/></Field><Field id="request-org" label="Business / community name" optional><input id="request-org" value={values.organisation} maxLength={100} onChange={e=>update('organisation',e.target.value)} placeholder="If you're representing an organisation"/></Field><Field id="request-discord" label="Discord username" optional><input id="request-discord" value={values.discord} maxLength={80} onChange={e=>update('discord',e.target.value)} placeholder="e.g. yourusername"/></Field><Field id="request-contact" label="Preferred contact method" optional><select id="request-contact" value={values.contactPreference} onChange={e=>update('contactPreference',e.target.value)}>{CONTACTS.map(x=><option key={x}>{x}</option>)}</select></Field></div>
          <div className="honeypot" aria-hidden="true"><label>Website<input name="website" value={values.website} onChange={e=>update('website',e.target.value)} tabIndex={-1} autoComplete="off"/></label></div>
          <div className="support-note"><ShieldCheck size={18}/><p>Never put Discord bot tokens, passwords, API keys, hosting credentials or private server secrets in this form.</p></div>
        </section>}

        {step===5&&<section><div className="eyebrow">06 / FINAL REVIEW</div><h2>Check your request.</h2><p className="hint">Review what will be sent to the studio. Use Back to edit any information.</p>
          <div className="wizard-review">
            <div><span>Service</span><strong>{values.type}</strong></div>
            <div><span>Project</span><strong>{values.title}</strong><p>Stage: {values.stage} · Audience: {values.audience}</p></div>
            {values.features.length>0&&<div><span>Requested features</span><p>{values.features.join(' · ')}</p></div>}
            {values.platform&&<div><span>Website / platform</span><p className="support-prewrap">{values.platform}</p></div>}
            {values.additionalFeatures&&<div><span>Other technical requirements</span><p className="support-prewrap">{values.additionalFeatures}</p></div>}
            <div><span>Brief</span><p className="support-prewrap">{values.description}</p></div>
            {values.deliverables&&<div><span>Deliverables</span><p className="support-prewrap">{values.deliverables}</p></div>}
            {values.references&&<div><span>References</span><p className="support-prewrap">{values.references}</p></div>}
            <div><span>Budget & delivery</span><strong>{values.budget} · {values.timeline==='Specific date'?values.deadline:values.timeline}</strong><p>Ongoing maintenance: {values.maintenance} · Complexity: {values.complexity}</p></div>
            <div><span>Contact</span><strong>{values.name} · {values.email}</strong><p>{values.organisation?values.organisation+' · ':''}{values.discord?`Discord: ${values.discord} · `:''}Preferred: {values.contactPreference}</p></div>
          </div>
          <label className="request-consent"><input type="checkbox" checked={values.consent} onChange={e=>update('consent',e.target.checked)}/><span>I understand this sends a project enquiry, not a binding order or accepted quote. The studio may use the contact details supplied to respond to my request.</span></label>
        </section>}

        <div className="wizard-actions"><button className="button" disabled={step===0||loading} onClick={()=>{setStep(s=>Math.max(0,s-1));setError('');}} type="button"><ArrowLeft size={15}/> Back</button>
          {step<STEPS.length-1?<button className="button button-primary" onClick={next} type="button">Continue <ArrowRight size={16}/></button>:<button className="button button-primary" type="button" disabled={loading||!values.consent} onClick={submit}><Send size={16}/>{loading?'Submitting…':'Submit project request'}</button>}
        </div>
      </div>
      <aside className="wizard-aside">
        <div className="surface surface-glow"><span className="eyebrow">PROJECT SNAPSHOT</span><div className="request-snapshot-title"><div className="round-icon"><Sparkles size={20}/></div><h3>{values.title||'Your next project'}</h3></div><div className="request-snapshot-row"><span>Service</span><strong>{service?.label||'Not selected'}</strong></div><div className="request-snapshot-row"><span>Features</span><strong>{values.features.length} selected</strong></div><div className="request-snapshot-row"><span>Budget</span><strong>{values.budget}</strong></div><div className="request-snapshot-row"><span>Timeline</span><strong>{values.timeline==='Specific date'?values.deadline||'Select a date':values.timeline}</strong></div><p className="hint">Your selections are kept in this form until you submit or leave the page.</p></div>
        <div className="surface"><span className="eyebrow">WHAT HAPPENS NEXT</span><h3>From brief to build.</h3><div className="wizard-timeline">{[['01','Request review','We review what you want to build.'],['02','Scope & quotation','We discuss the scope, timeline and price.'],['03','Design / development','Work begins after the project is agreed.'],['04','Delivery & support','Deliverables and any support are agreed with you.']].map(([num,title,sub])=><div className="wizard-timeline-row" key={num}><span>{num}</span><div><strong>{title}</strong><p>{sub}</p></div></div>)}</div></div>
        <div className="surface"><span className="eyebrow">EXISTING CLIENT?</span><h3>Already working with us?</h3><p>View your existing requests in the client portal, or contact support for issues.</p><div className="form-stack"><Link href="/portal" className="button">Client portal <ArrowRight size={15}/></Link><Link href="/support" className="text-link">Customer support ↗</Link></div></div>
      </aside>
    </div>
  </>;
}
