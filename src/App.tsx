/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Heart, Sparkles, ShoppingBag, ArrowUp } from 'lucide-react';
import { Article, Product, UserRoutine } from './types';
import { ARTICLES } from './data';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import LatestSection from './components/LatestSection';
import Sidebar from './components/Sidebar';
import ArticleView from './components/ArticleView';
import ShopDrawer from './components/ShopDrawer';
import ShareYourRoutine from './components/ShareYourRoutine';
import ShopView from './components/ShopView';
import AijayChatbot from './components/AijayChatbot';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function App() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeCategory, setActiveCategory] = useState<'Interviews' | 'Makeup' | 'Skincare' | 'Hair' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [currentView, setCurrentView] = useState<'feed' | 'shop'>('feed');
  
  // Modals & drawers
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Lists & stores
  const [userRoutines, setUserRoutines] = useState<UserRoutine[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load localStorage state safely on mount
  useEffect(() => {
    const storedRoutines = localStorage.getItem('itg-user-routines');
    if (storedRoutines) setUserRoutines(JSON.parse(storedRoutines));

    const storedBookmarks = localStorage.getItem('itg-bookmarks');
    if (storedBookmarks) setBookmarks(JSON.parse(storedBookmarks));

    const storedCart = localStorage.getItem('itg-cart');
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  // Save states to localStorage on state change
  const saveRoutines = (newRoutines: UserRoutine[]) => {
    setUserRoutines(newRoutines);
    localStorage.setItem('itg-user-routines', JSON.stringify(newRoutines));
  };

  const saveBookmarks = (newBookmarks: string[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem('itg-bookmarks', JSON.stringify(newBookmarks));
  };

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('itg-cart', JSON.stringify(newCart));
  };

  // Routine Handlers
  const handleAddRoutine = (routine: UserRoutine) => {
    const updated = [routine, ...userRoutines];
    saveRoutines(updated);
  };

  const handleSelectRoutine = (routine: UserRoutine) => {
    const converted = convertRoutineToArticle(routine);
    setSelectedArticle(converted);
  };

  const convertRoutineToArticle = (routine: UserRoutine): Article => {
    return {
      id: routine.id,
      title: routine.title,
      subtitle: `By ${routine.name}, ${routine.occupation} — ${routine.location}`,
      slug: `routine-${routine.id}`,
      category: 'Interviews',
      badge: 'THE TOP SHELF',
      author: routine.name,
      date: routine.createdAt,
      readTime: '3 min read',
      excerpt: routine.routine,
      images: [
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80',
      ],
      blocks: [
        {
          type: 'paragraph',
          text: routine.routine,
        },
        {
          type: 'heading',
          text: 'The Swear-By Beauty Staple',
        },
        {
          type: 'product-highlight',
          productName: routine.favoriteProduct,
          productBrand: 'Glossier Counter Selection',
          productDesc: `“This is the single beauty staple I would take with me to a deserted island. It is foolproof, hydrating, and gives me instant confidence.”`,
        },
      ],
    };
  };

  // Bookmark Handlers
  const handleToggleBookmark = (articleId: string) => {
    const exists = bookmarks.includes(articleId);
    if (exists) {
      const filtered = bookmarks.filter(id => id !== articleId);
      saveBookmarks(filtered);
    } else {
      const updated = [...bookmarks, articleId];
      saveBookmarks(updated);
    }
  };

  // Cart / Shop Handlers
  const handleAddToCart = (product: Product) => {
    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      saveCart(updated);
    } else {
      const updated = [...cart, { product, quantity: 1 }];
      saveCart(updated);
    }
    // Automatically open drawer on add to guide user
    setIsShopOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const updated = cart
      .map(item => {
        if (item.product.id === productId) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      })
      .filter(item => item.quantity > 0);
    saveCart(updated);
  };

  const handleRemoveItem = (productId: string) => {
    const filtered = cart.filter(item => item.product.id !== productId);
    saveCart(filtered);
  };

  // Filters Calculation
  const heroArticle = ARTICLES.find(a => a.isHero) || ARTICLES[0];
  const secondaryHeroArticle = ARTICLES.find(a => a.isSecondaryHero) || ARTICLES[1];

  // Articles list (excluding heroes for the "Latest" section, matching layout)
  const regularLatestArticles = ARTICLES.filter(a => !a.isHero && !a.isSecondaryHero && !a.isSidebar);
  const sidebarArticles = ARTICLES.filter(a => a.isSidebar);

  // Compute final filtered articles
  const filteredLatestArticles = regularLatestArticles.filter((article) => {
    // 1. Category Filter
    if (activeCategory && article.category !== activeCategory) return false;

    // 2. Search query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = article.title.toLowerCase().includes(q);
      const matchExcerpt = article.excerpt.toLowerCase().includes(q);
      const matchCategory = article.category.toLowerCase().includes(q);
      if (!matchTitle && !matchExcerpt && !matchCategory) return false;
    }

    // 3. Bookmarks filter
    if (showBookmarksOnly && !bookmarks.includes(article.id)) return false;

    return true;
  });

  // Also filter user routine submission list under the same constraints if no category restricts, or if the search queries match
  const filteredUserRoutines = userRoutines.filter((routine) => {
    if (activeCategory && activeCategory !== 'Interviews') return false; // Routines are classified under Interviews
    if (showBookmarksOnly && !bookmarks.includes(routine.id)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = routine.name.toLowerCase().includes(q);
      const matchTitle = routine.title.toLowerCase().includes(q);
      const matchRoutine = routine.routine.toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchRoutine) return false;
    }
    return true;
  });

  const totalFilteredCount = filteredLatestArticles.length + filteredUserRoutines.length;

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 selection:bg-rose-100 selection:text-rose-900 flex flex-col justify-between">
      
      {/* Top Header Row */}
      <Header
        activeCategory={activeCategory}
        setActiveCategory={(cat) => {
          setActiveCategory(cat);
          setSelectedArticle(null); // Return to list view
          setCurrentView('feed');
        }}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          setSelectedArticle(null); // Return to list view on search
          setCurrentView('feed');
        }}
        onOpenShop={() => setCurrentView('shop')}
        onOpenShare={() => setIsShareOpen(true)}
        bookmarksCount={bookmarks.length}
        showBookmarksOnly={showBookmarksOnly}
        onShowBookmarks={() => {
          setShowBookmarksOnly(!showBookmarksOnly);
          setSelectedArticle(null); // Return to list view on filter change
          setCurrentView('feed');
        }}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {currentView === 'shop' ? (
          <ShopView onBack={() => setCurrentView('feed')} />
        ) : selectedArticle ? (
          /* Detailed Editorial/Article View */
          <ArticleView
            article={selectedArticle}
            onBack={() => setSelectedArticle(null)}
            isBookmarked={bookmarks.includes(selectedArticle.id)}
            onToggleBookmark={() => handleToggleBookmark(selectedArticle.id)}
            onAddProductToBag={handleAddToCart}
            onSelectArticle={setSelectedArticle}
          />
        ) : (
          /* Homepage list view */
          <div className="space-y-8 sm:space-y-12">
            
            {/* Show landing page heroes ONLY if no filters are currently active */}
            {!activeCategory && !searchQuery && !showBookmarksOnly && (
              <HeroSection
                heroArticle={heroArticle}
                secondaryHeroArticle={secondaryHeroArticle}
                onSelectArticle={setSelectedArticle}
              />
            )}

            {/* Main Content splits (Latest vs. Sidebar) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
              
              {/* Left Feed Section (Span 8) */}
              <div className="lg:col-span-8 space-y-8">
                {/* Bookmarks feedback badge */}
                {showBookmarksOnly && (
                  <div className="bg-rose-50 border border-rose-100 p-4 flex items-center justify-between text-rose-800 rounded">
                    <div className="flex items-center space-x-2 text-xs font-mono font-medium uppercase">
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      <span>Viewing Bookmarked Top Shelves ({bookmarks.length})</span>
                    </div>
                    <button
                      id="clear-bookmarks-filter-btn"
                      onClick={() => setShowBookmarksOnly(false)}
                      className="text-[10px] uppercase font-mono font-bold tracking-wider hover:underline"
                    >
                      Clear Filter
                    </button>
                  </div>
                )}

                {/* Categories feedback badge */}
                {activeCategory && (
                  <div className="bg-neutral-50 border border-neutral-200 p-4 flex items-center justify-between text-neutral-800">
                    <div className="flex items-center space-x-2 text-xs font-mono font-medium uppercase">
                      <span>Category: <strong className="text-black font-semibold">{activeCategory}</strong></span>
                    </div>
                    <button
                      id="clear-cat-filter-btn"
                      onClick={() => setActiveCategory(null)}
                      className="text-[10px] uppercase font-mono font-bold tracking-wider hover:underline"
                    >
                      All Articles
                    </button>
                  </div>
                )}

                {/* No results handler */}
                {totalFilteredCount === 0 ? (
                  <div className="text-center py-16 border border-dashed border-gray-200 bg-neutral-50/50 space-y-3">
                    <p className="font-serif text-lg text-gray-500 italic">
                      “We couldn’t find any shelves matching your search.”
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      Try adjusting your keywords or clearing the category filters.
                    </p>
                    <button
                      id="reset-all-filters-btn"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory(null);
                        setShowBookmarksOnly(false);
                      }}
                      className="bg-black hover:bg-neutral-800 text-white font-mono text-[9px] tracking-widest uppercase px-4 py-2 mt-2 cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <LatestSection
                    latestArticles={filteredLatestArticles}
                    userRoutines={filteredUserRoutines}
                    onSelectArticle={setSelectedArticle}
                    onSelectRoutine={handleSelectRoutine}
                  />
                )}
              </div>

              {/* Right Sidebar Section (Span 4) */}
              <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-8 lg:pt-0">
                <Sidebar
                  sidebarArticles={sidebarArticles}
                  onSelectArticle={setSelectedArticle}
                />
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Styled Footer */}
      <footer className="w-full border-t border-gray-100 bg-white py-12 mt-16 text-center text-xs font-mono tracking-wider uppercase text-gray-400">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex justify-center space-x-6 text-[10px]">
            <a href="#about" className="hover:text-black">About</a>
            <a href="#privacy" className="hover:text-black">Privacy Policy</a>
            <a href="#terms" className="hover:text-black">Terms of Service</a>
            <a href="#contact" className="hover:text-black">Contact</a>
          </div>
          <p className="text-[9px] text-gray-400/80">
            Turpeencosmetic © {new Date().getFullYear()}. All product rights belong to Turpeen Cosmetics. Replicated for demonstration purposes.
          </p>
        </div>
      </footer>

      {/* Slide-over Shopping Drawer */}
      <ShopDrawer
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onAddToCart={handleAddToCart}
      />

      {/* Publish Shelf Portal / Modal */}
      <ShareYourRoutine
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onAddRoutine={handleAddRoutine}
      />

      {/* Aijay Chatbot Widget */}
      <AijayChatbot />

      {/* Float to Top helper widget */}
      <button
        id="scroll-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-2.5 bg-white border border-gray-200 rounded-full shadow-md text-gray-500 hover:text-black hover:border-black transition-all hover:scale-110 active:scale-95 cursor-pointer"
        title="Scroll to top"
      >
        <ArrowUp className="w-4 h-4" />
      </button>

    </div>
  );
}

