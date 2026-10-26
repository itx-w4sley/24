 'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {Bell} from 'lucide-react';
import styles from './Studio55Bell.module.css';
export default function Studio55Bell({signedIn,path}){
 const [unread,setUnread]=useState(0);
 useEffect(()=>{if(!signedIn){setUnread(0);return;}let live=true;fetch('/api/app/notifications',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(d=>{if(live)setUnread((d.items||[]).filter(x=>!x.read).length)}).catch(()=>{});return()=>{live=false}},[signedIn,path]);
 if(!signedIn)return null;
 return <Link href="/notifications" className={styles.bell} title="Notification centre" aria-label={unread?`Notifications: ${unread} unread`:'Notifications'}><Bell size={18}/>{unread>0&&<span className={styles.count}>{unread>99?'99+':unread}</span>}</Link>;
}
