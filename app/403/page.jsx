import RecoveryPage from '@/components/RecoveryPage';
export const metadata={title:'Access denied',robots:{index:false,follow:false}};
export default async function Page({searchParams}){const query=await searchParams;return <RecoveryPage mode="forbidden" next={query?.next||''}/>;}
