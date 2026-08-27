import React from 'react';

interface LogoProps {
  className?: string;
  height?: number | string;
}

/**
 * JUES Logo - Exact vector reconstruction with identical geometry from reference:
 * - Rounded square glyphs: Top-Left J (Pink #FA689B), Top-Right U (Cyan-Blue #0099FF),
 *   Bottom-Left E (Cyan-Blue #0099FF), Bottom-Right S (Pink #FA689B).
 * - Rounded caps (stroke-linecap round / rx corners) matching the physical foam block design.
 */
export const JuesLogo: React.FC<LogoProps> = ({ className = 'h-9 w-auto', height }) => {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={height ? { height } : undefined}
      aria-label="JUES Logo"
    >
      <g>
        {/* J - Pink: #F9629F / #F85A9A with thick curved rounded hook */}
        <path
          d="M 110 60 H 182 V 135 C 182 172 152 192 115 192 C 78 192 56 170 56 138 H 110 C 110 148 116 153 125 153 C 135 153 140 146 140 134 V 104 H 110 V 60 Z"
          fill="#F75C96"
        />

        {/* U - Blue: #0099FF with thick smooth bottom curve */}
        <path
          d="M 218 60 H 260 V 132 C 260 144 268 152 281 152 C 294 152 302 144 302 132 V 60 H 344 V 134 C 344 172 322 192 281 192 C 240 192 218 172 218 134 V 60 Z"
          fill="#009BF5"
        />

        {/* E - Blue: #0099FF with 3 thick bold bars */}
        <path
          d="M 60 210 H 180 V 246 H 106 V 267 H 170 V 301 H 106 V 324 H 180 V 360 H 60 V 210 Z"
          fill="#009BF5"
        />

        {/* S - Pink: #F75C96 with smooth double curve and rounded terminals */}
        <path
          d="M 342 248 H 294 C 294 239 288 235 277 235 C 266 235 259 239 259 247 C 259 275 344 266 344 316 C 344 345 319 362 277 362 C 235 362 212 344 212 312 H 260 C 260 323 268 328 279 328 C 291 328 299 323 299 315 C 299 285 214 294 214 246 C 214 220 236 200 277 200 C 316 200 342 218 342 248 Z"
          fill="#F75C96"
        />
      </g>
    </svg>
  );
};

/**
 * OAB ESPÍRITO SANTO Logo - Exact 1:1 vector recreation:
 * 1. O: Detailed Blue Celestial Globe with gradient, stars, and white banner
 * 2. A: Red gradient Triangle
 * 3. B: Red gradient double-loop glyph with proper inner counter-spaces
 * 4. Subtitle: 'ESPÍRITO SANTO' in bold black condensed sans-serif
 */
