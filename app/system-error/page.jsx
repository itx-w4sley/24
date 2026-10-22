import RecoveryPage from '@/components/RecoveryPage';
export const metadata={title:'System error',robots:{index:false,follow:false}};
export default async function Page({searchParams}){const query=await searchParams;return <RecoveryPage mode="critical" next={query?.next||''}/>;}
