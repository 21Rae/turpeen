import React, { useState } from 'react';
import { 
  MapPin, 
  Package, 
  Phone, 
  Sparkles, 
  MessageCircle, 
  Check, 
  Copy, 
  ExternalLink, 
  Store, 
  ShoppingBag, 
  Globe, 
  ShieldCheck, 
  ArrowRight,
  Heart
} from 'lucide-react';
import { TurpeenIcon } from './TurpeenLogo';

interface AboutSectionProps {
  onOpenShop?: () => void;
  isStandaloneView?: boolean;
  onBackToFeed?: () => void;
}

export default function AboutSection({ onOpenShop, isStandaloneView = false, onBackToFeed }: AboutSectionProps) {
  const [copiedPhone, setCopiedPhone] = useState(false);

  const phoneNumber = '07062296118';
  const whatsappUrl = 'https://wa.me/message/4J2WHQITQEYYN1';
  const whatsappDirectNumUrl = 'https://wa.me/2347062296118?text=Hello%20Turpeen%20Cosmetics!%20I%20would%20like%20to%20inquire%20about%20your%20skincare%20and%20bodycare%20products.';

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  return (
    <section id="about" className="w-full bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden my-8">
      {/* Header Banner */}
      <div className="bg-neutral-900 text-white px-6 sm:px-10 py-8 sm:py-10 relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <TurpeenIcon className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center space-x-2 bg-neutral-800/90 border border-neutral-700 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-rose-300 mb-4 rounded-full">
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span>Beauty, cosmetic & personal care</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase leading-tight mb-3">
            SKINCARE | BODYCARE PRODUCTS IN LAGOS
          </h1>
          <p className="text-sm sm:text-base text-neutral-300 font-light max-w-2xl leading-relaxed">
            Your premier boutique for 100% authentic international skincare, bodycare, and curated beauty essentials based in Lagos, Nigeria.
          </p>

          {/* Social Proof Stats Bar */}
          <div className="grid grid-cols-3 max-w-xs sm:max-w-sm gap-4 mt-6 pt-6 border-t border-neutral-800">
            <div className="text-left">
              <span className="block font-mono text-xl sm:text-2xl font-bold text-white">34</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Posts</span>
            </div>
            <div className="text-left border-l border-neutral-800 pl-4">
              <span className="block font-mono text-xl sm:text-2xl font-bold text-white">229</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Followers</span>
            </div>
            <div className="text-left border-l border-neutral-800 pl-4">
              <span className="block font-mono text-xl sm:text-2xl font-bold text-white">33</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-6 sm:p-10 space-y-10">
        
        {/* Core Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Highlight 1: Origin */}
          <div className="bg-neutral-50 p-5 border border-gray-200/80 rounded-sm hover:border-gray-300 transition-colors">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex items-center space-x-1.5 mb-1.5">
              <span className="text-base">🇰🇷</span>
              <span className="text-base">🇺🇸</span>
              <span className="text-base">🇬🇧</span>
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-gray-900 ml-1">Curated Origins</span>
            </div>
            <h3 className="font-serif text-base font-bold text-neutral-900 mb-1">
              Skincare & Bodycare
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Directly imported from South Korea, the United States, and the United Kingdom for verified authenticity.
            </p>
          </div>

          {/* Highlight 2: Walk-in Store */}
          <div className="bg-neutral-50 p-5 border border-gray-200/80 rounded-sm hover:border-gray-300 transition-colors">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Store className="w-5 h-5" />
            </div>
            <div className="flex items-center space-x-1 mb-1.5 text-xs font-mono font-bold tracking-wider uppercase text-gray-900">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Lagos, Nigeria</span>
            </div>
            <h3 className="font-serif text-base font-bold text-neutral-900 mb-1">
              Walk-in Store in Lagos
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Visit our physical walk-in beauty boutique in Lagos to sample formulas, get shade matches, and consult in person.
            </p>
          </div>

          {/* Highlight 3: Nationwide Delivery */}
          <div className="bg-neutral-50 p-5 border border-gray-200/80 rounded-sm hover:border-gray-300 transition-colors">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Package className="w-5 h-5" />
            </div>
            <div className="flex items-center space-x-1 mb-1.5 text-xs font-mono font-bold tracking-wider uppercase text-gray-900">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fast & Secure</span>
            </div>
            <h3 className="font-serif text-base font-bold text-neutral-900 mb-1">
              Nationwide Delivery
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Doorstep dispatch and swift delivery across all 36 Nigerian states with verified tracking and secure packaging.
            </p>
          </div>

          {/* Highlight 4: Direct Consultation */}
          <div className="bg-neutral-50 p-5 border border-gray-200/80 rounded-sm hover:border-gray-300 transition-colors">
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-3">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="flex items-center space-x-1 mb-1.5 text-xs font-mono font-bold tracking-wider uppercase text-gray-900">
              <Phone className="w-3.5 h-3.5 text-green-600" />
              <span>07062296118</span>
            </div>
            <h3 className="font-serif text-base font-bold text-neutral-900 mb-1">
              DM & WhatsApp Orders
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Personalized routine advice, shade inquiries, and instant order placement directly via WhatsApp.
            </p>
          </div>

        </div>

        {/* Contact & Instant Action Callout */}
        <div className="bg-neutral-950 text-white p-6 sm:p-8 rounded-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 text-rose-300 text-[10px] font-mono uppercase tracking-widest font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Customer Support & Orders</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
              Ready to elevate your beauty regimen?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
              Send us a DM or chat with our beauty advisors on WhatsApp at <strong className="text-white font-mono">{phoneNumber}</strong> for rapid order confirmation and product availability.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Direct WhatsApp Link */}
            <a
              id="about-whatsapp-link-btn"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono tracking-widest uppercase px-5 py-3 rounded-sm flex items-center space-x-2 transition-all duration-200 shadow-sm active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp Us</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {/* Direct Phone Call */}
            <a
              id="about-call-btn"
              href={`tel:${phoneNumber}`}
              className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono tracking-widest uppercase px-4 py-3 rounded-sm flex items-center space-x-2 transition-all duration-200 border border-neutral-700"
            >
              <Phone className="w-4 h-4 text-neutral-300" />
              <span>{phoneNumber}</span>
            </a>

            {/* Copy Number */}
            <button
              id="about-copy-phone-btn"
              onClick={handleCopyPhone}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white p-3 rounded-sm transition-colors border border-neutral-700 cursor-pointer"
              title="Copy phone number"
            >
              {copiedPhone ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Brand Story & Philosophy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-gray-100">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 block font-semibold">
              The Turpeen Commitment
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 leading-snug">
              Authentic beauty formulated for glowing, healthy skin.
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed font-light">
              At Turpeen Cosmetics, we believe luxury skincare should be transparent, effective, and readily accessible. From viral Korean glass-skin serums to cult-favorite UK and US bodycare formulas, every single bottle on our shelves is guaranteed 100% genuine.
            </p>
            {onOpenShop && (
              <button
                id="about-explore-shop-btn"
                onClick={onOpenShop}
                className="inline-flex items-center space-x-2 bg-black hover:bg-neutral-800 text-white text-xs font-mono tracking-widest uppercase px-5 py-2.5 transition-all duration-200 cursor-pointer shadow-sm"
              >
                <ShoppingBag className="w-4 h-4 text-rose-300" />
                <span>Explore Products</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            )}
          </div>

          <div className="lg:col-span-7 bg-neutral-50 p-6 sm:p-8 border border-gray-200/60 rounded-sm space-y-6">
            <h3 className="font-serif text-lg font-bold text-neutral-900 flex items-center space-x-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Store Information & Ordering Guide</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-700">
              <div className="space-y-1">
                <span className="font-mono uppercase font-bold text-neutral-900 block text-[11px]">📍 Walk-in Store</span>
                <p className="text-neutral-600">Lagos, Nigeria</p>
                <p className="text-[11px] text-gray-500">Walk-ins, physical swatching & local pick-ups available</p>
              </div>

              <div className="space-y-1">
                <span className="font-mono uppercase font-bold text-neutral-900 block text-[11px]">🚚 Nationwide Delivery</span>
                <p className="text-neutral-600">All 36 States in Nigeria</p>
                <p className="text-[11px] text-gray-500">Fast dispatch with trusted nationwide couriers</p>
              </div>

              <div className="space-y-1">
                <span className="font-mono uppercase font-bold text-neutral-900 block text-[11px]">💬 WhatsApp & Orders</span>
                <p className="font-mono font-bold text-neutral-900">07062296118</p>
                <a 
                  href={whatsappDirectNumUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:underline inline-flex items-center space-x-1"
                >
                  <span>Chat directly on WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-1">
                <span className="font-mono uppercase font-bold text-neutral-900 block text-[11px]">✨ Product Categories</span>
                <p className="text-neutral-600">Skincare • Bodycare • Fragrance • Lip Care</p>
                <p className="text-[11px] text-gray-500">Sourced from 🇰🇷 Korea, 🇺🇸 USA & 🇬🇧 UK</p>
              </div>
            </div>

            {isStandaloneView && onBackToFeed && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  id="about-back-to-home-btn"
                  onClick={onBackToFeed}
                  className="text-xs font-mono uppercase tracking-widest font-semibold text-neutral-800 hover:text-black underline cursor-pointer"
                >
                  ← Back to Articles & Top Shelves
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
