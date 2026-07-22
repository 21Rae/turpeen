import React, { useState, useEffect, useMemo } from 'react';
import { Heart, ArrowLeft, Send, MessageSquare, Share2, BookmarkCheck, Check } from 'lucide-react';
import { Article, Product, ArticleContentBlock } from '../types';
import { GLOSSIER_PRODUCTS } from '../data';
import { handleImageError, DEFAULT_FALLBACK_IMAGE, parseBlocksFromRow } from '../utils/imageParser';

interface ArticleViewProps {
  article: Article;
  allArticles?: Article[];
  onBack: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onAddProductToBag: (product: Product) => void;
  onSelectArticle: (article: Article) => void;
}

interface LocalComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export default function ArticleView({
  article,
  allArticles = [],
  onBack,
  isBookmarked,
  onToggleBookmark,
  onAddProductToBag,
  onSelectArticle,
}: ArticleViewProps) {
  const [comments, setComments] = useState<LocalComment[]>([]);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Gallery slider state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Newsletter states
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Reset slider index and state on article changes
  useEffect(() => {
    setActiveImageIndex(0);
    setSubscribed(false);
    setIsLiked(false);
    
    // Load comments specific to this article from localStorage or load a few mock ones
    const key = `comments-${article.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setComments(JSON.parse(stored));
    } else {
      // Seed some beautiful editorial-style comments
      const seed: LocalComment[] = [
        {
          id: 'c1',
          author: 'Laurence K.',
          text: `Absolutely loving this profile! The photography is spectacular. I sworn by ${
            article.badge === 'THE TOP SHELF' ? 'Milky Jelly Cleanser' : 'Cloud Paint'
          } for three years now and it never disappoints.`,
          timestamp: '2 hours ago',
        },
        {
          id: 'c2',
          author: 'Sophia Chen',
          text: 'The advice on simplified routines is so spot on. Since I cut down my actives to just Vitamin C and SPF, my skin has never looked calmer.',
          timestamp: '1 day ago',
        },
      ];
      setComments(seed);
      localStorage.setItem(key, JSON.stringify(seed));
    }
    // Scroll to top on load
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim()) return;

    const added: LocalComment = {
      id: Date.now().toString(),
      author: newCommentName.trim(),
      text: newCommentText.trim(),
      timestamp: 'Just now',
    };

    const updated = [added, ...comments];
    setComments(updated);
    localStorage.setItem(`comments-${article.id}`, JSON.stringify(updated));
    setNewCommentName('');
    setNewCommentText('');
  };

  const handleShare = () => {
    setCopiedLink(true);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail('');
  };

  // Ensure blocks are always parsed and safely available from any database format
  const blocksToRender: ArticleContentBlock[] = useMemo(() => {
    if (!article) return [];
    if (Array.isArray(article.blocks) && article.blocks.length > 0) {
      return article.blocks;
    }
    return parseBlocksFromRow(article);
  }, [article]);

  // Sidebar articles for "DON'T MISS"
  const sidebarPosts = allArticles.filter(a => a.id !== article.id).slice(0, 6);

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 animate-in fade-in duration-300">
      
      {/* 1. Article Navigation Header (Back / Share / Save) */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6 sm:mb-8">
        <button
          id="article-back-btn"
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-mono tracking-widest text-gray-500 hover:text-black uppercase transition-colors duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Feed</span>
        </button>

        <div className="flex items-center space-x-3">
          {/* Share Button */}
          <button
            id="article-share-btn"
            onClick={handleShare}
            className="p-2 rounded-full border border-gray-150 text-gray-500 hover:text-black hover:border-black transition-all duration-200 relative cursor-pointer"
            title="Copy share link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
            {copiedLink && (
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-mono px-2 py-0.5 rounded whitespace-nowrap shadow-md">
                Link Copied!
              </span>
            )}
          </button>

          {/* Bookmark Button */}
          <button
            id="article-bookmark-btn"
            onClick={onToggleBookmark}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              isBookmarked
                ? 'bg-rose-50 border-rose-200 text-rose-600 font-semibold'
                : 'bg-white border-gray-200 text-gray-600 hover:border-black hover:text-black'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-rose-500' : ''}`} />
            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        
        {/* Left Column: Breadcrumbs, Title, Gallery, Content, Comments */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Breadcrumb Trail */}
          <div className="text-[10px] sm:text-xs font-mono tracking-widest text-neutral-400 uppercase select-none">
            HOME // {article.badge || article.category} / {article.title}
          </div>

          {/* Giant Bold Title */}
          <h1 className="font-serif text-3xl sm:text-4.5xl md:text-5xl font-bold text-black leading-tight tracking-tight">
            {article.title}
          </h1>

          {/* Subtitle / Author details */}
          {article.subtitle && (
            <p className="font-serif italic text-base sm:text-lg text-gray-500 leading-relaxed max-w-2xl">
              {article.subtitle}
            </p>
          )}

          {/* Hero / Interactive Gallery Module */}
          <div className="w-full space-y-4">
            
            {/* Main Stage Image */}
            <div className="w-full relative bg-neutral-50 overflow-hidden shadow-sm group border border-gray-100">
              <img
                src={article.images?.[activeImageIndex] || article.images?.[0] || DEFAULT_FALLBACK_IMAGE}
                alt={`${article.title} gallery display`}
                onError={handleImageError}
                referrerPolicy="no-referrer"
                className="w-full object-cover aspect-[4/5] sm:max-h-[600px] transition-all duration-300"
              />
              
              {/* Left Badge: Active Slide Counter */}
              <div className="absolute bottom-4 left-4 bg-black text-white text-[11px] font-mono px-3 py-1 font-bold select-none">
                {activeImageIndex + 1}
              </div>

              {/* Right Badge: Magnifier Symbol */}
              <div className="absolute bottom-4 right-4 bg-black text-white p-2 hover:scale-105 transition-transform duration-150 select-none cursor-zoom-in">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Thumbnail Navigation Strip */}
            {article.images && article.images.length > 1 && (
              <div className="flex flex-wrap gap-2 pt-1.5">
                {article.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 overflow-hidden border-2 transition-all duration-200 bg-neutral-100 cursor-pointer ${
                      activeImageIndex === idx 
                        ? 'border-black opacity-100 shadow-sm scale-102' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img || DEFAULT_FALLBACK_IMAGE} 
                      alt={`Thumbnail gallery index ${idx + 1}`} 
                      onError={handleImageError}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Monogram Brand Indicator Bar */}
          <div className="flex items-center space-x-3 py-5 border-b border-gray-100">
            <div className="w-10 h-10 bg-black flex items-center justify-center text-white font-serif italic text-sm font-semibold select-none shadow-sm">
              TC
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-mono tracking-widest text-gray-400 uppercase leading-none mb-1">IN PARTNERSHIP WITH</span>
              <span className="text-xs font-mono font-bold text-black uppercase tracking-wider leading-none">
                TURPEEN COSMETICS
              </span>
            </div>
          </div>

          {/* Rich Content Blocks */}
          <div className="prose prose-neutral max-w-3xl font-serif text-base sm:text-lg text-neutral-800 leading-relaxed space-y-6 pt-2">
            {blocksToRender.map((block, idx) => {
              const textContent = block.text || (block as any).content || (block as any).body || '';
              const type = (block.type || 'paragraph').toLowerCase();

              if (type === 'paragraph' || type === 'p' || type === 'text') {
                return (
                  <p key={idx} className="font-light whitespace-pre-line leading-relaxed text-neutral-800">
                    {textContent}
                  </p>
                );
              }

              if (type === 'heading' || type === 'h1' || type === 'h2' || type === 'h3' || type === 'title') {
                return (
                  <h3 key={idx} className="font-serif text-xl sm:text-2xl font-bold text-black tracking-tight mt-8 mb-3 pt-4 border-t border-gray-100">
                    {textContent}
                  </h3>
                );
              }

              if (type === 'quote' || type === 'blockquote') {
                return (
                  <blockquote key={idx} className="border-l-2 border-black pl-5 py-2 my-6 italic text-lg sm:text-xl text-neutral-950 bg-neutral-50/50">
                    {textContent}
                    {block.authorQuote && (
                      <cite className="block text-xs font-mono tracking-widest uppercase font-semibold text-gray-400 mt-2 not-italic">
                        — {block.authorQuote}
                      </cite>
                    )}
                  </blockquote>
                );
              }

              if (type === 'image' || type === 'photo' || type === 'img') {
                const imgUrl = block.imageUrl || (block as any).url || (block as any).src || (block as any).image;
                return (
                  <figure key={idx} className="my-8 space-y-2">
                    <img
                      src={imgUrl || DEFAULT_FALLBACK_IMAGE}
                      alt={block.caption || 'Article image'}
                      onError={handleImageError}
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-cover border border-gray-100 shadow-sm"
                    />
                    {block.caption && (
                      <figcaption className="text-xs font-mono text-gray-500 text-center italic">
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              }

              if (type === 'product-highlight' || type === 'product' || type === 'shop') {
                const pImg = block.imageUrl || (block as any).image;
                return (
                  <div key={idx} className="my-8 p-5 border border-gray-200 bg-neutral-50 flex flex-col sm:flex-row items-center gap-5 shadow-sm">
                    {pImg && (
                      <img
                        src={pImg}
                        alt={block.productName || 'Featured Product'}
                        onError={handleImageError}
                        referrerPolicy="no-referrer"
                        className="w-24 h-24 object-cover border border-gray-200 bg-white flex-shrink-0"
                      />
                    )}
                    <div className="space-y-1.5 flex-1 text-left">
                      {block.productBrand && (
                        <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-rose-600 block">
                          {block.productBrand}
                        </span>
                      )}
                      <h4 className="font-serif text-lg font-bold text-black">
                        {block.productName || textContent}
                      </h4>
                      {block.productDesc && (
                        <p className="text-xs text-gray-600 font-sans leading-relaxed">
                          {block.productDesc}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }

              // Default fallback for any unspecified or raw block type
              if (textContent) {
                return (
                  <p key={idx} className="font-light whitespace-pre-line leading-relaxed text-neutral-800">
                    {textContent}
                  </p>
                );
              }

              return null;
            })}
          </div>

          {/* Feedback Row */}
          <div className="border-t border-b border-gray-100 py-5 my-8 flex justify-between items-center select-none">
            <div className="flex items-center space-x-4">
              <button
                id="article-like-btn"
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center space-x-2 text-xs font-mono uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
                  isLiked ? 'text-rose-600' : 'text-gray-500 hover:text-black'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
                <span>{isLiked ? 'Liked' : 'Like this post'}</span>
              </button>
              <span className="text-[11px] font-mono text-gray-400">
                {isLiked ? 'You and 42 others liked this' : '42 people liked this'}
              </span>
            </div>
            
            <button
              id="article-scroll-comments"
              onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center space-x-1.5 text-xs font-mono uppercase tracking-wider text-gray-500 hover:text-black cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Comments ({comments.length})</span>
            </button>
          </div>

          {/* Reader Discussion (Comments Feed) */}
          <div id="comments-section" className="space-y-6 pt-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
              <MessageSquare className="w-4 h-4 text-black" />
              <h3 className="font-serif text-lg font-bold text-black">
                Reader Discussion
              </h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="border border-gray-150 p-4 space-y-3 bg-neutral-50/40">
              <h4 className="font-mono text-[9px] tracking-widest uppercase font-bold text-gray-700">
                Join the Conversation
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  id="comment-name-input"
                  type="text"
                  placeholder="Your Name"
                  required
                  value={newCommentName}
                  onChange={(e) => setNewCommentName(e.target.value)}
                  className="bg-white border border-gray-200 px-3 py-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black rounded font-mono"
                />
              </div>
              <div className="relative">
                <textarea
                  id="comment-text-textarea"
                  placeholder="Share your thoughts, recommendations, or questions on this routine..."
                  required
                  rows={3}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full bg-white border border-gray-200 px-3 py-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black rounded resize-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  id="comment-submit-btn"
                  type="submit"
                  className="bg-black hover:bg-neutral-800 text-white font-mono text-[9px] tracking-widest uppercase px-4 py-2 transition-transform duration-150 active:scale-95 cursor-pointer flex items-center space-x-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>Post Comment</span>
                </button>
              </div>
            </form>

            {/* Comments Feed */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center py-6 text-xs text-gray-400 font-mono">
                  No comments yet. Be the first to share your thoughts!
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    id={`comment-item-${comment.id}`}
                    key={comment.id}
                    className="border-b border-gray-100 pb-4 last:border-none last:pb-0"
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-serif font-bold text-sm text-black">
                        {comment.author}
                      </span>
                      <span className="text-[9px] font-mono text-gray-400">
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Sidebar (Don't Miss + Newsletter Subscribe widget) */}
        <div className="lg:col-span-4 space-y-10 border-t lg:border-t-0 lg:border-l border-gray-100 pt-8 lg:pt-0 lg:pl-10">
          
          {/* DON'T MISS Widget */}
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-2 flex justify-between items-baseline select-none">
              <h3 className="font-serif text-sm font-bold text-black uppercase tracking-wider">
                DON'T MISS
              </h3>
              <span className="font-serif text-xs italic text-gray-400">Most Popular</span>
            </div>
            
            <div className="space-y-5">
              {sidebarPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => onSelectArticle(post)}
                  className="flex items-start space-x-3 group cursor-pointer"
                >
                  <div className="w-14 h-14 bg-neutral-100 overflow-hidden shrink-0 border border-gray-100">
                    <img 
                      src={post.images[0]} 
                      alt={post.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-mono tracking-widest text-neutral-400 uppercase font-semibold">
                      {post.sidebarBadge || post.badge}
                    </span>
                    <h4 className="font-serif text-[13px] font-bold text-black leading-tight line-clamp-2 group-hover:text-neutral-600 transition-colors duration-150">
                      {post.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Newsletter Subscribe Widget */}
          <div className="border-t border-gray-200 pt-8 space-y-4">
            <div className="space-y-3">
              <span className="font-serif text-base text-neutral-900 leading-relaxed block font-light">
                <span className="font-semibold text-black italic">✦ Want more TC?</span> Sign up for Turpeen Cosmetics stories, product info and launches, and event invites delivered right to your inbox. Unsubscribe anytime.
              </span>
              
              {subscribed ? (
                <div className="bg-neutral-50 border border-black/15 p-5 text-center animate-in fade-in duration-200">
                  <span className="text-xs font-mono font-bold text-black uppercase tracking-widest block">
                    THANK YOU FOR JOINING! 🖤
                  </span>
                  <p className="text-[10px] text-gray-500 font-mono mt-1 leading-relaxed">
                    You've successfully subscribed to our newsletter.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSignup} className="space-y-2 pt-2">
                  <input
                    type="email"
                    required
                    placeholder="YOUR EMAIL ADDRESS"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full bg-neutral-50/50 border border-gray-200 px-3.5 py-2.5 text-xs text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black rounded font-mono"
                  />
                  <button
                    type="submit"
                    className="w-full bg-black hover:bg-neutral-800 text-white font-mono text-[10px] tracking-widest uppercase py-3.5 transition-all duration-200 cursor-pointer text-center font-bold"
                  >
                    SIGN UP
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>

    </article>
  );
}
