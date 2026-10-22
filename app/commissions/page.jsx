import {redirect} from 'next/navigation';
export const metadata={title:'Manage commissions',robots:{index:false}};
export default function Commissions(){redirect('/admin?tab=commissions');}
