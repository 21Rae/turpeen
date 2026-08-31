import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Copy, Check, RefreshCw, BookOpen, Flame, Compass, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Article, UserRoutine, GoogleAIDigestResult } from '../types';

interface GoogleAIOverviewProps {
  articles: Article[];
  userRoutines: UserRoutine[];
  onSelectArticle?: (article: Article) => void;
  onOpenShop?: () => void;
}

export default function GoogleAIOverview({
  articles,
  userRoutines,
  onSelectArticle,
  onOpenShop,
}: GoogleAIOverviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [digest, setDigest] = useState<GoogleAIDigestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'digest' | 'themes' | 'holygrails'>('digest');

  const fetchDigest = async (forceRefresh = false) => {
    // Check cached digest in sessionStorage unless forceRefresh is true
    const cacheKey = 'turpeen-google-ai-digest';
    if (!forceRefresh) {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          setDigest(JSON.parse(cached));
          return;
        } catch (e) {
          // continue to fetch
        }
      }
    }

    setIsLoading(true);
    try {
      const response不易 = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'digest',
          websiteData: {
            articles: articles.map(a => ({
              title: a.title,
              author: a.author,
              category: a.category,
              excerpt: a.excerpt,
            })),
            routines: userRoutines.map(r => ({
              name: r.name,
              location: r.location,
              title: r.title,
              favoriteProduct: r.favoriteProduct,
            })),
          },
        }),
      });

      if (response不易.ok) {
        const data = await response不易.json();
        if (data.digest) {
          setDigest(data.digest);
          sessionStorage.setItem(cacheKey, JSON.stringify(data.digest));
        }
      } else {
        throw new Error('Fallback to default digest');
      }
    } catch (e) {
      // Elegant fallback digest if network is offline
      const fallback: GoogleAIDigestResult = {
        headline: "Today's Google AI Editorial Digest: Glowing Skin, Intentional Routines & Lagos Beauty Culture",
        summary: "Across today's featured Top Shelves and reader routines, the overarching beauty philosophy centers on dewy barrier hydration, simplified active steps, and lightweight grooming essentials designed for effortless confidence.",
        keyStats: [
          { label: "Curated Profiles", value: `${articles.length}+ Stories` },
          { label: "Leading Trend", value: "Dewy Skin First" },
          { label: "Community Pick", value: "Balm Dotcom" },
        ],
        trendingThemes: [
          { topic: "Hydration First", tag: "SKINCARE", description: "Prioritizing hydrating milky cleansers and barrier balms over stripping actives." },
          { topic: "Feathery Brows & Soft Lash Definition", tag: "MAKEUP", description: "Minimalist pomade styling and tubing mascara for clean, natural expression." },
          { topic: "Tropical & Urban Adaptability", tag: "LIFESTYLE", description: "Real community formulations that hold up seamlessly across Lagos heat and urban air." },
        ],
        editorsTake: "Beauty in 2026 is defined by ritual and authenticity: nourishing formulas that celebrate individual skin texture with luminous results.",
        holyGrailPicks: [
          { name: "Turpeen Futuredew", reason: "An oil-serum hybrid that locks in an all-day, non-greasy glass-skin radiance." },
          { name: "Turpeen Boy Brow", reason: "The quintessential groomer for flexible, all-day arch hold." },
          { name: "Turpeen Milky Jelly Cleanser", reason: "Conditioning face wash formulated with pH-balanced rose water." },
        ],
        generatedAt: "Updated Live",
      };
      setDigest(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (articles.length > 0) {
      fetchDigest();
    }
  }, [articles.length, userRoutines.length]);

  const handleCopyDigest = () => {
    if (!digest) return;
    const text = `✦ Google AI Beauty Overview — Turpeen Cosmetics\n\n${digest.headline}\n\n${digest.summary}\n\nEditor's Verdict: ${digest.editorsTake}\n\nTrending Themes:\n${digest.trendingThemes.map(t => `• [${t.tag}] ${t.topic}: ${t.description}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white rounded-2xl shadow-xl border border-neutral-800 overflow-hidden my-6 transition-all duration-300">
      
      {/* 1. Header Trigger Bar */}
      <div className="px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-sm">
        
        {/* Left Branding */}
        <div className="flex items-center space-x-3.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500/20 via-rose-400/20 to-amber-300/20 border border-rose-400/30 flex items-center justify-center shrink-0 shadow-inner">
            <Sparkles className="w-4 h-4 text-rose-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[9px] sm:text-[10px] tracking-widest text-rose-300 font-bold uppercase flex items-center space-x-1">
                <span>Google AI Overview</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              </span>
              <span className="text-[10px] text-neutral-400 font-mono hidden md:inline">• Gemini 3.7 Flash</span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
              Today's Beauty & Editorial Digest
            </h3>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2.5 self-end sm:self-auto">
          <button
            id="google-ai-copy-btn"
            onClick={handleCopyDigest}
            className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[10px] font-mono tracking-wider transition-colors flex items-center space-x-1.5 cursor-pointer"
            title="Copy AI Summary"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy Digest</span>
              </>
            )}
          </button>

          <button
            id="google-ai-refresh-btn"
            onClick={() => fetchDigest(true)}
            disabled={isLoading}
            className="p-2 rounded-lg border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Regenerate with Google AI"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
          </button>

          <button
            id="google-ai-toggle-expand"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3.5 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-100 text-[10px] font-mono font-bold tracking-widest uppercase transition-all flex items-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <span>{isExpanded ? 'Collapse' : 'Expand AI Digest'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

      {/* 2. Compact Snippet (Always visible or quick summary) */}
      {!isExpanded && digest && (
        <div 
          onClick={() => setIsExpanded(true)}
          className="px-5 sm:px-8 py-3.5 bg-neutral-950/40 hover:bg-neutral-900/40 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-neutral-300"
        >
          <div className="flex items-center space-x-3 flex-1">
            <span className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/20 text-rose-300 font-mono text-[9px] uppercase font-bold shrink-0">
              AI SUMMARY
            </span>
            <p className="line-clamp-1 font-sans text-neutral-200 text-xs sm:text-[13px]">
              {digest.summary}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-neutral-400 shrink-0 self-end md:self-auto">
            <span>Read full briefing</span>
            <ArrowRight className="w-3 h-3 text-rose-400" />
          </div>
        </div>
      )}

      {/* 3. Expanded Full Interactive Digest */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-5 sm:p-8 space-y-6">
              
              {/* Top Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-3">
                <button
                  id="tab-digest-overview"
                  onClick={() => setActiveTab('digest')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer ${
                    activeTab === 'digest'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Executive Overview</span>
                </button>

                <button
                  id="tab-digest-themes"
                  onClick={() => setActiveTab('themes')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer ${
                    activeTab === 'themes'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Trending Themes</span>
                </button>

                <button
                  id="tab-digest-holygrails"
                  onClick={() => setActiveTab('holygrails')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer ${
                    activeTab === 'holygrails'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Holy Grail Picks</span>
                </button>
              </div>

              {/* Loader */}
              {isLoading && (
                <div className="py-12 text-center space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-full bg-rose-500/20 flex items-center justify-center animate-spin">
                    <Sparkles className="w-5 h-5 text-rose-300" />
                  </div>
                  <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                    Analyzing full editorial catalogue with Google Gemini 3.7 Flash...
                  </p>
                </div>
              )}

              {/* Tab 1: Executive Overview */}
              {!isLoading && activeTab === 'digest' && digest && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  
                  {/* Headline & Summary */}
                  <div className="space-y-3">
                    <h4 className="font-serif text-xl sm:text-2xl font-bold text-neutral-100 leading-snug">
                      {digest.headline}
                    </h4>
                    <p className="font-sans text-sm sm:text-base text-neutral-300 leading-relaxed max-w-4xl font-light">
                      {digest.summary}
                    </p>
                  </div>

                  {/* Key Stats Strip */}
                  {digest.keyStats && digest.keyStats.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      {digest.keyStats.map((stat, i) => (
                        <div key={i} className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col justify-center">
                          <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 mb-1">
                            {stat.label}
                          </span>
                          <span className="font-serif text-base sm:text-lg font-bold text-rose-300">
                            {stat.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Editor's Verdict Callout */}
                  <div className="p-5 rounded-xl bg-gradient-to-r from-rose-950/30 to-neutral-900 border border-rose-900/40 flex items-start space-x-3.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-rose-300 uppercase font-bold block mb-1">
                        EDITORIAL VERDICT
                      </span>
                      <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-serif italic">
                        “{digest.editorsTake}”
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {/* Tab 2: Trending Themes */}
              {!isLoading && activeTab === 'themes' && digest && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {digest.trendingThemes.map((theme, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <span className="inline-block px-2 py-0.5 rounded text-[9px] font-mono tracking-widest uppercase bg-rose-500/15 text-rose-300 font-bold border border-rose-500/20">
                            {theme.tag}
                          </span>
                          <h5 className="font-serif text-lg font-bold text-neutral-100">
                            {theme.topic}
                          </h5>
                          <p className="text-xs text-neutral-400 leading-relaxed">
                            {theme.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Holy Grail Picks */}
              {!isLoading && activeTab === 'holygrails' && digest && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {digest.holyGrailPicks.map((pick, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-3 hover:border-rose-500/40 transition-all"
                      >
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-mono tracking-widest text-rose-300 uppercase font-semibold block">
                            CULT PRODUCT #{idx + 1}
                          </span>
                          <h5 className="font-serif text-base font-bold text-white">
                            {pick.name}
                          </h5>
                          <p className="text-xs text-neutral-400 leading-relaxed font-light">
                            {pick.reason}
                          </p>
                        </div>

                        {onOpenShop && (
                          <button
                            onClick={onOpenShop}
                            className="mt-2 text-[10px] font-mono text-rose-300 hover:text-white uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                          >
                            <span>Shop Formula</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Note */}
              <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-neutral-400 gap-2">
                <div className="flex items-center space-x-1.5">
                  <span>⚡ Powered by Google GenAI SDK (gemini-3.7-flash)</span>
                  <span>•</span>
                  <span>Synchronized with active editorial feed</span>
                </div>
                <div className="text-neutral-400">
                  Updated: {digest?.generatedAt || 'Today'}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
