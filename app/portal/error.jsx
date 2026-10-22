'use client';
import RecoveryPage from '@/components/RecoveryPage';
export default function Error({error,reset}){return <RecoveryPage mode="critical" section="Client portal" reset={reset} reference={typeof error?.digest==='string'?error.digest:''}/>;}
