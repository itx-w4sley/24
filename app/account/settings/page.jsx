import {redirect} from 'next/navigation';
import {currentUser} from '@/lib/auth';
import Studio55Workspace from '@/components/Studio55Workspace';
export const metadata={title:'Account settings | Creative Studio',robots:{index:false}};
export const dynamic='force-dynamic';
export default async function Page(){const user=await currentUser();if(!user)redirect('/login?next=%2Faccount%2Fsettings');return <Studio55Workspace feature="account" role={user.role}/>}
