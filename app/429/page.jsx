import RecoveryPage from '@/components/RecoveryPage';
export const metadata={title:'Too many requests',robots:{index:false,follow:false}};
export default async function Page({searchParams}){const query=await searchParams;return <RecoveryPage mode="rate" next={query?.next||''}/>;}
