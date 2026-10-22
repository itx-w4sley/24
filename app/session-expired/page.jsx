import RecoveryPage from '@/components/RecoveryPage';
export const metadata={title:'Session expired',robots:{index:false,follow:false}};
export default async function Page({searchParams}){const query=await searchParams;return <RecoveryPage mode="session" next={query?.next||''}/>;}
