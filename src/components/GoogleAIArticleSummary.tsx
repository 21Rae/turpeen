import { useState, useEffect } from 'react';
import { Sparkles, Check, Copy, RefreshCw, ChevronDown, ChevronUp, Clock, ShieldCheck, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Article, GoogleAIArticleSummary as ArticleSummaryType } from '../types';

interface GoogleAIArticleSummaryProps {
  article: Article;
}

export default function GoogleAIArticleSummary({ article }: GoogleAIArticleSummaryProps) {
  const [summary, setSummary] = useState<ArticleSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'takeaways' | 'routine' | 'products'>('takeaways');

  const fetchArticleSummary = async (forceRefresh = false) => {
    const cacheKey = `turpeen-ai-summary-${article.id || article.slug}`;
    if (!forceRefresh) {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          setSummary(JSON.parse(cached));
          return;
        } catch (e) {
          // continue
        }
      }
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'article',
          article: {
            title: article.title,
            subtitle: article.subtitle,
            author: article.author,
            category: article.category,
            excerpt: article.excerpt,
            blocks: article.blocks,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.summary) {
          setSummary(data.summary);
          sessionStorage.setItem(cacheKey, JSON.stringify(data.summary));
        }
      } else {
        throw new Error('API failed');
      }
    } catch (e) {
      // Fallback summary generated from article data
      const fallback: ArticleSummaryType = {
        executiveSummary: article.excerpt || `In this feature, ${article.author} opens up their beauty cabinet, breaking down skincare rituals, essential formulations, and the philosophies guiding their personal aesthetic.`,
        keyTakeaways: [
          `Focus on intentional hydration and gentle formulas that nourish the skin barrier.`,
          `Embrace low-maintenance beauty rituals that work seamlessly with real daily schedules.`,
          `Curate multi-benefit holy grails rather than overcrowded product steps.`,
        ],
        routineHighlights: [
          { step: "Daily Prep", tip: "Cleanse with a pH-balanced gentle wash and mist generously with rosewater." },
          { step: "Glow & Protect", tip: "Apply an oil-serum hybrid followed by mineral SPF." },
        ],
        productInsights: [
          { product: article.badge === 'THE TOP SHELF' ? 'Futuredew & Balm Dotcom' : 'Boy Brow & Cloud Paint', benefit: "Provides effortless, dewy definition without cakiness." },
        ],
        readingTimeSavings: "3 min saved",
        skinTypeFocus: "Universal / Balanced Glow",
        editorsQuote: "Beauty should never be a chore; it is an intimate daily gesture of taking care of yourself.",
      };
      setSummary(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticleSummary();
  }, [article.id, article.title]);

  const handleCopy = () => {
    if (!summary) return;
    const text = `✦ AI Review: ${article.title}\n\n${summary.executiveSummary}\n\nKey Takeaways:\n${summary.keyTakeaways.map(t => `• ${t}`).join('\n')}\n\nEditor's Ethos: "${summary.editorsQuote || ''}"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full my-8 bg-gradient-to-br from-rose-50/40 via-white to-amber-50/30 border border-rose-200/70 rounded-2xl p-5 sm:p-7 shadow-sm transition-all duration-300">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-100/80">
        
        {/* Left icon & title */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono tracking-widest text-rose-600 font-bold uppercase">
                AI Review
              </span>
            </div>
            <h4 className="font-serif text-base sm:text-lg font-bold text-neutral-900 leading-none mt-0.5">
              Editorial AI Review & Takeaways
            </h4>
          </div>
        </div>

        {/* Right meta pills & actions */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          {summary?.readingTimeSavings && (
            <span className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-mono font-medium">
              <Clock className="w-3 h-3 text-rose-600" />
              <span>{summary.readingTimeSavings}</span>
            </span>
          )}

          {summary?.skinTypeFocus && (
            <span className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 text-[10px] font-mono">
              <ShieldCheck className="w-3 h-3 text-neutral-500" />
              <span>{summary.skinTypeFocus}</span>
            </span>
          )}

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer text-[10px] font-mono flex items-center space-x-1"
            title="Copy Review"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => fetchArticleSummary(true)}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer disabled:opacity-50"
            title="Regenerate Review"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-500' : ''}`} />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1 rounded-lg bg-neutral-900 text-white hover:bg-black text-[10px] font-mono uppercase tracking-wider transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <span>{isExpanded ? 'Hide' : 'Show'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-8 text-center space-y-2">
          <div className="w-7 h-7 mx-auto rounded-full bg-rose-100 flex items-center justify-center animate-spin">
            <Sparkles className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xs font-mono text-gray-500">
            Synthesizing key beauty insights...
          </p>
        </div>
      )}

      {/* Summary Content Body */}
      {!isLoading && summary && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden pt-4 space-y-5"
            >
              {/* Executive Brief */}
              <div className="bg-white/80 border border-rose-100 p-4 rounded-xl shadow-2xs">
                <span className="text-[9px] font-mono tracking-widest text-rose-700 uppercase font-bold block mb-1">
                  EXECUTIVE BRIEF
                </span>
                <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans font-normal">
                  {summary.executiveSummary}
                </p>
              </div>

              {/* Sub-tabs for granular exploration */}
              <div className="flex items-center space-x-2 border-b border-rose-100 pb-2">
                <button
                  onClick={() => setActiveTab('takeaways')}
                  className={`text-xs font-mono tracking-wider px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'takeaways'
                      ? 'bg-rose-100/80 text-rose-900 font-semibold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Key Takeaways ({summary.keyTakeaways?.length || 0})
                </button>

                {summary.routineHighlights && summary.routineHighlights.length > 0 && (
                  <button
                    onClick={() => setActiveTab('routine')}
                    className={`text-xs font-mono tracking-wider px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      activeTab === 'routine'
                        ? 'bg-rose-100/80 text-rose-900 font-semibold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Routine Steps
                  </button>
                )}

                {summary.productInsights && summary.productInsights.length > 0 && (
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`text-xs font-mono tracking-wider px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      activeTab === 'products'
                        ? 'bg-rose-100/80 text-rose-900 font-semibold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Featured Products
                  </button>
                )}
              </div>

              {/* Tab 1: Key Takeaways */}
              {activeTab === 'takeaways' && (
                <div className="space-y-2.5">
                  {summary.keyTakeaways.map((takeaway, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-neutral-700">
                      <div className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                        {idx + 1}
                      </div>
                      <span className="leading-relaxed">{takeaway}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Routine Highlights */}
              {activeTab === 'routine' && summary.routineHighlights && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {summary.routineHighlights.map((r, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white border border-rose-100 shadow-2xs space-y-1">
                      <span className="text-[10px] font-mono tracking-wider uppercase text-rose-600 font-semibold block">
                        {r.step}
                      </span>
                      <p className="text-xs text-neutral-700 leading-relaxed">
                        {r.tip}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Products */}
              {activeTab === 'products' && summary.productInsights && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {summary.productInsights.map((p, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white border border-rose-100 shadow-2xs space-y-1">
                      <div className="flex items-center space-x-1 text-[10px] font-mono text-neutral-900 font-bold uppercase">
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-400" />
                        <span>{p.product}</span>
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {p.benefit}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Editor's Quote Callout */}
              {summary.editorsQuote && (
                <div className="pt-2 border-t border-rose-100/60 text-xs font-serif italic text-neutral-600 flex items-center space-x-2">
                  <span>“{summary.editorsQuote}”</span>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      )}

    </div>
  );
}
