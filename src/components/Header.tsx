import { useState, useRef, useEffect } from 'react';
import { Search, X, Heart, Menu, Edit3 } from 'lucide-react';
import { TurpeenIcon, TurpeenWordmark } from './TurpeenLogo';
import { InstagramIcon, TikTokIcon, WhatsAppIcon, TURPEEN_SOCIAL_LINKS } from './SocialIcons';

interface HeaderProps {
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenShop: (category?: string) => void;
  onOpenAbout?: () => void;
  onOpenShare: () => void;
  onOpenCreateArticle?: () => void;
  bookmarksCount: number;
  onShowBookmarks: () => void;
  showBookmarksOnly: boolean;
  currentView?: 'feed' | 'shop' | 'about';
}

export default function Header({
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  onOpenShop,
  onOpenAbout,
  onOpenShare,
  onOpenCreateArticle,
  bookmarksCount,
  onShowBookmarks,
  showBookmarksOnly,
  currentView = 'feed',
}: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, [isSearchOpen]);

  const categories: ('Makeup' | 'Skincare' | 'Hair')[] = [
    'Makeup',
    'Skincare',
    'Hair',
  ];

  return (
    <header ref={headerRef} className="w-full bg-white border-b border-gray-100 sticky top-0 z-40 transition-all duration-300">
      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex justify-between items-center relative">
        {/* Mobile Menu Toggle */}
        <button
          id="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-gray-600 hover:text-black focus:outline-none transition-colors duration-200"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Left Side Links */}
        <nav className="hidden md:flex items-center space-x-6 text-xs uppercase tracking-widest font-medium text-gray-600">
          {categories.map((cat) => {
            const isCatActive =
              activeCategory?.toLowerCase() === cat.toLowerCase() && !showBookmarksOnly;
            return (
              <button
                id={`nav-cat-${cat.toLowerCase()}`}
                key={cat}
                onClick={() => {
                  onOpenShop(cat);
                  if (showBookmarksOnly) onShowBookmarks();
                }}
                className={`hover:text-black cursor-pointer pb-1 transition-all duration-200 relative ${
                  isCatActive
                    ? 'text-black font-semibold border-b border-black'
                    : 'text-gray-500'
                }`}
              >
                {cat}
              </button>
            );
          })}

          {/* About Navigation Link */}
          {onOpenAbout && (
            <button
              id="nav-about-btn"
              onClick={onOpenAbout}
              className={`hover:text-black cursor-pointer pb-1 transition-all duration-200 relative ${
                currentView === 'about'
                  ? 'text-black font-semibold border-b border-black'
                  : 'text-gray-500'
              }`}
            >
              About
            </button>
          )}

          {/* Search Trigger */}
          <div className="flex items-center space-x-2 border-l border-gray-200 pl-4 h-4">
            {isSearchOpen ? (
              <div className="flex items-center space-x-1.5 animate-in fade-in slide-in-from-left-2 duration-200">
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search Turpeencosmetic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-none bg-gray-50 px-2 py-0.5 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black rounded"
                />
                <button
                  id="search-close-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="text-gray-400 hover:text-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="search-open-btn"
                onClick={() => setIsSearchOpen(true)}
                className="hover:text-black transition-colors duration-200"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>
        </nav>

        {/* Center Logo - "turpeen." */}
        <div 
          onClick={() => {
            setActiveCategory(null);
            if (showBookmarksOnly) onShowBookmarks();
            setSearchQuery('');
          }}
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center select-none text-center cursor-pointer hover:opacity-85 transition-opacity duration-250 z-10"
        >
          <TurpeenWordmark />
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-4">
          {/* Write / Share Top Shelf */}
          <button
            id="share-shelf-btn"
            onClick={onOpenShare}
            className="flex items-center space-x-1.5 text-xs tracking-widest font-medium uppercase text-gray-600 hover:text-black transition-colors duration-200 cursor-pointer p-1 sm:p-0"
          >
            <Edit3 className="w-4 h-4 text-rose-500" />
            <span className="hidden lg:inline">Share Routine</span>
          </button>

          {/* Bookmarks Toggle */}
          <button
            id="bookmarks-toggle-btn"
            onClick={onShowBookmarks}
            className={`flex items-center space-x-1 p-1 sm:p-1.5 rounded-full hover:bg-gray-50 transition-colors duration-200 cursor-pointer relative ${
              showBookmarksOnly ? 'text-rose-600 bg-rose-50' : 'text-gray-500 hover:text-black'
            }`}
            title="Bookmarked articles"
          >
            <Heart className={`w-4 h-4 ${showBookmarksOnly ? 'fill-rose-500' : ''}`} />
            {bookmarksCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                {bookmarksCount}
              </span>
            )}
          </button>

          {/* Shop Turpeen Button */}
          <button
            id="shop-glossier-btn"
            onClick={() => onOpenShop()}
            className="bg-black hover:bg-neutral-800 text-white font-mono text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest uppercase px-2.5 py-1.5 sm:px-4 sm:py-2 transition-all duration-300 flex items-center space-x-1 sm:space-x-1.5 shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <TurpeenIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-300" color="currentColor" />
            <span>Shop<span className="hidden sm:inline"> Turpeen</span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Search and Categories Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="relative">
            <input
              id="mobile-search-input"
              type="text"
              placeholder="Search Turpeencosmetic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 text-xs px-3 py-2 pl-9 focus:outline-none focus:ring-1 focus:ring-black rounded"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <div className="flex flex-col space-y-3 text-xs uppercase tracking-widest font-medium text-gray-600">
            {categories.map((cat) => {
              const isCatActive =
                activeCategory?.toLowerCase() === cat.toLowerCase() && !showBookmarksOnly;
              return (
                <button
                  id={`mobile-nav-cat-${cat.toLowerCase()}`}
                  key={cat}
                  onClick={() => {
                    onOpenShop(cat);
                    if (showBookmarksOnly) onShowBookmarks();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left py-1 ${
                    isCatActive ? 'text-black font-semibold' : 'text-gray-500'
                  }`}
                >
                  {cat}
                </button>
              );
            })}

            {onOpenAbout && (
              <button
                id="mobile-nav-about-btn"
                onClick={() => {
                  onOpenAbout();
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left py-1 ${
                  currentView === 'about' ? 'text-black font-semibold' : 'text-gray-500'
                }`}
              >
                About
              </button>
            )}

            {/* Mobile Social Links */}
            <div className="pt-3 border-t border-gray-100 flex items-center space-x-4">
              <a
                id="mobile-nav-instagram"
                href={TURPEEN_SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 text-gray-500 hover:text-rose-600"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span className="text-[10px]">Instagram</span>
              </a>
              <a
                id="mobile-nav-tiktok"
                href={TURPEEN_SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 text-gray-500 hover:text-black"
              >
                <TikTokIcon className="w-3.5 h-3.5" />
                <span className="text-[10px]">TikTok</span>
              </a>
              <a
                id="mobile-nav-whatsapp"
                href={TURPEEN_SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 text-gray-500 hover:text-emerald-600"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span className="text-[10px]">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
