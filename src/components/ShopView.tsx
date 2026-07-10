import React, { useState } from 'react';
import { Phone, X, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TurpeenLogo } from './TurpeenLogo';

interface ShopViewProps {
  onBack: () => void;
}

interface ShopProduct {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  originalPrice?: string;
  badge?: string;
  badgeType?: 'best' | 'mix' | 'new' | 'rated';
  image: string;
  category: string;
  swatches?: { name: string; color: string }[];
}

const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'sb-1',
    name: 'Boy Brow',
    subtitle: 'Grooming pomade',
    price: '₦35,600',
    badge: 'BEST SELLER',
    badgeType: 'best',
    image: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&w=600&q=80',
    category: 'makeup',
    swatches: [
      { name: 'Black', color: '#1A1A1A' },
      { name: 'Brown', color: '#4B3621' },
      { name: 'Auburn', color: '#9E5B38' },
      { name: 'Blonde', color: '#D2B48C' },
      { name: 'Clear', color: '#F5F5F5' },
    ],
  },
  {
    id: 'sb-2',
    name: 'Fragrance Duo',
    subtitle: 'Choose your scents',
    price: '₦225,420',
    originalPrice: '₦268,200',
    badge: 'MIX + MATCH',
    badgeType: 'mix',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80',
    category: 'sets',
  },
  {
    id: 'sb-3',
    name: 'Fragrance Two Ways',
    subtitle: 'Choose your scents',
    price: '₦155,740',
    originalPrice: '₦184,800',
    badge: 'MIX + MATCH',
    badgeType: 'mix',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80',
    category: 'sets',
  },
  {
    id: 'sb-4',
    name: 'Balm Dotcom',
    subtitle: 'Nourishing lip balm',
    price: '₦25,900',
    badge: 'BEST SELLER',
    badgeType: 'best',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=600&q=80',
    category: 'balms',
    swatches: [
      { name: 'Wild Cherry', color: '#D2143A' },
      { name: 'Birthday', color: '#E8CCD7' },
      { name: 'Coconut', color: '#FFF8E7' },
      { name: 'Mango', color: '#FF8000' },
      { name: 'Mint', color: '#98FF98' },
      { name: 'Rose', color: '#FFC0CB' },
    ],
  },
  {
    id: 'sb-5',
    name: 'Cloud Paint Blush',
    subtitle: 'Seamless cheek color',
    price: '₦58,900',
    badge: 'BEST SELLER',
    badgeType: 'best',
    image: 'https://images.unsplash.com/photo-1631730359575-38e4755d772b?auto=format&fit=crop&w=600&q=80',
    category: 'makeup',
    swatches: [
      { name: 'Puff', color: '#FFC5D9' },
      { name: 'Beam', color: '#FFA07A' },
      { name: 'Haze', color: '#C71585' },
      { name: 'Dusk', color: '#CD853F' },
      { name: 'Dawn', color: '#FF4500' },
    ],
  },
  {
    id: 'sb-6',
    name: 'Cloud Paint Bronzer',
    subtitle: 'Seamless cheek color',
    price: '₦25,900',
    originalPrice: '₦28,900',
    badge: 'BEST SELLER',
    badgeType: 'best',
    image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=600&q=80',
    category: 'makeup',
    swatches: [
      { name: 'Sail', color: '#CD853F' },
      { name: 'Dune', color: '#8B4513' },
      { name: 'Solar', color: '#A0522D' },
      { name: 'Ray', color: '#DEB887' },
    ],
  },
  {
    id: 'sb-7',
    name: 'Milky Jelly Cleanser',
    subtitle: 'Conditioning face wash',
    price: '₦39,000',
    badge: 'BEST SELLER',
    badgeType: 'best',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    category: 'skincare',
  },
  {
    id: 'sb-8',
    name: 'Futuredew',
    subtitle: 'Oil-serum hybrid',
    price: '₦48,500',
    badge: 'TOP-RATED',
    badgeType: 'rated',
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80',
    category: 'skincare',
  },
  {
    id: 'sb-9',
    name: 'Turpeen You Perfume',
    subtitle: 'The personal fragrance',
    price: '₦112,000',
    badge: 'NEW',
    badgeType: 'new',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80',
    category: 'fragrance',
  },
];

