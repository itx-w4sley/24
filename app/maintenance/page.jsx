import RecoveryPage from '@/components/RecoveryPage';
export const metadata={title:'Studio maintenance',robots:{index:false,follow:false}};
export default async function Page({searchParams}){const query=await searchParams;return <RecoveryPage mode="maintenance" next={query?.next||''}/>;}
