'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL, DSDP_CONSENT_URL, OFFER_CODE, SUBSCRIPTION_PRICE } from '@/constants/config';
import { 
  Headphones, 
  Skull, 
  Fingerprint, 
  Heart, 
  Droplets, 
  Mountain,
  Sparkles
} from 'lucide-react';

export default function SubscribePage() {
  const [subLoading, setSubLoading] = useState(false);

  const handleSubmit = async () => {
    if (subLoading) return;
    setSubLoading(true);

    try {
      // 1. Get ext_ref from URL query string if present
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
      const extRef = params.get('ext_ref') || params.get('requestid') || '';

      // 2. Request Consent URL from backend
      const res = await fetch(`${API_BASE_URL}/api/sdp/consent-url?ext_ref=${encodeURIComponent(extRef)}`);
      const json = await res.json();

      let targetConsentUrl = '';

      if (json.success && json.data?.consentUrl) {
        targetConsentUrl = json.data.consentUrl;
      } else {
        // Fallback default Safaricom Consent Gateway URL from environment config
        const baseGateway = DSDP_CONSENT_URL.replace(/\/+$/, '');
        targetConsentUrl = `${baseGateway}/${OFFER_CODE}?ext_ref=${encodeURIComponent(extRef)}`;
      }

      console.log('Redirecting to Safaricom Consent Gateway:', targetConsentUrl);
      window.location.replace(targetConsentUrl);
    } catch (err) {
      console.error('Error redirecting to consent gateway:', err);
      // Fallback redirect directly using environment config
      const params = new URLSearchParams(window.location.search);
      const extRef = params.get('ext_ref') || '';
      const baseGateway = DSDP_CONSENT_URL.replace(/\/+$/, '');
      window.location.replace(`${baseGateway}/${OFFER_CODE}?ext_ref=${encodeURIComponent(extRef)}`);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#07080B] text-white flex items-center justify-center p-3 sm:p-4 z-50 select-none">
      {/* Background Luxury Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/[0.06] rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[350px] h-[250px] bg-orange-600/[0.04] rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glassmorphism Card */}
      <div className="w-full max-w-[390px] sm:max-w-[420px] bg-[#0E1017]/95 backdrop-blur-2xl border border-amber-400/30 rounded-[30px] sm:rounded-[36px] p-5 sm:p-7 shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_35px_rgba(236,195,88,0.12),inset_0_1px_0_rgba(255,255,255,0.12)] relative z-10 flex flex-col items-center text-center space-y-3.5 sm:space-y-5 my-auto">
        
        {/* LOGO ICON */}
        <div className="pt-0.5">
          <div className="w-16 h-16 sm:w-19 sm:h-19 rounded-[20px] bg-[#0A0B10] border-2 border-[#ECC358] shadow-[0_0_18px_rgba(236,195,88,0.3),inset_0_0_12px_rgba(236,195,88,0.15)] flex items-center justify-center p-2.5 relative group">
            {/* Soft inner glow */}
            <div className="absolute inset-0 rounded-[18px] bg-gradient-to-b from-amber-400/10 to-transparent pointer-events-none" />
            
            {/* Project Brand Logo / Headphone Mark */}
            <img 
              src="/storyhublogo.png" 
              alt="StoryHub" 
              className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(236,195,88,0.4)]"
              onError={(e) => {
                // Fallback to stylized gold icon if image not available
                (e.currentTarget.style.display = 'none');
                const fallback = document.getElementById('logo-fallback-icon');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div id="logo-fallback-icon" style={{ display: 'none' }} className="w-full h-full items-center justify-center">
              <Headphones className="w-8 h-8 sm:w-10 sm:h-10 text-[#ECC358]" />
            </div>
          </div>
        </div>

        {/* BRAND TITLE */}
        <div className="space-y-2 sm:space-y-2.5 w-full">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-b from-[#FFF3BF] via-[#E5B54E] to-[#A87B1D] bg-clip-text text-transparent drop-shadow-sm leading-none">
            StoryHub
          </h1>

          {/* Golden Star Divider */}
          <div className="flex items-center justify-center gap-2.5 px-6">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#E5B54E]/60 to-[#E5B54E]" />
            <span className="text-[#E5B54E] text-xs transform scale-110">✦</span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#E5B54E]/60 to-[#E5B54E]" />
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-0.5 px-2">
          <p className="text-zinc-300 text-xs sm:text-sm font-medium leading-tight">
            StoryHub includes stories of
          </p>
          <p className="text-zinc-300 text-xs sm:text-sm font-medium leading-tight">
            Horror, Thriller, Romance and more.
          </p>
        </div>

        {/* 5 CIRCULAR CATEGORY BADGES ROW */}
        <div className="w-full py-1">
          <div className="flex items-start justify-between gap-1 px-0.5">
            
            {/* 1. Horror */}
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#12141F] border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)] flex items-center justify-center transition-transform hover:scale-105">
                <Skull className="w-5 h-5 text-[#FF4D6D]" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium tracking-tight">Horror</span>
            </div>

            {/* 2. Thriller */}
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#12141F] border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)] flex items-center justify-center transition-transform hover:scale-105">
                <Fingerprint className="w-5 h-5 text-[#C084FC]" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium tracking-tight">Thriller</span>
            </div>

            {/* 3. Love */}
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#12141F] border border-pink-500/40 shadow-[0_0_12px_rgba(236,72,153,0.2)] flex items-center justify-center transition-transform hover:scale-105">
                <Heart className="w-5 h-5 text-[#F472B6]" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium tracking-tight">Love</span>
            </div>

            {/* 4. Sad */}
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#12141F] border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)] flex items-center justify-center transition-transform hover:scale-105">
                <Droplets className="w-5 h-5 text-[#38BDF8]" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium tracking-tight">Sad</span>
            </div>

            {/* 5. Motivational */}
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#12141F] border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)] flex items-center justify-center transition-transform hover:scale-105">
                <Mountain className="w-5 h-5 text-[#FBBF24]" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium tracking-tight">Motivational</span>
            </div>

          </div>
        </div>

        {/* Golden Star Divider 2 */}
        <div className="w-full">
          <div className="flex items-center justify-center gap-2.5 px-6">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#E5B54E]/60 to-[#E5B54E]" />
            <span className="text-[#E5B54E] text-xs transform scale-110">✦</span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#E5B54E]/60 to-[#E5B54E]" />
          </div>
        </div>

        {/* PRICE SECTION */}
        <div className="pt-0.5">
          <div className="text-3xl sm:text-[34px] font-extrabold text-[#ECC358] tracking-tight flex items-baseline justify-center gap-1.5 drop-shadow-sm leading-none">
            {SUBSCRIPTION_PRICE} <span className="text-xs sm:text-sm font-normal text-zinc-400">/ Daily</span>
          </div>
        </div>

        {/* SUBSCRIBE BUTTON */}
        <div className="w-full pt-1 pb-0.5 space-y-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={subLoading}
            className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-b from-[#FCD34D] via-[#E5A729] to-[#BA7B12] hover:from-[#FDE68A] hover:to-[#CA8A04] text-zinc-950 font-black text-lg sm:text-xl shadow-[0_8px_25px_rgba(229,167,41,0.35)] hover:shadow-[0_10px_30px_rgba(229,167,41,0.5)] transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 tracking-wide"
          >
            {subLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-zinc-950" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Redirecting to Safaricom...
              </span>
            ) : (
              'Subscribe'
            )}
          </button>

          <Link
            href="/demo"
            className="block text-center text-xs text-zinc-400 hover:text-amber-400 py-0.5 transition-colors font-medium"
          >
            Or Try 60-Sec Free Demo &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
