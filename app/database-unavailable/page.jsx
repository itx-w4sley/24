import RecoveryPage from '@/components/RecoveryPage';
export const metadata={title:'Database unavailable',robots:{index:false,follow:false}};
export default async function Page({searchParams}){const query=await searchParams;return <RecoveryPage mode="database" next={query?.next||''}/>;}
