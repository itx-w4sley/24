'use client';
import {useState} from 'react';
import {LogOut,LoaderCircle} from 'lucide-react';
import styles from './SignOutIcon.module.css';

/** Accessible icon-only log out control for authenticated client areas. */
export default function SignOutIcon({onError,redirectTo='/login'}){
  const [loading,setLoading]=useState(false);
  const [localError,setLocalError]=useState('');

  async function signOut(){
    if(loading)return;
    setLoading(true);
    setLocalError('');
    try{
      const res=await fetch('/api/auth/logout',{
        method:'POST',
        credentials:'same-origin',
        headers:{'Accept':'application/json'}
      });
      if(!res.ok)throw new Error('Could not sign out. Please try again.');
      window.location.replace(redirectTo);
    }catch(err){
      const message=err?.message||'Could not sign out. Please try again.';
      setLocalError(message);
      onError?.(message);
      setLoading(false);
    }
  }

  return <span className={styles.wrapper}>
    <button
      type="button"
      className={styles.button}
      onClick={signOut}
      disabled={loading}
      title={loading?'Signing out…':'Sign out'}
      aria-label={loading?'Signing out':'Sign out of your account'}
    >{loading?<LoaderCircle size={18} className={styles.spinner} aria-hidden="true"/>:<LogOut size={18} aria-hidden="true"/>}</button>
    {localError&&<span className={styles.error} role="alert">{localError}</span>}
  </span>;
}
