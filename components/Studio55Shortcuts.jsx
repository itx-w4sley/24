'use client';
import Link from 'next/link';
import {UserCog,Bell,FileCheck,Download,MessagesSquare,RefreshCw,ArrowUpRight} from 'lucide-react';
import styles from './Studio55Shortcuts.module.css';
const links=[['/account/settings','Account settings',UserCog],['/notifications','Notifications',Bell],['/portal/quotes','Robux quotes',FileCheck],['/portal/deliveries','File delivery',Download],['/portal/messages','Messages',MessagesSquare],['/portal/revisions','Revisions',RefreshCw]];
export default function Studio55Shortcuts(){return <nav aria-label="Client workspace tools" className={styles.wrap}>{links.map(([href,name,Icon])=><Link href={href} key={href} className={styles.link}><Icon size={16}/><span>{name}</span><ArrowUpRight size={12}/></Link>)}</nav>}
