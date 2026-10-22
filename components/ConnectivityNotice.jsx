'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {WifiOff,ArrowRight} from 'lucide-react';
/** Informational only: never auto-redirect or discard unsaved form data. */
export default function ConnectivityNotice(){
 const [offline,setOffline]=useState(false);
 useEffect(()=>{const update=()=>setOffline(!navigator.onLine);update();window.addEventListener('offline',update);window.addEventListener('online',update);return()=>{window.removeEventListener('offline',update);window.removeEventListener('online',update)};},[]);
 if(!offline)return null;
 return <div role="status" aria-live="polite" style={{padding:'11px 18px',display:'flex',flexWrap:'wrap',gap:9,alignItems:'center',justifyContent:'center',background:'#263047',color:'#f5f7ff',fontSize:12,borderBottom:'1px solid rgba(180,200,255,.2)'}}><WifiOff size={16}/> You're offline. Unsaved changes may not have reached the studio. <Link href="/offline" style={{color:'#bdd0ff',display:'inline-flex',alignItems:'center',gap:4,fontWeight:750}}>Connection help <ArrowRight size={13}/></Link></div>;
}
