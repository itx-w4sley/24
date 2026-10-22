import {redirect} from 'next/navigation';
import {currentUser} from '@/lib/auth';
import StudioAdmin from '@/components/StudioAdmin';
export const metadata={title:'Studio admin',robots:{index:false}};
export const dynamic='force-dynamic';
export default async function Admin({searchParams}){
  const params=await searchParams;
  const tab=typeof params?.tab==='string'?params.tab:'overview';
  const user=await currentUser();
  if(!user)redirect('/401?next='+encodeURIComponent('/admin?tab='+encodeURIComponent(tab)));
  if(!['admin','designer'].includes(user.role))redirect('/403');
  return <StudioAdmin user={user} initialTab={tab}/>;
}
