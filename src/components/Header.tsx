import { useState } from 'react';
import { Search, X, Heart, Menu, Edit3 } from 'lucide-react';
import { TurpeenIcon, TurpeenWordmark } from './TurpeenLogo';

interface HeaderProps {
  activeCategory: string | null;
  setActiveCategory: (category: 'Interviews' | 'Makeup' | 'Skincare' | 'Hair' | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenShop: () => void;
  onOpenShare: () => void;
  bookmarksCount: number;
  onShowBookmarks: () => void;
  showBookmarksOnly: boolean;
}

export default function Header({
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  onOpenShop,
  onOpenShare,
  bookmarksCount,
  onShowBookmarks,
  showBookmarksOnly,
}: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const categories: ('Interviews' | 'Makeup' | 'Skincare' | 'Hair')[] = [
    'Interviews',
    'Makeup',
    'Skincare',
    'Hair',
  ];

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-40 transition-all duration-300">
      {/* Topmost Brand Indicator Bar */}
      <div className="w-full border-b border-gray-100 py-1.5 flex justify-center items-center bg-gray-50 text-[10px] tracking-widest font-mono text-gray-500 uppercase">
        <span className="font-bold text-black text-sm select-none hover:scale-110 transition-transform duration-200 cursor-pointer">T</span>
      </div>

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
          {categories.map((cat) => (
            <button
              id={`nav-cat-${cat.toLowerCase()}`}
              key={cat}
              onClick={() => {
                setActiveCategory(activeCategory === cat ? null : cat);
                if (showBookmarksOnly) onShowBookmarks(); // turn off bookmarks if changing category
              }}
              className={`hover:text-black cursor-pointer pb-1 transition-all duration-200 relative ${
                activeCategory === cat && !showBookmarksOnly
                  ? 'text-black font-semibold border-b border-black'
                  : 'text-gray-500'
              }`}
            >
              {cat}
            </button>
          ))}

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
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center select-none text-center cursor-pointer hover:opacity-85 transition-opacity duration-250"
        >
          <TurpeenWordmark className="text-2.5xl sm:text-3.5xl" />
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Write / Share Top Shelf */}
          <button
            id="share-shelf-btn"
            onClick={onOpenShare}
            className="flex items-center space-x-1.5 text-xs tracking-widest font-medium uppercase text-gray-600 hover:text-black transition-colors duration-200 cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-rose-500" />
            <span className="hidden lg:inline">Share Routine</span>
          </button>

          {/* Bookmarks Toggle */}
          <button
            id="bookmarks-toggle-btn"
            onClick={onShowBookmarks}
            className={`flex items-center space-x-1 p-1.5 rounded-full hover:bg-gray-50 transition-colors duration-200 cursor-pointer relative ${
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
            onClick={onOpenShop}
            className="bg-black hover:bg-neutral-800 text-white font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 sm:px-4 sm:py-2 transition-all duration-300 flex items-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <TurpeenIcon className="w-4 h-4 text-rose-300" color="currentColor" />
            <span>Shop Turpeen</span>
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
            {categories.map((cat) => (
              <button
                id={`mobile-nav-cat-${cat.toLowerCase()}`}
                key={cat}
                onClick={() => {
                  setActiveCategory(activeCategory === cat ? null : cat);
                  if (showBookmarksOnly) onShowBookmarks();
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left py-1 ${
                  activeCategory === cat && !showBookmarksOnly ? 'text-black font-semibold' : 'text-gray-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
