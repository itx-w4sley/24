'use client';
import {useEffect} from 'react';
import RecoveryPage from '@/components/RecoveryPage';
/** Catches errors in the root layout. Must render its own html and body. */
export default function GlobalError({error,reset}){
 useEffect(()=>{if(process.env.NODE_ENV==='development'&&error)console.error('Root layout error',error);},[error]);
 return <html lang="en"><body style={{margin:0,padding:'20px clamp(14px,4vw,56px)',background:'#0b1220',color:'#edf2ff',fontFamily:'system-ui,sans-serif'}}><RecoveryPage mode="critical" reset={reset} reference={typeof error?.digest==='string'?error.digest:''}/></body></html>;
}
