'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Headphones } from 'lucide-react';

export default function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const extRef = params.get('ext_ref') || params.get('requestid') || '';
      const msisdn = params.get('msisdn') || '';

      console.log('Telco Payment Redirect Callback:', { extRef, msisdn });

      // Save subscription state in localStorage
      localStorage.setItem('storyhub_subscribed', 'true');
      if (msisdn) {
        localStorage.setItem('user_msisdn', msisdn);
      }

      // Smooth delay before redirecting to home
      const timer = setTimeout(() => {
        router.replace('/');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-white text-center">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-extrabold text-white">Subscription Confirmed!</h1>
        <p className="text-sm text-zinc-400">
          Thank you for subscribing to StoryHub VIP. Your account is activated and unlimited audiobook streaming is now unlocked.
        </p>

        <div className="flex items-center gap-2 text-xs text-rose-400 bg-zinc-950 px-4 py-2 rounded-full border border-zinc-800">
          <Headphones className="w-4 h-4" />
          <span>Redirecting to Home Library...</span>
        </div>
      </div>
    </div>
  );
}
