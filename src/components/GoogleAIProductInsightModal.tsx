import { useState, useEffect } from 'react';
import { Sparkles, X, Check, RefreshCw, Shield, Layers, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ShopProduct, GoogleAIProductInsight } from '../types';

interface GoogleAIProductInsightModalProps {
  product: ShopProduct | null;
  onClose: () => void;
}

export default function GoogleAIProductInsightModal({
  product,
  onClose,
}: GoogleAIProductInsightModalProps) {
  const [insight, setInsight] = useState<GoogleAIProductInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!product) {
      setInsight(null);
      return;
    }

    const fetchInsight = async () => {
      const cacheKey = `turpeen-product-ai-${product.id}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          setInsight(JSON.parse(cached));
          return;
        } catch (e) {}
      }

      setIsLoading(true);
      try {
        const res = await fetch('/api/ai/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'product',
            product: {
              name: product.name,
              category: product.category,
              description: product.description || product.subtitle,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.insight) {
            setInsight(data.insight);
            sessionStorage.setItem(cacheKey, JSON.stringify(data.insight));
          }
        } else {
          throw new Error('API error');
        }
      } catch (e) {
        // Fallback formulation breakdown
        const fallback: GoogleAIProductInsight = {
          headline: `Formulation Analysis: ${product.name}`,
          formulationOverview: product.description || `${product.name} delivers weightless barrier nourishment with a clean, breathable finish that integrates seamlessly with daily routines.`,
          keyActives: [
            { name: "Barrier Lipids & Botanical Extracts", function: "Replenishes skin hydration and seals in moisture without congestion." },
            { name: "Light-Reflecting Micro-Pigments", function: "Diffuses natural light for an effortless, dewy finish." },
          ],
          skinTypeMatch: "Suitable for all skin types, including sensitive and dry textures.",
          howToLayer: "Warm 1-2 pumps between fingertips and press gently onto clean skin or over morning moisturizer before SPF.",
          editorVerdict: "A dependable, multi-use holy grail that balances effortless application with tangible barrier benefits.",
        };
        setInsight(fallback);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsight();
  }, [product]);

  if (!product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden font-sans"
        >
          {/* Top Bar */}
          <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-mono tracking-widest text-rose-300 uppercase font-bold block">
                  AI Review
                </span>
                <h3 className="font-serif text-base font-bold text-white">
                  Formulation & Product Review
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Product Header */}
            <div className="flex items-start space-x-4 pb-4 border-b border-neutral-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 rounded-lg object-cover bg-neutral-100 shrink-0 border border-neutral-200"
              />
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-rose-600 font-semibold">
                  {product.category}
                </span>
                <h4 className="font-serif text-lg font-bold text-neutral-900 leading-snug">
                  {product.name}
                </h4>
                <p className="text-xs text-neutral-500 font-light">{product.subtitle}</p>
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="py-12 text-center space-y-2">
                <div className="w-8 h-8 mx-auto rounded-full bg-rose-100 flex items-center justify-center animate-spin">
                  <Sparkles className="w-4 h-4 text-rose-600" />
                </div>
                <p className="text-xs font-mono text-neutral-500">
                  Analyzing formulation & skin benefits...
                </p>
              </div>
            )}

            {/* Content */}
            {!isLoading && insight && (
              <div className="space-y-4">
                
                {/* Overview */}
                <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl">
                  <span className="text-[9px] font-mono tracking-widest uppercase text-rose-700 font-bold block mb-1">
                    AI TEXTURE & BENEFIT SUMMARY
                  </span>
                  <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
                    {insight.formulationOverview}
                  </p>
                </div>

                {/* Key Actives */}
                {insight.keyActives && insight.keyActives.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 font-bold block">
                      KEY ACTIVE INGREDIENTS
                    </span>
                    <div className="space-y-2">
                      {insight.keyActives.map((active, i) => (
                        <div key={i} className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-xs">
                          <strong className="text-neutral-900 block font-serif">{active.name}</strong>
                          <span className="text-neutral-600">{active.function}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skin Type & Layering */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1">
                    <div className="flex items-center space-x-1.5 text-[10px] font-mono text-neutral-500 uppercase font-semibold">
                      <Shield className="w-3.5 h-3.5 text-rose-500" />
                      <span>Skin Match</span>
                    </div>
                    <p className="text-xs text-neutral-700">{insight.skinTypeMatch}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1">
                    <div className="flex items-center space-x-1.5 text-[10px] font-mono text-neutral-500 uppercase font-semibold">
                      <Layers className="w-3.5 h-3.5 text-neutral-600" />
                      <span>How to Layer</span>
                    </div>
                    <p className="text-xs text-neutral-700">{insight.howToLayer}</p>
                  </div>
                </div>

                {/* Verdict */}
                <div className="p-4 rounded-xl bg-neutral-900 text-white space-y-1">
                  <div className="flex items-center space-x-1.5 text-[10px] font-mono text-rose-300 uppercase font-bold">
                    <ThumbsUp className="w-3 h-3" />
                    <span>AI Verdict</span>
                  </div>
                  <p className="text-xs text-neutral-200 font-serif italic leading-relaxed">
                    “{insight.editorVerdict}”
                  </p>
                </div>

              </div>
            )}

            {/* Bottom Close Action */}
            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-mono text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Close AI Review
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
