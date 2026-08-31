import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Article } from '../types';
import { TOP_25_BRANDS } from '../data';
import { handleImageError, DEFAULT_FALLBACK_IMAGE } from '../utils/imageParser';
import { InstagramIcon, TikTokIcon, WhatsAppIcon, TURPEEN_SOCIAL_LINKS } from './SocialIcons';

interface SidebarProps {
  sidebarArticles: Article[];
  onSelectArticle: (article: Article) => void;
  onSelectBrand?: (brand: typeof TOP_25_BRANDS[0]) => void;
}

export default function Sidebar({
  sidebarArticles,
  onSelectArticle,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'dontMiss' | 'mostPopular'>('dontMiss');
  const [selectedBrandIndex, setSelectedBrandIndex] = useState<number | null>(null);

  // Split sidebar articles or mock most popular ones
  const dontMissArticles = sidebarArticles.slice(0, 4);
  const mostPopularArticles = [...sidebarArticles].reverse().slice(0, 4);

  const displayedArticles = activeTab === 'dontMiss' ? dontMissArticles : mostPopularArticles;

  return (
    <aside className="space-y-10 lg:pl-4">
      
      {/* 1. Keep In Touch Section */}
      <div className="border border-gray-100 p-6 text-center bg-gray-50/50">
        <h4 className="font-mono text-[10px] tracking-widest uppercase font-semibold text-gray-800 mb-1">
          Keep In Touch
        </h4>
        <p className="text-[11px] text-gray-500 font-light max-w-[200px] mx-auto mb-4 leading-normal">
          Get daily beauty interviews and product reports.
        </p>
        <div className="flex justify-center items-center space-x-3">
          {/* Instagram */}
          <a
            id="sidebar-social-instagram"
            href={TURPEEN_SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-rose-600 hover:border-rose-500 transition-all duration-200 cursor-pointer shadow-2xs"
            title="Instagram (@turpeen_cosmetics)"
          >
            <InstagramIcon className="w-4 h-4" />
          </a>

          {/* TikTok */}
          <a
            id="sidebar-social-tiktok"
            href={TURPEEN_SOCIAL_LINKS.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-black hover:border-black transition-all duration-200 cursor-pointer shadow-2xs"
            title="TikTok (@turpeen_cosmetics)"
          >
            <TikTokIcon className="w-4 h-4" />
          </a>

          {/* WhatsApp */}
          <a
            id="sidebar-social-whatsapp"
            href={TURPEEN_SOCIAL_LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:border-emerald-500 transition-all duration-200 cursor-pointer shadow-2xs"
            title="WhatsApp Orders"
          >
            <WhatsAppIcon className="w-4 h-4" />
          </a>

          {/* Newsletter / Mail */}
          <a
            id="sidebar-social-mail"
            href={`tel:${TURPEEN_SOCIAL_LINKS.phone}`}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-black hover:border-black transition-all duration-200 cursor-pointer shadow-2xs"
            title="Call 07062296118"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* 2. Interactive Don't Miss / Most Popular Tabs */}
      <div className="space-y-6">
        <div className="flex border-b border-gray-100 pb-2 justify-between items-baseline">
          <div className="flex space-x-4">
            <button
              id="tab-dont-miss"
              onClick={() => setActiveTab('dontMiss')}
              className={`font-mono text-[10px] tracking-widest uppercase font-bold cursor-pointer transition-colors duration-200 ${
                activeTab === 'dontMiss' ? 'text-black border-b border-black pb-2 -mb-2.5' : 'text-gray-400 hover:text-black'
              }`}
            >
              Don't Miss
            </button>
            <button
              id="tab-most-popular"
              onClick={() => setActiveTab('mostPopular')}
              className={`font-mono text-[10px] tracking-widest uppercase font-bold cursor-pointer transition-colors duration-200 ${
                activeTab === 'mostPopular' ? 'text-black border-b border-black pb-2 -mb-2.5' : 'text-gray-400 hover:text-black'
              }`}
            >
              Most Popular
            </button>
          </div>
        </div>

        {/* Tab Content List */}
        <div className="space-y-4">
          {displayedArticles.map((article) => (
            <div
              id={`sidebar-item-${article.id}`}
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="flex items-start space-x-3 cursor-pointer group"
            >
              {/* Thumbnail Image */}
              <div className="w-16 h-16 shrink-0 bg-neutral-100 overflow-hidden shadow-sm">
                <img
                  src={article.images?.[0] || DEFAULT_FALLBACK_IMAGE}
                  alt={article.title}
                  onError={handleImageError}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Text Block */}
              <div className="space-y-0.5 min-w-0">
                <span className="text-[8px] font-mono tracking-wider font-semibold text-gray-400 uppercase">
                  {article.sidebarBadge || article.badge}
                </span>
                <h5 className="font-serif text-sm text-black leading-snug font-medium group-hover:text-neutral-700 transition-colors duration-200 line-clamp-2">
                  {article.title}
                </h5>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. TC Top 25: The Next Generation */}
      <div className="border-t border-gray-100 pt-8 space-y-4">
        <div className="text-center">
          <h4 className="font-serif text-lg italic text-black font-semibold">
            TC Top 25: The Next Generation
          </h4>
          <p className="text-[11px] text-gray-500 font-light mt-0.5">
            Small brands making big waves in beauty.
          </p>
        </div>

        {/* List of brands with interactive details on toggle */}
        <div className="space-y-2.5">
          {TOP_25_BRANDS.map((brand, idx) => {
            const isSelected = selectedBrandIndex === idx;

            return (
              <div
                id={`brand-item-${brand.rank}`}
                key={brand.rank}
                onClick={() => setSelectedBrandIndex(isSelected ? null : idx)}
                className={`border p-3 cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? 'border-black bg-neutral-50 shadow-sm' 
                    : 'border-gray-100 hover:border-gray-300 hover:bg-neutral-50/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-xs font-bold text-gray-400 w-4">
                      {brand.rank}
                    </span>
                    <span className="font-serif text-sm font-semibold text-black">
                      {brand.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">
                    {brand.category}
                  </span>
                </div>

                {/* Expanded Brand View */}
                {isSelected && (
                  <div className="mt-2.5 pt-2 border-t border-gray-100 text-xs text-gray-600 space-y-1.5 animate-in fade-in duration-200">
                    <p className="italic font-light text-gray-500">
                      “{brand.tagline}”
                    </p>
                    <div className="flex justify-between text-[10px] font-mono text-gray-400 pt-1">
                      <span>Hero: <strong className="text-black font-semibold">{brand.heroProduct}</strong></span>
                      <span>Est. {brand.founded}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* View Full List Action */}
        <div className="text-center pt-2">
          <button
            id="view-brands-full-btn"
            onClick={() => setSelectedBrandIndex(selectedBrandIndex === null ? 0 : null)}
            className="text-[9px] tracking-widest font-mono font-bold text-black uppercase hover:underline cursor-pointer"
          >
            {selectedBrandIndex !== null ? 'Close Brand List' : 'See the Full List'}
          </button>
        </div>
      </div>

    </aside>
  );
}