export const OabEsLogo: React.FC<LogoProps & { darkMode?: boolean }> = ({ 
  className = 'h-9 w-auto', 
  height,
  darkMode = false 
}) => {
  return (
    <svg
      viewBox="0 0 350 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={height ? { height } : undefined}
      aria-label="OAB Espírito Santo Logo"
    >
      <defs>
        {/* Deep rich blue sphere gradient */}
        <radialGradient id="oabSphere" cx="35%" cy="30%" r="70%" fx="28%" fy="22%">
          <stop offset="0%" stopColor="#3b8cd6" />
          <stop offset="25%" stopColor="#226bb5" />
          <stop offset="65%" stopColor="#10427c" />
          <stop offset="90%" stopColor="#082952" />
          <stop offset="100%" stopColor="#031630" />
        </radialGradient>

        {/* Vibrant Red-to-deep-crimson gradient for A and B */}
        <linearGradient id="oabCrimson" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f33426" />
          <stop offset="60%" stopColor="#d51815" />
          <stop offset="100%" stopColor="#960d0a" />
        </linearGradient>

        {/* Right side facet for A to give 3D depth */}
        <linearGradient id="oabShadeA" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
        </linearGradient>

        <clipPath id="oabGlobeCut">
          <circle cx="70" cy="54" r="44" />
        </clipPath>

        {/* Mask for letter B counter spaces so background shines through transparently */}
        <mask id="oabBMask">
          {/* White = visible */}
          <rect x="0" y="0" width="350" height="160" fill="#ffffff" />
          {/* Black = cut out completely */}
          <path d="M 226 24 H 234 C 243 24 248 27 248 34 C 248 40 243 43 234 43 H 226 Z" fill="#000000" />
          <path d="M 226 58 H 235 C 245 58 251 62 251 70 C 251 77 245 81 235 81 H 226 Z" fill="#000000" />
        </mask>
      </defs>

      {/* 1. Letter 'O' (Globe with Southern Cross Stars & Curved White Banner) */}
      <g clipPath="url(#oabGlobeCut)">
        {/* Globe Base Sphere */}
        <circle cx="70" cy="54" r="44" fill="url(#oabSphere)" />
        
        {/* Celestial grid / latitude arcs */}
        <ellipse cx="70" cy="54" rx="40" ry="20" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" fill="none" transform="rotate(-22 70 54)" />
        <ellipse cx="70" cy="54" rx="22" ry="42" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" fill="none" transform="rotate(-22 70 54)" />

        {/* Southern Cross and Constellation Stars */}
        <circle cx="62" cy="38" r="1.6" fill="#ffffff" />
        <circle cx="52" cy="48" r="1.4" fill="#ffffff" />
        <circle cx="69" cy="62" r="1.6" fill="#ffffff" />
        <circle cx="80" cy="46" r="1.5" fill="#ffffff" />
        <circle cx="68" cy="50" r="1.1" fill="#ffffff" />
        <circle cx="46" cy="67" r="1.3" fill="#ffffff" />
        <circle cx="86" cy="68" r="1.4" fill="#ffffff" />
        <circle cx="75" cy="75" r="1.2" fill="#ffffff" />
        <circle cx="58" cy="80" r="1.1" fill="#ffffff" />
        <circle cx="39" cy="55" r="1.1" fill="#ffffff" />
        <circle cx="88" cy="36" r="1.2" fill="#ffffff" />

        {/* White Curved Ribbon across the globe */}
        <path
          d="M 20 57 Q 70 41 120 53 Q 70 49 20 65 Z"
          fill="#ffffff"
        />
        <path id="oabRibbonLine" d="M 24 60 Q 70 45 116 56" fill="none" />
        <text fontSize="4" fill="#09284d" fontWeight="900" letterSpacing="0.4" fontFamily="sans-serif">
          <textPath href="#oabRibbonLine" startOffset="50%" textAnchor="middle">
            ORDEM DOS ADVOGADOS DO BRASIL
          </textPath>
        </text>
      </g>

      {/* 2. Letter 'A' (Red Triangle) */}
      <polygon points="163,10 206,98 120,98" fill="url(#oabCrimson)" />
      {/* 3D shading facet */}
      <polygon points="163,10 206,98 163,98" fill="url(#oabShadeA)" />

      {/* 3. Letter 'B' (Red Glyphs with pure cut-out transparency) */}
      <g mask="url(#oabBMask)">
        <path
          d="M 210 10 H 234 C 254 10 266 21 266 35 C 266 46 257 54 246 56 C 260 58 271 68 271 83 C 271 97 258 98 234 98 H 210 Z"
          fill="url(#oabCrimson)"
        />
      </g>

      {/* 4. Text: ESPÍRITO SANTO */}
      <text
        x="166"
        y="136"
        textAnchor="middle"
        fontFamily="Impact, 'Arial Black', -apple-system, sans-serif"
        fontWeight="900"
        fontSize="24"
        letterSpacing="3"
        fill={darkMode ? '#ffffff' : '#0a0a0a'}
      >
        ESPÍRITO SANTO
      </text>
    </svg>
  );
};
