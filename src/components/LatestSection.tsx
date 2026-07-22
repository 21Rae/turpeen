import { Article, UserRoutine } from '../types';
import { Sparkles, Calendar, User } from 'lucide-react';
import { handleImageError, DEFAULT_FALLBACK_IMAGE } from '../utils/imageParser';

interface LatestSectionProps {
  latestArticles: Article[];
  userRoutines: UserRoutine[];
  onSelectArticle: (article: Article) => void;
  onSelectRoutine: (routine: UserRoutine) => void;
}

export default function LatestSection({
  latestArticles,
  userRoutines,
  onSelectArticle,
  onSelectRoutine,
}: LatestSectionProps) {
  return (
    <section className="space-y-12">
      {/* "The Latest" Editorial Header */}
      <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
        <h3 className="font-serif text-2xl italic text-black font-light">
          The Latest
        </h3>
        <span className="text-[10px] tracking-widest font-mono text-gray-400 uppercase">
          Daily Beauty Updates
        </span>
      </div>

      {/* List of Latest Articles / User Routines */}
      <div className="space-y-16">
        
        {/* Render User Routines First if they exist (dynamically added) */}
        {userRoutines.map((routine) => (
          <div 
            id={`user-routine-${routine.id}`}
            key={routine.id}
            onClick={() => onSelectRoutine(routine)}
            className="group cursor-pointer flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-8 animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            {/* TC Monogram on the left */}
            <div className="hidden md:flex flex-col items-center justify-start pt-1">
              <div className="w-12 h-12 bg-rose-50 border border-rose-100 flex items-center justify-center shadow-sm hover:scale-105 transition-transform duration-200">
                <span className="font-serif font-semibold italic text-rose-600 text-sm">TC</span>
              </div>
              <div className="h-20 w-[1px] bg-gradient-to-b from-rose-100 to-transparent mt-2" />
            </div>

            {/* Content block */}
            <div className="flex-1 w-full bg-rose-50/30 border border-rose-100/50 p-6 sm:p-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="bg-rose-100 text-rose-800 text-[9px] font-mono tracking-widest px-2 py-0.5 uppercase font-medium rounded-full flex items-center space-x-1">
                    <Sparkles className="w-2.5 h-2.5 text-rose-600" />
                    <span>READER TOP SHELF</span>
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{routine.createdAt}</span>
                </div>
              </div>

              <h4 className="font-serif text-2xl text-black leading-snug group-hover:text-rose-700 transition-colors duration-200">
                {routine.title}
              </h4>
              <p className="text-xs sm:text-sm font-serif italic text-gray-500 mt-1">
                By {routine.name}, {routine.occupation} • {routine.location}
              </p>
              
              <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3">
                {routine.routine}
              </p>

              <div className="mt-4 pt-3 border-t border-rose-100/60 flex items-center justify-between">
                <div className="text-[10px] font-mono text-gray-500">
                  Swears by: <span className="font-semibold text-black">{routine.favoriteProduct}</span>
                </div>
                <div className="flex items-center space-x-1 text-[10px] tracking-widest font-mono font-semibold text-rose-700 uppercase">
                  <span>Read Routine</span>
                  <span>&gt;</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Regular Articles from data */}
        {latestArticles.map((article) => {
          const isPostcard = article.badge === 'POSTCARD';

          return (
            <div
              id={`latest-article-${article.id}`}
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="group cursor-pointer flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-8"
            >
              {/* TC Monogram on the left */}
              <div className="hidden md:flex flex-col items-center justify-start pt-1">
                <div className="w-12 h-12 bg-black flex items-center justify-center shadow-md hover:bg-neutral-800 transition-colors duration-200">
                  <span className="font-serif font-light italic text-white text-base">TC</span>
                </div>
                <div className="h-44 w-[1px] bg-gray-100 mt-2" />
              </div>

              {/* Main article presentation */}
              <div className="flex-1 w-full space-y-4">
                
                {/* 1. Imagery */}
                {isPostcard ? (
                  /* Postcard Layout: 3 side-by-side images */
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {(article.images && article.images.length > 0 ? article.images : [DEFAULT_FALLBACK_IMAGE]).map((img, idx) => (
                      <div 
                        key={idx} 
                        className="overflow-hidden aspect-[4/5] bg-neutral-100 relative shadow-sm"
                      >
                        <img
                          src={img || DEFAULT_FALLBACK_IMAGE}
                          alt={`${article.title} gallery ${idx + 1}`}
                          onError={handleImageError}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Standard Landscape Layout (e.g. Daniela Garza) */
                  <div className="overflow-hidden aspect-video bg-neutral-100 relative shadow-sm">
                    <img
                      src={article.images?.[0] || DEFAULT_FALLBACK_IMAGE}
                      alt={article.title}
                      onError={handleImageError}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                )}

                {/* 2. Content */}
                <div className="space-y-2">
                  {/* Badge */}
                  <div className="inline-block border border-black/80 px-2 py-0.5 text-[9px] tracking-widest font-mono font-medium text-black uppercase">
                    {article.badge}
                  </div>

                  {/* Title */}
                  <h4 className="font-serif text-2xl sm:text-3xl text-black leading-tight group-hover:text-neutral-700 transition-colors duration-200">
                    {article.title}
                  </h4>

                  {/* Excerpt */}
                  <p className="text-xs sm:text-sm font-light text-gray-500 leading-relaxed max-w-3xl">
                    {article.excerpt}
                  </p>

                  {/* READ MORE line */}
                  <div className="pt-1 flex items-center space-x-1 text-[10px] tracking-widest font-mono font-semibold text-black uppercase">
                    <span>Read More</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">&gt;</span>
                  </div>
                </div>

              </div>
            </div>
          );
        })}

      </div>
    </section>
  );
}
