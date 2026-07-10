import { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';
import { GLOSSIER_PRODUCTS } from '../data';

interface CartItem {
  product: Product;
  quantity: number;
}

interface ShopDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export default function ShopDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onAddToCart,
}: ShopDrawerProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'makeup' | 'skincare' | 'fragrance'>('all');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  if (!isOpen) return null;

  const filteredProducts = activeCategory === 'all'
    ? GLOSSIER_PRODUCTS
    : GLOSSIER_PRODUCTS.filter(p => p.category === activeCategory);

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutComplete(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Semi-transparent Overlay */}
      <div 
        id="shop-overlay"
        onClick={() => {
          if (!isCheckingOut) onClose();
        }}
        className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white flex flex-col shadow-2xl animate-in slide-in-from-right-8 duration-300">
          
          {/* Header */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-100 flex justify-between items-center bg-neutral-50">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-black" />
              <h3 className="font-serif text-lg font-bold text-black tracking-tight">
                Turpeen Cosmetics Counter
              </h3>
              {totalItems > 0 && (
                <span className="bg-black text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </div>
            <button
              id="shop-close-btn"
              onClick={onClose}
              className="text-gray-400 hover:text-black p-1 transition-colors duration-150 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Checkout Completed screen */}
          {checkoutComplete ? (
            <div className="flex-1 px-6 py-12 flex flex-col justify-center items-center text-center space-y-4 animate-in zoom-in-95 duration-300">
              <CheckCircle2 className="w-16 h-16 text-rose-500 animate-bounce" />
              <h4 className="font-serif text-2xl font-bold text-black">
                Enjoy Your Glow!
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 max-w-xs leading-relaxed font-light">
                Your Turpeen Cosmetics order has been successfully processed. These high-fidelity beauty staples will be heading your way!
              </p>
              
              <div className="w-full bg-neutral-50 p-4 border border-gray-100 rounded text-left text-xs space-y-1.5 font-mono">
                <span className="font-bold uppercase tracking-wider text-black block mb-1">Receipt Details</span>
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-gray-600">
                    <span>{item.product.name} (x{item.quantity})</span>
                    <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold text-black">
                  <span>Total Simulated Paid</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                id="checkout-reset-btn"
                onClick={() => {
                  setCheckoutComplete(false);
                  onClose();
                  // empty cart after checkout is handled in parent, but let's reset locally for now
                }}
                className="w-full bg-black hover:bg-neutral-800 text-white font-mono text-[10px] tracking-widest uppercase py-3.5 transition-colors duration-200 cursor-pointer"
              >
                Continue Browsing Turpeencosmetic
              </button>
            </div>
          ) : (
            <>
              {/* Product List + Category Select */}
              <div className="flex-1 overflow-y-auto flex flex-col">
                
                {/* Cart Items (Top half of drawer) */}
                <div className="p-4 sm:p-6 border-b border-gray-100 space-y-4">
                  <h4 className="font-mono text-[9px] tracking-widest uppercase font-bold text-gray-500">
                    Your Shopping Bag
                  </h4>
                  {cart.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400 font-mono flex flex-col items-center space-y-2">
                      <ShoppingBag className="w-8 h-8 text-neutral-200" />
                      <span>Your bag is empty. Explore products below!</span>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex items-center space-x-3 border-b border-gray-50 pb-3 last:border-none last:pb-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 object-cover bg-neutral-100 border border-gray-100 shadow-xs shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-serif text-sm font-semibold text-black truncate">{item.product.name}</h5>
                            <span className="text-[10px] font-mono text-gray-400 font-bold">${item.product.price} USD</span>
                          </div>
                          
                          {/* Quantities */}
                          <div className="flex items-center space-x-1.5 border border-gray-200 px-1.5 py-0.5 rounded bg-neutral-50">
                            <button
                              id={`cart-minus-${item.product.id}`}
                              onClick={() => onUpdateQuantity(item.product.id, -1)}
                              className="text-gray-500 hover:text-black p-0.5 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-mono font-bold w-4 text-center">{item.quantity}</span>
                            <button
                              id={`cart-plus-${item.product.id}`}
                              onClick={() => onUpdateQuantity(item.product.id, 1)}
                              className="text-gray-500 hover:text-black p-0.5 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Delete */}
                          <button
                            id={`cart-remove-${item.product.id}`}
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Explore Turpeen Cosmetics Boutique (Bottom half of drawer) */}
                <div className="p-4 sm:p-6 flex-1 flex flex-col space-y-4 bg-gray-50/50">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-mono text-[9px] tracking-widest uppercase font-bold text-gray-800">
                      Explore Turpeen
                    </h4>
                    {/* Category quick selectors */}
                    <div className="flex space-x-2 text-[9px] font-mono uppercase text-gray-400">
                      {(['all', 'makeup', 'skincare'] as const).map((cat) => (
                        <button
                          id={`filter-shop-${cat}`}
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`hover:text-black transition-colors duration-150 ${
                            activeCategory === cat ? 'text-black font-bold border-b border-black' : ''
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Boutique items grid */}
                  <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-72 pr-1">
                    {filteredProducts.map((product) => {
                      const isInCart = cart.some(item => item.product.id === product.id);

                      return (
                        <div
                          id={`shop-product-${product.id}`}
                          key={product.id}
                          className="bg-white border border-gray-100 p-3 flex flex-col justify-between shadow-xs hover:border-gray-200 transition-all duration-200 group"
                        >
                          <div>
                            <div className="aspect-square bg-neutral-100 overflow-hidden relative shadow-xs">
                              <img
                                src={product.image}
                                alt={product.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>
                            <h5 className="font-serif text-xs font-bold text-black mt-2 leading-tight">
                              {product.name}
                            </h5>
                            <p className="text-[10px] text-gray-500 leading-tight mt-1 font-light line-clamp-2">
                              {product.description}
                            </p>
                          </div>

                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                            <span className="font-mono text-[10px] font-bold text-black">
                              ${product.price}
                            </span>
                            <button
                              id={`shop-add-${product.id}`}
                              onClick={() => onAddToCart(product)}
                              className={`text-[8px] font-mono tracking-widest uppercase px-2 py-1 rounded transition-all duration-200 ${
                                isInCart 
                                  ? 'bg-rose-50 text-rose-600 border border-rose-100 font-bold' 
                                  : 'bg-black text-white hover:bg-neutral-800'
                              } cursor-pointer`}
                            >
                              {isInCart ? 'Added' : '+ Add'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Subtotal & Checkout Actions (Bottom Sticky) */}
              <div className="border-t border-gray-200 p-4 sm:p-6 space-y-4 bg-white">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs uppercase font-mono tracking-widest text-gray-400">Subtotal</span>
                  <span className="font-mono text-lg font-bold text-black">${subtotal.toFixed(2)} USD</span>
                </div>
                <p className="text-[10px] text-gray-400 font-light leading-normal">
                  Shipping and taxes are simulated. Fully functional clone cart demonstration.
                </p>

                <button
                  id="checkout-submit-btn"
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || isCheckingOut}
                  className={`w-full bg-black hover:bg-neutral-800 text-white font-mono text-[10px] tracking-widest uppercase py-4 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md ${
                    cart.length === 0 ? 'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400' : 'active:scale-98 cursor-pointer'
                  }`}
                >
                  {isCheckingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Simulated Checkout</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
