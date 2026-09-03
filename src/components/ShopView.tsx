import React, { useState, useEffect } from 'react';
import { Phone, X, Check, ArrowRight, ArrowLeft, ExternalLink, RefreshCw, Sparkles, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TurpeenLogo } from './TurpeenLogo';
import { WhatsAppIcon, TURPEEN_SOCIAL_LINKS } from './SocialIcons';
import { ShopProduct } from '../types';
import { getSupabase } from '../lib/supabase';
import { parseProductFromRow } from '../utils/imageParser';
import GoogleAIProductInsightModal from './GoogleAIProductInsightModal';

interface ShopViewProps {
  onBack: () => void;
}

export default function ShopView({ onBack }: ShopViewProps) {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('SHOP ALL');
  const [displayCount, setDisplayCount] = useState<number>(36);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<ShopProduct | null>(null);
  const [selectedAIProduct, setSelectedAIProduct] = useState<ShopProduct | null>(null);
  const [isLiveSyncing, setIsLiveSyncing] = useState<boolean>(true);
  
  // Callback Request state
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackName, setCallbackName] = useState('');
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);

  // Swatch selections
  const [selectedSwatches, setSelectedSwatches] = useState<Record<string, string>>({});

  // Real-Time Database Sync for Products
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setIsLiveSyncing(false);
      setIsLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name', { ascending: true })
          .limit(1000);

        if (data && !error && data.length > 0) {
          const dbProducts = data.map(parseProductFromRow);
          setProducts(dbProducts);
        }
      } catch (err) {
        console.warn('Notice: Error fetching products from database:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

    // Subscribe to all changes (INSERT, UPDATE, DELETE) in the products table
    const productsChannel = supabase
      .channel('public:products:realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'products' },
        (payload) => {
          const newProduct = parseProductFromRow(payload.new);
          setProducts((prev) => {
            const exists = prev.some((p) => p.id === newProduct.id);
            return exists ? prev.map((p) => (p.id === newProduct.id ? newProduct : p)) : [...prev, newProduct];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products' },
        (payload) => {
          const updatedProduct = parseProductFromRow(payload.new);
          setProducts((prev) =>
            prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
          );
          // If the customer has this product open in the order modal, update it immediately in real-time
          setSelectedProductForOrder((curr) => (curr && curr.id === updatedProduct.id ? updatedProduct : curr));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'products' },
        (payload) => {
          const deletedId = String(payload.old?.id || '');
          if (deletedId) {
            setProducts((prev) => prev.filter((p) => p.id !== deletedId));
            setSelectedProductForOrder((curr) => (curr && curr.id === deletedId ? null : curr));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
    };
  }, []);

  const categories = [
    'SHOP ALL',
    'SKINCARE',
    'BODY',
    'FRAGRANCE',
    'BALMS',
    'MAKEUP',
  ];

  const handleSwatchSelect = (productId: string, swatchName: string) => {
    setSelectedSwatches(prev => ({
      ...prev,
      [productId]: swatchName,
    }));
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'SHOP ALL' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();
    
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });

  // Visible sliced list for optimized performance
  const visibleProducts = filteredProducts.slice(0, displayCount);

  const handleCallToOrder = (product: ShopProduct) => {
    setSelectedProductForOrder(product);
    setCallbackSubmitted(false);
    setCallbackPhone('');
    setCallbackName('');
  };

  const submitCallback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone.trim()) return;

    const supabase = getSupabase();
    if (supabase && selectedProductForOrder) {
      try {
        await supabase.from('shop_callback_requests').insert([
          {
            product_id: selectedProductForOrder.id,
            product_name: selectedProductForOrder.name,
            product_price: selectedProductForOrder.price,
            swatch: selectedSwatches[selectedProductForOrder.id] || null,
            customer_name: callbackName.trim() || 'Valued Customer',
            customer_phone: callbackPhone.trim(),
            status: 'pending',
          }
        ]);
      } catch (err) {
        console.warn('Callback logged locally:', err);
      }
    }

    setCallbackSubmitted(true);
  };

  return (
    <div className="w-full bg-white text-black min-h-screen pb-16 animate-in fade-in duration-300">
      
      {/* Back to Editorial Row */}
      <div className="border-b border-gray-100 py-3 bg-neutral-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-black transition-colors duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Editorial Feed</span>
          </button>
        </div>
      </div>

      {/* 0. Elegant Shop Logo Banner */}
      <div className="text-center py-8 border-b border-gray-100 bg-neutral-50/30">
        <div className="flex justify-center items-center">
          <TurpeenLogo size="lg" />
        </div>
        <p className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase mt-3">
          ✦ Boutique Direct Shop ✦
        </p>
      </div>

      {/* 1. Shop Category Nav Bar */}
      <div className="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-xs z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-3 flex-wrap sm:flex-nowrap">
            
            {/* Category tabs */}
            <div className="flex space-x-6 overflow-x-auto whitespace-nowrap min-w-max text-xs font-mono uppercase tracking-widest font-semibold text-gray-400 select-none py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setDisplayCount(36);
                  }}
                  className={`hover:text-black transition-all duration-200 relative pb-1 cursor-pointer ${
                    selectedCategory === cat ? 'text-black border-b-2 border-black font-bold' : ''
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDisplayCount(36);
                }}
                placeholder="Search 500+ items..."
                className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-800 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 2. Sub-Header stats bar */}
      <div className="border-b border-gray-100 py-3 text-xs font-mono text-gray-500 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center select-none flex-wrap gap-2">
          <div className="flex items-center space-x-3">
            <span>
              Showing <span className="text-black font-bold">{visibleProducts.length}</span> of <span className="text-black font-bold">{filteredProducts.length} Items</span>
              {searchQuery && <span className="text-neutral-400 ml-1.5 font-normal">matching "{searchQuery}"</span>}
            </span>
            {isLiveSyncing && (
              <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 font-mono font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Database Sync Active</span>
              </span>
            )}
          </div>
          <div className="flex space-x-6 text-[11px]">
            <span>Category: <strong className="text-neutral-800">{selectedCategory}</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Grid of Real Database Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && products.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mx-auto" />
            <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest">
              Connecting to Turpeen Product Database...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-neutral-200 rounded-xl p-8 space-y-4 max-w-md mx-auto">
            <p className="font-serif text-lg font-bold text-neutral-800">
              No products found
            </p>
            <p className="text-xs text-neutral-500 font-light">
              {searchQuery
                ? `No products match "${searchQuery}" in ${selectedCategory}. Try another search term or category.`
                : `There are currently no items in category "${selectedCategory}".`}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('SHOP ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-neutral-900 text-white font-mono text-xs uppercase tracking-widest rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleProducts.map((product) => {
                return (
                  <div
                    id={`shop-item-${product.id}`}
                    key={product.id}
                    className="border border-gray-100 flex flex-col justify-between overflow-hidden group hover:shadow-md transition-all duration-300 bg-white"
                  >
                    {/* Image Stage */}
                    <div className="relative aspect-square bg-neutral-100 overflow-hidden border-b border-gray-50">
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                        loading="lazy"
                      />
                      
                      {/* Category / Quality badge */}
                      {product.badge && (
                        <span className={`absolute top-3 left-3 text-[9px] font-mono tracking-widest px-2.5 py-0.5 uppercase font-bold select-none ${
                          product.badgeType === 'mix' 
                            ? 'bg-blue-600 text-white' 
                            : product.badgeType === 'new'
                            ? 'bg-neutral-900 text-white'
                            : product.badgeType === 'rated'
                            ? 'bg-amber-500 text-white'
                            : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {/* Info and action area */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {product.brand && (
                          <span className="text-[9px] font-mono tracking-wider text-rose-700 uppercase font-semibold block mb-0.5">
                            {product.brand}
                          </span>
                        )}
                        <div className="flex justify-between items-baseline mb-1.5">
                          <h4 className="font-serif text-sm sm:text-base font-bold text-black group-hover:text-neutral-700 transition-colors duration-150 line-clamp-2">
                            {product.name}
                          </h4>
                        </div>
                        {product.subtitle && (
                          <p className="text-[11px] text-gray-500 font-light leading-tight line-clamp-2">
                            {product.subtitle}
                          </p>
                        )}

                        {/* Swatches selector if applicable */}
                        {product.swatches && product.swatches.length > 0 && (
                          <div className="mt-4 space-y-1.5">
                            <span className="text-[8px] font-mono uppercase tracking-widest text-gray-400 font-bold block">
                              Color: {selectedSwatches[product.id] || product.swatches[0].name}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {product.swatches.map((sw) => (
                                <button
                                  key={sw.name}
                                  onClick={() => handleSwatchSelect(product.id, sw.name)}
                                  className={`w-4 h-4 rounded-full border transition-all duration-150 relative cursor-pointer ${
                                    selectedSwatches[product.id] === sw.name
                                      ? 'border-black scale-110 shadow-xs ring-1 ring-black/20'
                                      : 'border-gray-200 hover:scale-105'
                                  }`}
                                  style={{ backgroundColor: sw.color }}
                                  title={sw.name}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Call to Order and AI Review Buttons */}
                      <div className="space-y-1.5 mt-2">
                        <button
                          id={`ai-review-btn-${product.id}`}
                          onClick={() => setSelectedAIProduct(product)}
                          className="w-full bg-rose-50/80 hover:bg-rose-100/80 text-rose-800 border border-rose-200/80 font-mono text-[9px] tracking-wider uppercase py-1.5 transition-colors cursor-pointer flex items-center justify-center space-x-1.5 font-medium rounded-xs shadow-2xs"
                        >
                          <Sparkles className="w-3 h-3 text-rose-600" />
                          <span>AI Review</span>
                        </button>

                        <button
                          id={`call-order-btn-${product.id}`}
                          onClick={() => handleCallToOrder(product)}
                          className="w-full bg-black hover:bg-neutral-800 text-white font-mono text-[10px] tracking-widest uppercase py-3 transition-transform duration-150 active:scale-98 cursor-pointer flex items-center justify-center space-x-2 font-bold shadow-xs"
                        >
                          <Phone className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" />
                          <span>Call to order</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button if more products remain */}
            {displayCount < filteredProducts.length && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => setDisplayCount((prev) => prev + 36)}
                  className="px-8 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-xs uppercase tracking-widest rounded-lg transition-colors cursor-pointer font-semibold shadow-xs"
                >
                  Load More Products ({filteredProducts.length - displayCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 4. Beautiful Interactive Call to Order Modal */}
      <AnimatePresence>
        {selectedProductForOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            
            {/* Modal Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProductForOrder(null)}
              className="fixed inset-0 bg-black/55 backdrop-blur-xs"
            />

            {/* Modal Content Drawer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-white border border-gray-100 max-w-md w-full relative z-10 shadow-2xl p-6 sm:p-8 space-y-6"
            >
              {/* Close Button */}
              <button
                id="modal-close-btn"
                onClick={() => setSelectedProductForOrder(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors duration-150 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Product brief */}
              <div className="flex items-center space-x-4 border-b border-gray-100 pb-4">
                <img
                  src={selectedProductForOrder.image}
                  alt={selectedProductForOrder.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 object-cover bg-neutral-100 border border-gray-100 shadow-xs"
                />
                <div>
                  <span className="text-[8px] font-mono tracking-widest text-gray-400 uppercase font-bold">
                    TC PRODUCT CATALOGUE
                  </span>
                  <h3 className="font-serif text-lg font-bold text-black leading-tight">
                    {selectedProductForOrder.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[11px] text-gray-500 font-light">
                      {selectedProductForOrder.subtitle}
                    </span>
                    {selectedSwatches[selectedProductForOrder.id] && selectedProductForOrder.swatches && (
                      <span className="text-[10px] font-mono text-gray-600 font-medium">
                        • {selectedSwatches[selectedProductForOrder.id]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Central Direct Ordering & WhatsApp Card */}
              <div className="bg-rose-50/70 border border-rose-100 p-5 rounded space-y-3 text-center">
                <span className="text-[10px] font-mono tracking-widest text-rose-600 uppercase font-bold block">
                  📞 DIRECT BOUTIQUE ORDERS & WHATSAPP
                </span>
                <p className="font-serif text-2xl font-bold text-black tracking-tight select-all">
                  {TURPEEN_SOCIAL_LINKS.phone}
                </p>
                <p className="text-[10px] text-gray-500 font-mono">
                  Refer to Item Code: <strong className="text-black font-semibold">TC-ORDER-{selectedProductForOrder.id.toUpperCase()}</strong>
                </p>

                {/* Direct WhatsApp Action Button */}
                <div className="pt-1">
                  <a
                    id="shop-modal-whatsapp-btn"
                    href={`https://wa.me/2347062296118?text=${encodeURIComponent(
                      `Hello Turpeen Cosmetics! I would like to order "${selectedProductForOrder.name}"${
                        selectedSwatches[selectedProductForOrder.id] ? ` in shade/color "${selectedSwatches[selectedProductForOrder.id]}"` : ''
                      }. Please confirm availability and delivery to my location.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] tracking-widest uppercase py-2.5 px-4 rounded-sm transition-all duration-150 w-full shadow-xs active:scale-98"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    <span>Order Directly on WhatsApp</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>
                </div>

                <p className="text-[11px] font-light text-gray-600 leading-relaxed pt-1">
                  Chat with our Lagos beauty consultants to confirm shade preferences and nationwide dispatch.
                </p>
              </div>

              {/* Alternate: Callback Form */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2 border-b border-gray-150 pb-1">
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-gray-700">
                    Or Request an Instant Callback
                  </span>
                </div>

                {callbackSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-neutral-50 border border-black/10 p-5 text-center space-y-1"
                  >
                    <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-2">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-mono font-bold text-black uppercase tracking-widest block">
                      CALLBACK REGISTERED! 🖤
                    </span>
                    <p className="text-[10px] text-gray-500 font-mono leading-relaxed max-w-xs mx-auto">
                      Our boutique representative will call you at <strong className="text-black font-semibold">{callbackPhone}</strong> shortly!
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={submitCallback} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        id="callback-name-input"
                        type="text"
                        required
                        placeholder="Your Name"
                        value={callbackName}
                        onChange={(e) => setCallbackName(e.target.value)}
                        className="bg-neutral-50/50 border border-gray-200 px-3 py-2 text-xs text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black rounded font-mono"
                      />
                      <input
                        id="callback-phone-input"
                        type="tel"
                        required
                        placeholder="Phone Number"
                        value={callbackPhone}
                        onChange={(e) => setCallbackPhone(e.target.value)}
                        className="bg-neutral-50/50 border border-gray-200 px-3 py-2 text-xs text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black rounded font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-black hover:bg-neutral-800 text-white font-mono text-[9px] tracking-widest uppercase py-3 transition-colors duration-150 cursor-pointer flex items-center justify-center space-x-1.5 font-bold"
                    >
                      <span>Submit Request</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </form>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Google AI Formulation Insight Modal */}
      <GoogleAIProductInsightModal
        product={selectedAIProduct}
        onClose={() => setSelectedAIProduct(null)}
      />

    </div>
  );
}
