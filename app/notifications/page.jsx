import {redirect} from 'next/navigation';
import {currentUser} from '@/lib/auth';
import Studio55Workspace from '@/components/Studio55Workspace';
export const metadata={title:'Notifications | Creative Studio',robots:{index:false}};
export const dynamic='force-dynamic';
export default async function Page(){const user=await currentUser();if(!user)redirect('/login?next=%2Fnotifications');return <Studio55Workspace feature="notifications" role={user.role}/>}
