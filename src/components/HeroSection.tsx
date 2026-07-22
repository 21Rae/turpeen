import { Article } from '../types';
import { handleImageError, DEFAULT_FALLBACK_IMAGE } from '../utils/imageParser';

interface HeroSectionProps {
  heroArticle: Article;
  secondaryHeroArticle?: Article;
  onSelectArticle: (article: Article) => void;
}

export default function HeroSection({
  heroArticle,
  secondaryHeroArticle,
  onSelectArticle,
}: HeroSectionProps) {
  const heroImg = heroArticle?.images?.[0] || DEFAULT_FALLBACK_IMAGE;
  const secondaryHeroImg = secondaryHeroArticle?.images?.[0] || DEFAULT_FALLBACK_IMAGE;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Primary Hero */}
        <div 
          id="hero-primary-container"
          onClick={() => onSelectArticle(heroArticle)}
          className={`${secondaryHeroArticle ? 'lg:col-span-8' : 'lg:col-span-12'} group cursor-pointer relative`}
        >
          {/* Main Hero Image */}
          <div className="overflow-hidden aspect-video relative shadow-sm bg-neutral-100">
            <img
              id="hero-primary-img"
              src={heroImg}
              alt={heroArticle.title}
              onError={handleImageError}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            {/* Soft shadow overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 pointer-events-none" />
          </div>

          {/* White Card (Relative on mobile so image is not covered, Absolute on desktop) */}
          <div 
            id="hero-primary-card"
            className="relative sm:absolute sm:bottom-0 sm:left-0 bg-white p-5 sm:p-8 w-full sm:w-auto sm:max-w-[480px] border border-gray-100 sm:border-t sm:border-r sm:border-b-0 sm:border-l-0 shadow-sm sm:shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg mt-3 sm:mt-0"
          >
            {/* Category/Badge Badge */}
            <div className="inline-block bg-black text-white text-[9px] font-mono tracking-widest px-2.5 py-1 uppercase mb-3 sm:mb-4">
              {heroArticle.badge}
            </div>
            {/* Title */}
            <h2 className="font-serif text-2xl sm:text-3.5xl text-black leading-tight tracking-tight hover:text-neutral-700 transition-colors duration-200">
              {heroArticle.title}
            </h2>
            {/* Teaser excerpt */}
            <p className="mt-2 text-xs sm:text-sm font-light text-gray-500 leading-relaxed line-clamp-2">
              {heroArticle.excerpt}
            </p>
            {/* Subtle Action Line */}
            <div className="mt-4 flex items-center space-x-1.5 text-[10px] tracking-widest font-mono font-medium text-black uppercase group-hover:underline">
              <span>Read Article</span>
              <span>→</span>
            </div>
          </div>
        </div>

        {/* Right Column: Secondary Hero (If available) */}
        {secondaryHeroArticle && (
          <div 
            id="hero-secondary-container"
            onClick={() => onSelectArticle(secondaryHeroArticle)}
            className="lg:col-span-4 group cursor-pointer flex flex-col justify-between h-full space-y-4 pt-4 lg:pt-0"
          >
            {/* Image */}
            <div className="overflow-hidden aspect-[4/3] w-full shadow-sm bg-neutral-100 relative">
              <img
                id="hero-secondary-img"
                src={secondaryHeroImg}
                alt={secondaryHeroArticle.title}
                onError={handleImageError}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute top-3 left-3 bg-white border border-gray-100 px-2 py-0.5 text-[9px] tracking-widest font-mono font-medium text-black uppercase">
                {secondaryHeroArticle.badge}
              </div>
            </div>

            {/* Details below image */}
            <div className="space-y-2">
              <h3 className="font-serif text-xl sm:text-2xl text-black leading-snug group-hover:text-neutral-700 transition-colors duration-200">
                {secondaryHeroArticle.title}
              </h3>
              {secondaryHeroArticle.subtitle && (
                <p className="text-xs sm:text-sm font-serif italic text-gray-500">
                  {secondaryHeroArticle.subtitle}
                </p>
              )}
              <p className="text-xs font-light text-gray-500 leading-relaxed line-clamp-3">
                {secondaryHeroArticle.excerpt}
              </p>
              <div className="pt-2 flex items-center space-x-1 text-[10px] tracking-widest font-mono font-semibold text-black uppercase">
                <span>Read More</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">&gt;</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
