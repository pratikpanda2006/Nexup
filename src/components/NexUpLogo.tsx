import React from 'react';

interface NexUpLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showTagline?: boolean;
  className?: string;
  glow?: boolean;
}

export const NexUpLogo: React.FC<NexUpLogoProps> = ({
  size = 'md',
  className = '',
  glow = false,
}) => {
  const dimensions = {
    sm: {
      width: 120,
      height: 120,
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
        items-center
        justify-center
        select-none
        ${className}
      `}
    >
      {/* =====================================
          SOFT BLUE AMBIENT GLOW
      ====================================== */}
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
            bg-blue-600/15
            blur-[70px]
            pointer-events-none
          "
        />
      )}

      {/* =====================================
          EXACT LOGO IMAGE

          Put logo.png in project root:

          /logo.png
      ====================================== */}
      <img
        src="/logo.png"
        alt="NexUP"
        width={dimensions.width}
        height={dimensions.height}
        draggable={false}
        className="
          relative
          z-10
          object-contain

          /*
           * Makes the dark background of the PNG
           * blend naturally with the dark page.
           */
          mix-blend-lighten

          /*
           * Very subtle glow so it doesn't look pasted.
           */
          drop-shadow-[0_0_25px_rgba(0,100,255,0.18)]

          /*
           * Smooth rendering.
           */
          antialiased
        "
      />
    </div>
  );
};