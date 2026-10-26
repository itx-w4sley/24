import {redirect} from 'next/navigation';
import {currentUser} from '@/lib/auth';
import Studio55Workspace from '@/components/Studio55Workspace';
export const metadata={title:'Messages | Client Workspace',robots:{index:false}};
export const dynamic='force-dynamic';
export default async function Page(){const user=await currentUser();if(!user)redirect('/login?next=%2Fportal%2Fmessages');return <Studio55Workspace feature="messages" role={user.role}/>}
