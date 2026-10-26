import {redirect} from 'next/navigation';
import {currentUser} from '@/lib/auth';
import Studio55Workspace from '@/components/Studio55Workspace';
export const metadata={title:'Revisions | Client Workspace',robots:{index:false}};
export const dynamic='force-dynamic';
export default async function Page(){const user=await currentUser();if(!user)redirect('/login?next=%2Fportal%2Frevisions');return <Studio55Workspace feature="revisions" role={user.role}/>}