export default function ShopView({ onBack }: ShopViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('SHOP ALL');
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<ShopProduct | null>(null);
  
  // Callback Request state
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackName, setCallbackName] = useState('');
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);

  // Swatch selections
  const [selectedSwatches, setSelectedSwatches] = useState<Record<string, string>>({
    'sb-1': 'Black',
    'sb-4': 'Wild Cherry',
    'sb-5': 'Puff',
    'sb-6': 'Sail',
  });

  const categories = [
    'SKINCARE',
    'MAKEUP',
    'BALMS',
    'BODY',
    'FRAGRANCE',
    'GLOSSIER GOODS',
    'SETS',
    'SHOP ALL',
  ];

  const handleSwatchSelect = (productId: string, swatchName: string) => {
    setSelectedSwatches(prev => ({
      ...prev,
      [productId]: swatchName,
    }));
  };

  const filteredProducts = selectedCategory === 'SHOP ALL'
    ? SHOP_PRODUCTS
    : SHOP_PRODUCTS.filter(p => p.category === selectedCategory.toLowerCase().replace(' ', ''));

  const handleCallToOrder = (product: ShopProduct) => {
    setSelectedProductForOrder(product);
    setCallbackSubmitted(false);
    setCallbackPhone('');
    setCallbackName('');
  };

  const submitCallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone.trim()) return;
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
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto">
          <div className="flex space-x-8 py-4 justify-start md:justify-center whitespace-nowrap min-w-max text-xs font-mono uppercase tracking-widest font-semibold text-gray-400 select-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`hover:text-black transition-all duration-200 relative pb-1 cursor-pointer ${
                  selectedCategory === cat ? 'text-black border-b border-black font-bold' : ''
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Sub-Header stats bar */}
      <div className="border-b border-gray-100 py-3 text-xs font-mono text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-baseline select-none">
          <div>
            View <span className="text-black font-bold">(Product)</span>
          </div>
          <div className="flex space-x-6">
            <span>Filter (0)</span>
            <span>Sort (Featured)</span>
          </div>
        </div>
      </div>

      {/* 3. Grid of Products and Decorative Banners */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
          {/* BANNER CARD 1: Meet your furry friend's-soon-to-be favorites */}
          <div className="border border-gray-100 flex flex-col justify-between overflow-hidden group shadow-xs">
            <div className="relative aspect-square bg-neutral-100 overflow-hidden flex-1">
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80"
                alt="Meet your furry friend's favorites"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/15 group-hover:bg-black/20 transition-colors duration-300" />
            </div>
            <div className="p-5 bg-neutral-50 space-y-3">
              <p className="font-serif italic text-sm text-neutral-800 leading-snug font-medium">
                Meet your furry friend’s-soon-to-be favorites.
              </p>
              <button
                onClick={() => setSelectedCategory('SETS')}
                className="inline-block bg-white border border-gray-200 text-[10px] font-mono tracking-widest uppercase px-4 py-2 font-bold hover:border-black transition-colors duration-150 cursor-pointer"
              >
                Shop now
              </button>
            </div>
          </div>

          {/* Dynamic Map of Products */}
          {filteredProducts.map((product) => {
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
                    <div className="flex justify-between items-baseline mb-1.5">
                      <h4 className="font-serif text-sm sm:text-base font-bold text-black group-hover:text-neutral-700 transition-colors duration-150">
                        {product.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-gray-500 font-light leading-tight">
                      {product.subtitle}
                    </p>

                    {/* Price with Original support */}
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="font-mono text-xs font-bold text-black">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="font-mono text-[10px] text-gray-400 line-through">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Swatches selector if applicable */}
                    {product.swatches && (
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

                  {/* Call to Order Button (Replaced Add to Bag) */}
                  <button
                    id={`call-order-btn-${product.id}`}
                    onClick={() => handleCallToOrder(product)}
                    className="w-full bg-black hover:bg-neutral-800 text-white font-mono text-[10px] tracking-widest uppercase py-3 transition-transform duration-150 active:scale-98 cursor-pointer flex items-center justify-center space-x-2 font-bold shadow-xs mt-2"
                  >
                    <Phone className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" />
                    <span>Call to order</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* BANNER CARD 2: Easy to pick up. Impossible to put down. */}
          <div className="border border-gray-100 flex flex-col justify-between overflow-hidden group shadow-xs">
            <div className="relative aspect-square bg-neutral-100 overflow-hidden flex-1">
              <img
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80"
                alt="Easy to pick up. Impossible to put down."
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/15 transition-colors duration-300" />
            </div>
            <div className="p-5 bg-neutral-900 text-white space-y-3">
              <p className="font-serif italic text-xs text-neutral-300 leading-relaxed font-light">
                Easy to pick up. Impossible to put down. Get lost in Glossier You.
              </p>
              <button
                onClick={() => handleCallToOrder(SHOP_PRODUCTS.find(p => p.id === 'sb-9') || SHOP_PRODUCTS[0])}
                className="inline-block bg-white text-black text-[10px] font-mono tracking-widest uppercase px-4 py-2 font-bold hover:bg-neutral-100 transition-colors duration-150 cursor-pointer"
              >
                you smell good.
              </button>
            </div>
          </div>

        </div>
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
                    <span className="font-mono text-sm font-bold text-black">
                      {selectedProductForOrder.price}
                    </span>
                    {selectedSwatches[selectedProductForOrder.id] && selectedProductForOrder.swatches && (
                      <span className="text-[10px] font-mono text-gray-500">
                        • {selectedSwatches[selectedProductForOrder.id]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Central Direct Calling Card */}
              <div className="bg-rose-50 border border-rose-100 p-5 rounded space-y-3 text-center">
                <span className="text-[10px] font-mono tracking-widest text-rose-500 uppercase font-bold block">
                  📞 DIRECT BOUTIQUE HOTLINE
                </span>
                <p className="font-serif text-2xl font-bold text-black tracking-tight select-all">
                  +234 812 345 6789
                </p>
                <p className="text-[10px] text-gray-500 font-mono">
                  Refer to Item Code: <strong className="text-black font-semibold">TC-ORDER-{selectedProductForOrder.id.toUpperCase()}</strong>
                </p>
                <p className="text-[11px] font-light text-gray-600 leading-relaxed">
                  Call our premium Turpeen Cosmetics consultants to finalize your size/shade preferences and dispatch immediate nationwide delivery.
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

    </div>
  );
}
