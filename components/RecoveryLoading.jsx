import {LoaderCircle,ShieldCheck} from 'lucide-react';
export default function RecoveryLoading({label='Preparing your studio...',detail='Loading the information you requested.'}){
 return <div role="status" aria-live="polite" className="surface" style={{margin:'30px 0',padding:'clamp(22px,5vw,46px)',minHeight:300,borderRadius:20,display:'grid',alignContent:'center',gap:24}}>
   <div className="hstack"><LoaderCircle size={27} className="studio-loading-spin" aria-hidden="true"/><div><div className="eyebrow">STUDIO / WORKING ON IT</div><h2 style={{fontSize:'clamp(23px,4vw,32px)',marginTop:8}}>{label}</h2><p className="hint">{detail}</p></div></div>
   <div className="studio-loading-skeleton" aria-hidden="true"><span/><span/><span/></div>
   <p className="hint"><ShieldCheck size={14} style={{verticalAlign:'middle'}}/> Your information remains protected while the page loads.</p>
 </div>;
}
