import React from 'react';

interface NexUpLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showTagline?: boolean;
  showText?: boolean;
  tagline?: string;
  layout?: 'col' | 'row' | 'auto';
  className?: string;
  glow?: boolean;
  textClassName?: string;
}

export const NexUpLogo: React.FC<NexUpLogoProps> = ({
  size = 'md',
  showTagline = false,
  showText = true,
  tagline = 'Opportunity Intelligence Network',
  layout = 'auto',
  className = '',
  glow = false,
  textClassName = '',
}) => {
  const isRow =
    layout === 'row' ||
    (layout === 'auto' && (size === 'xs' || size === 'sm' || className.includes('flex-row')));

  const dimensions = {
    xs: {
      width: 28,
      height: 28,
    },
    sm: {
      width: 44,
      height: 44,
    },
    md: {
      width: 170,
      height: 170,
    },
    lg: {
      width: 220,
      height: 220,
    },
    xl: {
      width: 280,
      height: 280,
    },
    hero: {
      width: 360,
      height: 360,
    },
  }[size];

  return (
    <div
      className={`
        relative
        inline-flex
        ${isRow ? 'flex-row items-center space-x-2.5' : 'flex-col items-center justify-center'}
        select-none
        ${className}
      `}
    >
      {/* =====================================
          LOGO GRAPHIC CONTAINER
      ====================================== */}
      <div className="relative inline-flex items-center justify-center shrink-0">
        {/* SOFT BLUE AMBIENT GLOW */}
        {glow && (
          <div
            className="
              absolute
              left-1/2
              top-1/2
              -translate-x-1/2
              -translate-y-1/2
              w-[75%]
              h-[75%]
              rounded-full
              bg-blue-600/20
              blur-[70px]
              pointer-events-none
            "
          />
        )}

        {/* EXACT LOGO IMAGE */}
        <img
          src="/logo.png"
          alt="NexUP"
          width={dimensions.width}
          height={dimensions.height}
          draggable={false}
          className={`
            relative
            z-10
            object-contain
            mix-blend-lighten
            drop-shadow-[0_0_25px_rgba(0,100,255,0.22)]
            antialiased
            ${isRow && (size === 'xs' || size === 'sm') ? 'scale-125' : ''}
          `}
        />
      </div>

      {/* =====================================
          BRAND NAME: NexUP
      ====================================== */}
      {showText && (
        <div
          className={`
            relative
            z-20
            flex
            flex-col
            ${isRow ? 'items-start' : 'items-center'}
            select-none
            ${!isRow && size === 'hero' ? '-mt-12 sm:-mt-14 mb-1' : ''}
            ${!isRow && size === 'xl' ? '-mt-10 mb-1' : ''}
            ${!isRow && size === 'lg' ? '-mt-8 mb-1' : ''}
            ${!isRow && size === 'md' ? '-mt-6 mb-0.5' : ''}
          `}
        >
          <div
            className={`
              font-sans font-extrabold tracking-tight flex items-center leading-none
              ${size === 'hero' ? 'text-4xl sm:text-5xl lg:text-6xl drop-shadow-[0_4px_24px_rgba(56,189,248,0.35)]' : ''}
              ${size === 'xl' ? 'text-3xl sm:text-4xl drop-shadow-[0_2px_16px_rgba(56,189,248,0.28)]' : ''}
              ${size === 'lg' ? 'text-2xl sm:text-3xl drop-shadow-[0_2px_14px_rgba(56,189,248,0.25)]' : ''}
              ${size === 'md' ? 'text-xl sm:text-2xl' : ''}
              ${size === 'sm' ? 'text-xl' : ''}
              ${size === 'xs' ? 'text-sm' : ''}
              ${textClassName}
            `}
          >
            <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">Nex</span>
            <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_2px_18px_rgba(56,189,248,0.45)] ml-0.5">
              UP
            </span>
          </div>

          {showTagline && (
            <span
              className={`
                text-slate-400 font-medium tracking-wider uppercase font-mono mt-1.5
                ${size === 'hero' ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'}
              `}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
};