import RecoveryPage from '@/components/RecoveryPage';
export const metadata={title:'Sign in required',robots:{index:false,follow:false}};
export default async function Page({searchParams}){const query=await searchParams;return <RecoveryPage mode="unauthorized" next={query?.next||''}/>;}
