import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}

// 1. Fully responsive editorial Logo Lockup matching the uploaded brand asset precisely:
// "TURPEEN™" on top, "COSMETICS" on the second line.
export function TurpeenLogo({ size = 'md', className = '', color = 'text-black' }: LogoProps) {
  const styles = {
    xs: {
      container: 'space-y-0.5',
      main: 'text-[11px] sm:text-xs font-black tracking-normal leading-none',
      sub: 'text-[9px] sm:text-[10px] font-extrabold tracking-normal leading-none',
      tm: 'text-[4px] -right-1.5 -top-0.5',
    },
    sm: {
      container: 'space-y-0.5',
      main: 'text-base sm:text-lg font-black tracking-normal leading-none',
      sub: 'text-xs sm:text-sm font-extrabold tracking-normal leading-none',
      tm: 'text-[5px] -right-2 -top-0.5',
    },
    md: {
      container: 'space-y-0.5',
      main: 'text-base sm:text-2xl md:text-[28px] font-black tracking-normal leading-none',
      sub: 'text-xs sm:text-xl md:text-[22px] font-extrabold tracking-normal leading-none',
      tm: 'text-[4px] sm:text-[7px] -right-2 sm:-right-3 -top-0.5',
    },
    lg: {
      container: 'space-y-1',
      main: 'text-3.5xl sm:text-4xl font-black tracking-normal leading-none',
      sub: 'text-2.5xl sm:text-3xl font-extrabold tracking-normal leading-none',
      tm: 'text-[8px] -right-3.5 top-0.5',
    },
    xl: {
      container: 'space-y-1',
      main: 'text-4.5xl sm:text-5xl md:text-5.5xl font-black tracking-normal leading-none',
      sub: 'text-3.5xl sm:text-4xl md:text-4.5xl font-extrabold tracking-normal leading-none',
      tm: 'text-[10px] -right-4.5 top-0.5',
    },
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${color} ${className}`}>
      {/* TURPEEN line */}
      <div className={`font-display uppercase relative font-bold ${styles.main}`}>
        TURPEEN
        <span className={`absolute font-sans font-extrabold tracking-normal leading-none ${styles.tm}`}>
          TM
        </span>
      </div>
      
      {/* COSMETICS line */}
      <div className={`font-display uppercase font-bold ${styles.sub}`}>
        COSMETICS
      </div>
    </div>
  );
}

// 2. A beautiful mini interlocking "TC" monogram icon version for placement inside buttons
export function TurpeenIcon({ className = "w-4 h-4", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Elegant T bar on top */}
      <path d="M22 28 H78" stroke={color} strokeWidth="7" strokeLinecap="round" />
      <path d="M50 28 V76" stroke={color} strokeWidth="7" strokeLinecap="round" />
      {/* Super Elegant C curve sweeping behind the T stem */}
      <path d="M72 45 C72 34, 52 34, 40 45 C28 56, 28 72, 44 80 C60 88, 72 80, 72 70" stroke={color} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Premium diamond accent dot */}
      <path d="M80 20 L84 24 L80 28 L76 24 Z" fill="#F43F5E" />
    </svg>
  );
}

// 3. Backward compatible component just in case
export function TurpeenWordmark({ className = "" }: { className?: string }) {
  return <TurpeenLogo size="md" className={className} />;
}
