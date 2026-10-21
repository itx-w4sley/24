'use client';
import {useState} from 'react';import {Image as ImageIcon} from 'lucide-react';
export default function Art({item,alt='',className=''}){const [bad,setBad]=useState(false);return <div className={'project-media '+className}>
 <div className="project-fallback"><ImageIcon size={35} strokeWidth={1.2}/><strong>{item.name||item.title||'Studio artwork'}</strong><small>{item.category||'Creative studio'}</small></div>
 {item.image&&!bad&&<img loading="lazy" src={item.image} alt={alt||item.name||'Artwork'} onError={()=>setBad(true)}/>}<div className="project-overlay"><span className="pill">VIEW PROJECT ↗</span></div>
 </div>}
