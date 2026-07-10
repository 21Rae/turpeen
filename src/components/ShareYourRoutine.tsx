import React, { useState } from 'react';
import { X, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { UserRoutine } from '../types';

interface ShareYourRoutineProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRoutine: (routine: UserRoutine) => void;
}

export default function ShareYourRoutine({
  isOpen,
  onClose,
  onAddRoutine,
}: ShareYourRoutineProps) {
  const [name, setName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');
  const [routineText, setRoutineText] = useState('');
  const [favoriteProduct, setFavoriteProduct] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !occupation || !location || !title || !routineText || !favoriteProduct) return;

    const newRoutine: UserRoutine = {
      id: Date.now().toString(),
      name: name.trim(),
      occupation: occupation.trim(),
      location: location.trim(),
      title: title.trim(),
      routine: routineText.trim(),
      favoriteProduct: favoriteProduct.trim(),
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    onAddRoutine(newRoutine);
    setSubmitted(true);
    
    // Clear fields
    setName('');
    setOccupation('');
    setLocation('');
    setTitle('');
    setRoutineText('');
    setFavoriteProduct('');

    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay backdrop */}
      <div 
        id="share-overlay"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Modal Card */}
      <div className="bg-white border border-gray-100 max-w-lg w-full p-6 sm:p-8 relative shadow-2xl z-10 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          id="share-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black p-1 transition-colors duration-150 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <CheckCircle2 className="w-16 h-16 text-rose-500 mx-auto animate-bounce" />
            <h4 className="font-serif text-2xl font-bold text-black">
              Your Shelf is Live!
            </h4>
            <p className="text-xs sm:text-sm text-gray-500 leading-normal max-w-xs mx-auto font-light">
              Thank you for sharing your beauty secrets! Your custom routine has been instantly published at the top of "The Latest" feed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center space-y-1">
              <div className="flex justify-center items-center space-x-1 text-rose-500">
                <Sparkles className="w-4 h-4 fill-rose-500" />
                <span className="font-mono text-[9px] tracking-widest uppercase font-bold">Write Your Feature</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-black">
                Submit Your Top Shelf
              </h3>
              <p className="text-[11px] text-gray-400 font-light leading-normal max-w-xs mx-auto">
                Join the ranks of editors, founders, and beauty enthusiasts by laying out your daily routine.
              </p>
            </div>

            {/* Inputs Grid */}
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono tracking-wider text-gray-400 uppercase font-semibold">Your Name</label>
                  <input
                    id="share-input-name"
                    type="text"
                    required
                    placeholder="e.g. Olivia Jade"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-neutral-50/50 border border-gray-200 px-3 py-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black rounded"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono tracking-wider text-gray-400 uppercase font-semibold">Occupation / Title</label>
                  <input
                    id="share-input-occupation"
                    type="text"
                    required
                    placeholder="e.g. Creative Director"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full bg-neutral-50/50 border border-gray-200 px-3 py-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono tracking-wider text-gray-400 uppercase font-semibold">City / Location</label>
                  <input
                    id="share-input-location"
                    type="text"
                    required
                    placeholder="e.g. Paris"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-neutral-50/50 border border-gray-200 px-3 py-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black rounded"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono tracking-wider text-gray-400 uppercase font-semibold">The Absolute Favorite Product</label>
                  <input
                    id="share-input-fav"
                    type="text"
                    required
                    placeholder="e.g. Turpeen Cosmetics Boy Brow"
                    value={favoriteProduct}
                    onChange={(e) => setFavoriteProduct(e.target.value)}
                    className="w-full bg-neutral-50/50 border border-gray-200 px-3 py-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black rounded"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono tracking-wider text-gray-400 uppercase font-semibold">Editorial Heading Title</label>
                <input
                  id="share-input-title"
                  type="text"
                  required
                  placeholder="e.g. Olivia Jade Giannulli, Founder, O.Piccola"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-50/50 border border-gray-200 px-3 py-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black rounded"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono tracking-wider text-gray-400 uppercase font-semibold">Describe Your Routine</label>
                <textarea
                  id="share-input-routine"
                  required
                  rows={4}
                  placeholder="Lay it all out. What's your morning splash? Your dynamic serums? How do you keep your face hydrated? Tell us in your own voice..."
                  value={routineText}
                  onChange={(e) => setRoutineText(e.target.value)}
                  className="w-full bg-neutral-50/50 border border-gray-200 px-3 py-2.5 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black rounded resize-none"
                />
              </div>
            </div>

            <button
              id="share-submit-btn"
              type="submit"
              className="w-full bg-black hover:bg-neutral-800 text-white font-mono text-[10px] tracking-widest uppercase py-4 transition-transform duration-150 active:scale-98 cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish To Turpeencosmetic</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
