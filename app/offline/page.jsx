import RecoveryPage from '@/components/RecoveryPage';
export const metadata={title:'Connection lost',robots:{index:false,follow:false}};
export default async function Page({searchParams}){const query=await searchParams;return <RecoveryPage mode="offline" next={query?.next||''}/>;}
