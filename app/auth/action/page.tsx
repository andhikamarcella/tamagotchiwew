import { Suspense } from 'react';
import AuthActionPage from '@/src/components/auth/AuthActionPage';

export default function AuthActionRoute() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-slate-950 p-4 font-pixel text-slate-950"><section className="pixel-border max-w-md bg-white p-5 text-center">Checking your action link...</section></main>}><AuthActionPage /></Suspense>;
}
