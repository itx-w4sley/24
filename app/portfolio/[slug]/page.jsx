export const dynamic='force-dynamic';
import Link from 'next/link';import {notFound} from 'next/navigation';
import {ArrowLeft,ArrowUpRight,CalendarDays,Layers,BriefcaseBusiness,Code2} from 'lucide-react';
import {publicItem} from '@/lib/content';import Art from '@/components/Art';import ProjectStage from '@/components/ProjectStage';
export async function generateMetadata({params}){const {slug}=await params;const p=await publicItem('projects',slug);return {title:p?.name||'Project'}}
export default async function Project({params}){
 const {slug}=await params;const p=await publicItem('projects',slug);if(!p)notFound();
 const gallery=(Array.isArray(p.gallery)?p.gallery:[]).filter(Boolean);
 return <><Link href="/portfolio" className="text-link"><ArrowLeft size={15}/> Back to portfolio</Link>
 <section className="page-heading" style={{marginTop:30}}><span className="eyebrow">{p.category||'Creative project'} / PROJECT SHOWCASE</span><h1>{p.name}<span className="gradient-text">.</span></h1><div style={{margin:'15px 0'}}>{p.stage&&<ProjectStage stage={p.stage}/>}</div><p>{p.description}</p></section>
 <div className="two-col"><div className="surface" style={{padding:0,overflow:'hidden'}}><Art item={p}/></div><div className="surface"><span className="eyebrow">THE PROJECT</span><h2>Overview</h2><p style={{whiteSpace:'pre-wrap',marginTop:16}}>{p.body||p.description}</p><div className="divider"/><div className="timeline"><div className="timeline-row"><CalendarDays size={16}/> Year: <b>{p.year||'—'}</b></div><div className="timeline-row"><Layers size={16}/> Category: <b>{p.category||'—'}</b></div>{p.client&&<div className="timeline-row"><BriefcaseBusiness size={16}/> Client: <b>{p.client}</b></div>}{p.tools?.length>0&&<div className="timeline-row"><Code2 size={16}/> Tools: <b>{p.tools.join(', ')}</b></div>}</div><div className="chips" style={{marginTop:22}}>{(p.tags||[]).map(t=><span className="pill" key={t}>{t}</span>)}</div><Link href="/commission" className="button button-primary" style={{marginTop:24}}>Request a similar project <ArrowUpRight size={15}/></Link></div></div>
 {(p.challenge||p.solution||p.outcome)&&<section className="case-study-grid">{[['The challenge',p.challenge],['Our approach',p.solution],['Result & next steps',p.outcome]].filter(x=>x[1]).map(([title,body])=><article className="surface" key={title}><span className="eyebrow">CASE STUDY</span><h2>{title}</h2><p style={{whiteSpace:'pre-wrap',marginTop:14}}>{body}</p></article>)}</section>}
 {gallery.length>0&&<section style={{marginTop:38}}><div className="section-head"><div><span className="eyebrow">PROJECT MEDIA</span><h2>Gallery</h2></div></div><div className="case-gallery">{gallery.map((url,i)=><a key={url+i} href={url} target="_blank" rel="noopener noreferrer" className="surface" style={{display:'block',padding:8}}><img src={url} alt={`${p.name} — image ${i+1}`} loading="lazy"/><small>Image {i+1} ↗</small></a>)}</div></section>}
 </>;
}
