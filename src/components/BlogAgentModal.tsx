import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, Globe, BookOpen, RefreshCw, CheckCircle, ArrowRight, AlertCircle, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Article } from '../types';

interface BlogAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArticle: (article: Article) => void;
  articles: Article[];
}

interface AgentStatusData {
  enabled: boolean;
  schedule: string;
  intervalHours: number;
  lastRun: string | null;
  nextRun: string | null;
  totalBlogsInDb: number;
  hasOpenAiKey: boolean;
  hasGeminiKey: boolean;
  suggestedTopics: {
    topic: string;
    category: string;
    badge: string;
    targetKeywords: string[];
  }[];
  logs: {
    id: string;
    title: string;
    category: string;
    author: string;
    slug: string;
    timestamp: string;
    provider: string;
    image_1: string;
  }[];
}

export default function BlogAgentModal({
  isOpen,
  onClose,
  onSelectArticle,
  articles,
}: BlogAgentModalProps) {
  const [statusData, setStatusData] = useState<AgentStatusData | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [customTopic, setCustomTopic] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Skincare');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; article?: any } | null>(null);

  const fetchStatus = async () => {
    try {
      setIsLoadingStatus(true);
      const res = await fetch('/api/blog-agent/status');
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
      }
    } catch (err) {
      console.warn('Failed to load agent status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunAgent = async (topicToUse?: string) => {
    try {
      setIsGenerating(true);
      setFeedback(null);
      setGenerationStep('1/3: Analyzing SEO keywords & composing blog with OpenAI API...');

      const postTopic = topicToUse || customTopic.trim() || undefined;

      const stepTimer1 = setTimeout(() => {
        setGenerationStep('2/3: Searching authentic high-res beauty photography...');
      }, 3500);

      const stepTimer2 = setTimeout(() => {
        setGenerationStep('3/3: Publishing to Supabase articles table & broadcasting live...');
      }, 7000);

      const res = await fetch('/api/blog-agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: postTopic,
          category: selectedCategory,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const data = await res.json();

      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: `Successfully posted "${data.article?.title}" via ${data.provider}! It is now live in the articles feed and hero section.`,
          article: data.article,
        });
        setCustomTopic('');
        fetchStatus();
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'Failed to generate blog post.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'An unexpected error occurred while communicating with the agent.',
      });
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const calculateTimeRemaining = (nextRunStr: string | null) => {
    if (!nextRunStr) return 'Scheduled soon';
    const diff = new Date(nextRunStr).getTime() - Date.now();
    if (diff <= 0) return 'Writing now or due shortly';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="bg-white border border-gray-200 shadow-2xl max-w-2xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-neutral-950 text-white p-5 sm:p-6 flex justify-between items-start border-b border-neutral-800 relative">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono tracking-wider font-semibold border border-rose-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                <span>2 BLOGS / 24 HOURS</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-400">SEO & VISIBILITY AGENT</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2">
              <span>Turpeen Blog Writing Agent</span>
            </h2>
            <p className="text-xs text-neutral-300 font-light leading-relaxed max-w-lg">
              Autonomous editorial agent that writes and publishes high-ranking beauty blogs every 12 hours (2 blogs per day) directly into the Supabase articles table with authentic photography.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Status Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 border border-neutral-200">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Cadence</span>
              <span className="text-sm font-semibold text-black">2 Posts / Day</span>
              <span className="text-[10px] text-gray-400 block">Every 12 hours</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Next Post In</span>
              <span className="text-sm font-semibold text-rose-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {calculateTimeRemaining(statusData?.nextRun || null)}
              </span>
              <span className="text-[10px] text-gray-400 block">Automated background</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Published Blogs</span>
              <span className="text-sm font-semibold text-black">
                {statusData?.totalBlogsInDb ?? articles.length} in DB
              </span>
              <span className="text-[10px] text-emerald-600 block flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" /> Live in realtime
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Primary Engine</span>
              <span className="text-sm font-semibold text-black">OpenAI API</span>
              <span className="text-[10px] text-neutral-400 block">with Gemini cascade</span>
            </div>
          </div>

          {/* Feedback alert */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-4 border text-xs leading-relaxed flex items-start space-x-2.5 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{feedback.message}</p>
                  {feedback.article && (
                    <button
                      onClick={() => {
                        onSelectArticle(feedback.article);
                        onClose();
                      }}
                      className="mt-2 text-xs font-mono font-bold uppercase underline hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open and view newly published article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trigger On-Demand Section */}
          <div className="border border-neutral-200 p-4 sm:p-5 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-serif font-bold text-black flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Write & Post Blog Now (On-Demand)</span>
                </h3>
                <p className="text-xs text-gray-500 font-light">
                  Trigger the agent immediately. It will draft, find authentic photos, and insert directly into Supabase.
                </p>
              </div>
            </div>

            {/* Custom Topic Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-gray-600 block">
                Custom Topic (Leave blank to let AI select the highest-ranking SEO topic)
              </label>
              <input
                type="text"
                placeholder="e.g. Snail Mucin vs Hyaluronic Acid: Which Delivers True Glass Skin in Tropical Heat?"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                disabled={isGenerating}
                className="w-full text-xs px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black bg-neutral-50/50"
              />
            </div>

            {/* Category Select */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 mr-2">Category:</span>
              {['Skincare', 'Makeup', 'Hair', 'Interviews'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 border transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-black text-white border-black font-semibold'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <button
              onClick={() => handleRunAgent()}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 bg-black hover:bg-neutral-800 text-white text-xs font-mono tracking-widest uppercase font-semibold flex items-center justify-center space-x-2 transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
                  <span>{generationStep || 'Agent is drafting blog...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-rose-300" />
                  <span>Generate & Post Blog Post Now</span>
                </>
              )}
            </button>
          </div>

          {/* Quick-Pick Trending SEO Topics */}
          {statusData?.suggestedTopics && statusData.suggestedTopics.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 block">
                Trending SEO Topics Ready For Agent Generation:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {statusData.suggestedTopics.slice(0, 4).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-neutral-150 hover:border-black bg-neutral-50/50 hover:bg-neutral-50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <span className="text-[9px] font-mono uppercase text-rose-600 font-semibold block mb-1">
                        {item.category} • {item.badge}
                      </span>
                      <p className="text-xs font-serif font-medium text-black line-clamp-2">
                        {item.topic}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategory(item.category);
                        handleRunAgent(item.topic);
                      }}
                      disabled={isGenerating}
                      className="mt-2.5 text-[10px] font-mono uppercase tracking-wider text-gray-500 group-hover:text-black flex items-center gap-1 font-semibold cursor-pointer disabled:opacity-50"
                    >
                      <span>Draft this topic</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Blogs Published by Agent */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-black uppercase tracking-wider">
                Recent Blogs in Table ({articles.length} Total)
              </span>
              <button
                onClick={fetchStatus}
                className="text-[10px] font-mono text-gray-500 hover:text-black flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {articles.slice(0, 5).map((art) => (
                <div
                  key={art.id}
                  onClick={() => {
                    onSelectArticle(art);
                    onClose();
                  }}
                  className="flex items-center space-x-3 p-2.5 border border-neutral-100 hover:border-black bg-white hover:bg-neutral-50 transition-all cursor-pointer group"
                >
                  <img
                    src={art.images?.[0] || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80'}
                    alt={art.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-cover bg-neutral-100 flex-shrink-0 border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5 text-[9px] font-mono uppercase text-gray-500 mb-0.5">
                      <span className="text-rose-600 font-semibold">{art.category}</span>
                      <span>•</span>
                      <span>{art.date}</span>
                      {art.isHero && (
                        <span className="bg-black text-white px-1 py-0.2 rounded text-[8px] font-mono">
                          HERO
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-serif font-semibold text-black truncate group-hover:text-rose-600 transition-colors">
                      {art.title}
                    </h4>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-black group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center text-[11px] font-mono text-gray-500">
          <div className="flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>SEO Engine: Auto-Scheduled 2x/24h</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-gray-300 hover:border-black text-black uppercase tracking-wider text-[10px] font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
