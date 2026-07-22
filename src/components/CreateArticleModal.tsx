import React, { useState } from 'react';
import { X, Sparkles, Plus, Image as ImageIcon, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Article } from '../types';
import { getSupabase } from '../lib/supabase';

interface CreateArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArticleCreated: (article: Article) => void;
}

export default function CreateArticleModal({
  isOpen,
  onClose,
  onArticleCreated,
}: CreateArticleModalProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<'Interviews' | 'Makeup' | 'Skincare' | 'Hair'>('Interviews');
  const [badge, setBadge] = useState<'THE TOP SHELF' | 'THE FACE' | 'POSTCARD' | 'THE EXTRAS' | 'OPEN THREAD' | 'THE REVIEW' | 'GUIDE'>('THE TOP SHELF');
  const [author, setAuthor] = useState('');
  const [authorTitle, setAuthorTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');

  // Up to 3 images
  const [image1, setImage1] = useState('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80');
  const [image2, setImage2] = useState('https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80');
  const [image3, setImage3] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !author.trim()) {
      setErrorMsg('Please fill in required fields (Title, Author, Excerpt).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const imagesList = [image1, image2, image3].filter((img) => img.trim() !== '');
    if (imagesList.length === 0) {
      imagesList.push('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80');
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `post-${Date.now()}`;

    const newArticle: Article = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `art-${Date.now()}`,
      title,
      subtitle: subtitle || undefined,
      slug,
      category,
      badge,
      author,
      authorTitle: authorTitle || undefined,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      readTime: `${Math.max(2, Math.ceil(content.length / 500))} min read`,
      excerpt,
      images: imagesList,
      blocks: content.trim() ? [
        {
          type: 'paragraph',
          text: content.trim(),
        }
      ] : [
        {
          type: 'paragraph',
          text: excerpt,
        }
      ],
      isLatest: true,
    };

    const supabase = getSupabase();

    if (supabase) {
      try {
        const { error } = await supabase.from('articles').insert([
          {
            title: newArticle.title,
            subtitle: newArticle.subtitle,
            slug: newArticle.slug,
            category: newArticle.category,
            badge: newArticle.badge,
            author: newArticle.author,
            author_title: newArticle.authorTitle,
            date: newArticle.date,
            read_time: newArticle.readTime,
            excerpt: newArticle.excerpt,
            image_1: imagesList[0] || '',
            image_2: imagesList[1] || null,
            image_3: imagesList[2] || null,
            images: imagesList,
            blocks: newArticle.blocks,
            is_latest: true,
          }
        ]);

        if (error) {
          console.error('Supabase insert error:', error);
          setErrorMsg(`Supabase Notice: ${error.message}. Local update applied.`);
        } else {
          setSuccessMsg('Published to Supabase in Realtime! ✨');
        }
      } catch (err: any) {
        console.error('Supabase insert exception:', err);
      }
    }

    // Always update local UI immediately
    onArticleCreated(newArticle);
    setIsSubmitting(false);

    setTimeout(() => {
      onClose();
      // Reset form
      setTitle('');
      setSubtitle('');
      setAuthor('');
      setAuthorTitle('');
      setExcerpt('');
      setContent('');
      setSuccessMsg('');
      setErrorMsg('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white border border-neutral-200 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-black p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-1">
          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-neutral-900">
            Publish New Blog Post
          </h2>
        </div>
        <p className="text-xs text-neutral-500 mb-6 font-mono">
          SUPABASE REAL-TIME BLOG PUBLISHER ✦ UP TO 3 IMAGES
        </p>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-lg border border-emerald-200 flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono tracking-wider uppercase font-semibold text-neutral-700 mb-1">
                Post Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Glossier You Or Bust"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3.5 py-2 text-xs focus:ring-1 focus:ring-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono tracking-wider uppercase font-semibold text-neutral-700 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Inside the beauty routine of..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3.5 py-2 text-xs focus:ring-1 focus:ring-black focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono tracking-wider uppercase font-semibold text-neutral-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3.5 py-2 text-xs focus:ring-1 focus:ring-black focus:outline-none"
              >
                <option value="Interviews">Interviews</option>
                <option value="Makeup">Makeup</option>
                <option value="Skincare">Skincare</option>
                <option value="Hair">Hair</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono tracking-wider uppercase font-semibold text-neutral-700 mb-1">
                Badge Tag
              </label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value as any)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3.5 py-2 text-xs focus:ring-1 focus:ring-black focus:outline-none"
              >
                <option value="THE TOP SHELF">THE TOP SHELF</option>
                <option value="THE FACE">THE FACE</option>
                <option value="POSTCARD">POSTCARD</option>
                <option value="THE EXTRAS">THE EXTRAS</option>
                <option value="OPEN THREAD">OPEN THREAD</option>
                <option value="THE REVIEW">THE REVIEW</option>
                <option value="GUIDE">GUIDE</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono tracking-wider uppercase font-semibold text-neutral-700 mb-1">
                Author Name *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Emily Ferber"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3.5 py-2 text-xs focus:ring-1 focus:ring-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono tracking-wider uppercase font-semibold text-neutral-700 mb-1">
                Author Title / Role
              </label>
              <input
                type="text"
                value={authorTitle}
                onChange={(e) => setAuthorTitle(e.target.value)}
                placeholder="e.g. Senior Beauty Editor"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3.5 py-2 text-xs focus:ring-1 focus:ring-black focus:outline-none"
              />
            </div>
          </div>

          {/* Up to 3 Image URLs */}
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-2.5">
            <div className="flex items-center space-x-2 text-[11px] font-mono uppercase tracking-wider font-semibold text-neutral-800">
              <ImageIcon className="w-4 h-4 text-rose-500" />
              <span>Article Image Uploads (Up to 3 Photos)</span>
            </div>

            <div>
              <label className="block text-[10px] text-neutral-500 mb-0.5 font-mono">Image 1 (Main Cover / Hero) *</label>
              <input
                type="url"
                required
                value={image1}
                onChange={(e) => setImage1(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-neutral-500 mb-0.5 font-mono">Image 2 (Detail Photo)</label>
              <input
                type="url"
                value={image2}
                onChange={(e) => setImage2(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-neutral-500 mb-0.5 font-mono">Image 3 (Secondary Detail)</label>
              <input
                type="url"
                value={image3}
                onChange={(e) => setImage3(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-black focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono tracking-wider uppercase font-semibold text-neutral-700 mb-1">
              Short Excerpt *
            </label>
            <textarea
              required
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief 1-2 sentence preview summary of the post..."
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-xs focus:ring-1 focus:ring-black focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono tracking-wider uppercase font-semibold text-neutral-700 mb-1">
              Full Article Story Body
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the article narrative here..."
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-xs focus:ring-1 focus:ring-black focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-600 hover:text-black font-mono text-xs uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-black hover:bg-neutral-800 text-white font-mono text-xs tracking-wider uppercase px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Article'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
