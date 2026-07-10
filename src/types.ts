export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  rating: number;
  description: string;
  image: string;
  category: 'makeup' | 'skincare' | 'body' | 'fragrance';
}

export interface ArticleContentBlock {
  type: 'paragraph' | 'heading' | 'quote' | 'product-highlight' | 'image';
  text?: string;
  authorQuote?: string;
  productName?: string;
  productBrand?: string;
  productDesc?: string;
  imageUrl?: string;
  caption?: string;
}

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  category: 'Interviews' | 'Makeup' | 'Skincare' | 'Hair';
  badge: 'THE TOP SHELF' | 'THE FACE' | 'POSTCARD' | 'THE EXTRAS' | 'OPEN THREAD' | 'THE REVIEW' | 'GUIDE';
  author: string;
  authorTitle?: string; // e.g. "Founder, O.Piccola" or "Dermatologist"
  date: string;
  readTime: string;
  excerpt: string;
  images: string[]; // Hero image, detail images
  blocks: ArticleContentBlock[];
  isHero?: boolean;
  isSecondaryHero?: boolean;
  isLatest?: boolean;
  isSidebar?: boolean;
  sidebarBadge?: string;
}

export interface UserRoutine {
  id: string;
  name: string;
  occupation: string;
  location: string;
  title: string;
  routine: string;
  favoriteProduct: string;
  createdAt: string;
}
