import { Sparkles, ArrowLeftRight } from 'lucide-react';
import '../styles/SkillSwapIllustration.css';

/**
 * SkillSwapIllustration
 * A cartoon illustration of two friendly learners exchanging
 * tech and design knowledge, designed to blend with the website's
 * light lavender/off-white background and soft purple/blue palette.
 */
function SkillSwapIllustration() {
  return (
    <div className="skillswap-illustration-wrapper" aria-label="SkillSwap concept illustration: two people exchanging programming and design knowledge">
      <svg
        className="skillswap-svg"
        viewBox="0 0 620 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Soft gradients matching the website palette */}
          <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>

          <linearGradient id="softPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          <linearGradient id="techHoodieGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>

          <linearGradient id="designSweaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>

          <linearGradient id="laptopScreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>

          <linearGradient id="tabletScreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fae8ff" />
            <stop offset="100%" stopColor="#e0e7ff" />
          </linearGradient>

          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          <linearGradient id="arcTopGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="arcBottomGrad" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#ec4899" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.3" />
          </linearGradient>

          <radialGradient id="groundGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.12" />
            <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="charGlowLeft" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="charGlowRight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Soft SVG Drop Shadows */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="cardShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#7c3aed" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* --- 1. Ambient Background Glows & Shadows --- */}
        <ellipse cx="310" cy="405" rx="260" ry="24" fill="url(#groundGlow)" />
        <ellipse cx="145" cy="400" rx="70" ry="12" fill="#6366f1" fillOpacity="0.08" />
        <ellipse cx="475" cy="400" rx="70" ry="12" fill="#a855f7" fillOpacity="0.08" />
        <circle cx="145" cy="250" r="110" fill="url(#charGlowLeft)" />
        <circle cx="475" cy="250" r="110" fill="url(#charGlowRight)" />

        {/* --- 2. Curved Exchange Flow Arcs --- */}
        {/* Top curved track (Left to Right: Code/Tech to Design) */}
        <path
          d="M 185 240 C 235 130, 385 130, 435 240"
          stroke="url(#arcTopGrad)"
          strokeWidth="3.5"
          strokeDasharray="8 8"
          strokeLinecap="round"
          className="animated-arc-top"
        />
        {/* Top Arc Flow Arrowheads */}
        <g className="flow-arrow-top">
          <path d="M 335 146 L 348 148 L 340 159" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>

        {/* Bottom curved track (Right to Left: Creative/Design to Code) */}
        <path
          d="M 435 270 C 385 375, 235 375, 185 270"
          stroke="url(#arcBottomGrad)"
          strokeWidth="3.5"
          strokeDasharray="8 8"
          strokeLinecap="round"
          className="animated-arc-bottom"
        />
        {/* Bottom Arc Flow Arrowheads */}
        <g className="flow-arrow-bottom">
          <path d="M 285 363 L 272 361 L 280 350" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>

        {/* --- 3. Left Character: Programmer / Tech Mentor (Alex) --- */}
        <g className="character-coder">
          {/* Shadow beneath feet */}
          <ellipse cx="145" cy="395" rx="42" ry="7" fill="#1e1b4b" fillOpacity="0.12" />

          {/* Legs & Shoes */}
          <path d="M 130 310 L 126 375" stroke="#334155" strokeWidth="16" strokeLinecap="round" />
          <path d="M 160 310 L 164 375" stroke="#334155" strokeWidth="16" strokeLinecap="round" />
          {/* Left Shoe */}
          <rect x="114" y="372" width="26" height="13" rx="6" fill="#ffffff" />
          <path d="M 114 381 L 140 381" stroke="#6366f1" strokeWidth="3" />
          {/* Right Shoe */}
          <rect x="154" y="372" width="26" height="13" rx="6" fill="#ffffff" />
          <path d="M 154 381 L 180 381" stroke="#6366f1" strokeWidth="3" />

          {/* Torso & Hoodie */}
          <path
            d="M 120 220 Q 145 214 170 220 L 176 312 Q 145 318 114 312 Z"
            fill="url(#techHoodieGrad)"
          />
          {/* Hoodie kangaroo pocket */}
          <path
            d="M 128 274 Q 145 270 162 274 L 166 298 Q 145 303 124 298 Z"
            fill="#4338ca"
            opacity="0.6"
          />
          {/* Hoodie strings */}
          <path d="M 140 224 L 139 248" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
          <path d="M 150 224 L 151 245" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />

          {/* Left Arm (Relaxed at side) */}
          <path
            d="M 122 225 Q 104 260 114 295"
            stroke="url(#techHoodieGrad)"
            strokeWidth="15"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="115" cy="296" r="7" fill="#fed7aa" />

          {/* Right Arm (Extended forward, presenting knowledge) */}
          <path
            d="M 168 226 Q 192 250 205 258"
            stroke="url(#techHoodieGrad)"
            strokeWidth="15"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="206" cy="259" r="7.5" fill="#fed7aa" />

          {/* Neck */}
          <rect x="140" y="206" width="10" height="16" fill="#fed7aa" rx="4" />

          {/* Head & Face */}
          <circle cx="145" cy="180" r="28" fill="#fed7aa" />
          {/* Rosy Cheeks */}
          <circle cx="132" cy="188" r="4.5" fill="#f43f5e" opacity="0.25" />
          <circle cx="158" cy="188" r="4.5" fill="#f43f5e" opacity="0.25" />
          {/* Eyes */}
          <circle cx="137" cy="180" r="3" fill="#1e1b4b" />
          <circle cx="138" cy="178.5" r="1" fill="#ffffff" />
          <circle cx="155" cy="180" r="3" fill="#1e1b4b" />
          <circle cx="156" cy="178.5" r="1" fill="#ffffff" />
          {/* Cute Friendly Eyebrows */}
          <path d="M 132 173 Q 138 171 142 173" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 150 173 Q 155 171 160 173" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Happy Smile */}
          <path d="M 141 189 Q 146 195 151 189" stroke="#1e1b4b" strokeWidth="2.2" strokeLinecap="round" fill="none" />

          {/* Stylish Modern Hair */}
          <path
            d="M 120 180 C 117 155, 140 144, 162 148 C 176 150, 180 166, 175 180 C 171 170, 163 162, 147 163 C 132 164, 126 172, 120 180 Z"
            fill="#1e293b"
          />
          {/* Cool Hair highlight */}
          <path d="M 138 153 Q 153 151 162 158" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Minimalist Glasses */}
          <rect x="130" y="174" width="13" height="12" rx="4" stroke="#4f46e5" strokeWidth="1.8" fill="#ffffff" fillOpacity="0.2" />
          <rect x="148" y="174" width="13" height="12" rx="4" stroke="#4f46e5" strokeWidth="1.8" fill="#ffffff" fillOpacity="0.2" />
          <path d="M 143 179 L 148 179" stroke="#4f46e5" strokeWidth="1.8" />
        </g>

        {/* --- 4. Right Character: Designer / Creative Mentor (Maya) --- */}
        <g className="character-designer">
          {/* Shadow beneath feet */}
          <ellipse cx="475" cy="395" rx="42" ry="7" fill="#581c87" fillOpacity="0.12" />

          {/* Legs & Shoes */}
          <path d="M 460 312 L 456 375" stroke="#64748b" strokeWidth="15" strokeLinecap="round" />
          <path d="M 490 312 L 494 375" stroke="#64748b" strokeWidth="15" strokeLinecap="round" />
          {/* Left Shoe */}
          <rect x="444" y="372" width="26" height="13" rx="6" fill="#ffffff" />
          <path d="M 444 381 L 470 381" stroke="#ec4899" strokeWidth="3" />
          {/* Right Shoe */}
          <rect x="484" y="372" width="26" height="13" rx="6" fill="#ffffff" />
          <path d="M 484 381 L 510 381" stroke="#ec4899" strokeWidth="3" />

          {/* Torso & Elegant Knit Sweater */}
          <path
            d="M 450 220 Q 475 214 500 220 L 505 312 Q 475 318 445 312 Z"
            fill="url(#designSweaterGrad)"
          />
          {/* White shirt collar peeking */}
          <path d="M 470 219 L 475 228 L 480 219" fill="#ffffff" />

          {/* Right Arm (Resting gracefully) */}
          <path
            d="M 498 226 Q 516 260 506 295"
            stroke="url(#designSweaterGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="505" cy="296" r="7" fill="#fed7aa" />

          {/* Left Arm (Extended forward, presenting knowledge) */}
          <path
            d="M 452 226 Q 428 250 415 258"
            stroke="url(#designSweaterGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="414" cy="259" r="7.5" fill="#fed7aa" />

          {/* Neck */}
          <rect x="470" y="206" width="10" height="16" fill="#fed7aa" rx="4" />

          {/* Head & Face */}
          <circle cx="475" cy="180" r="28" fill="#fed7aa" />
          {/* Rosy Cheeks */}
          <circle cx="462" cy="188" r="4.5" fill="#f43f5e" opacity="0.3" />
          <circle cx="488" cy="188" r="4.5" fill="#f43f5e" opacity="0.3" />
          {/* Eyes */}
          <circle cx="465" cy="180" r="3" fill="#1e1b4b" />
          <circle cx="466" cy="178.5" r="1" fill="#ffffff" />
          <circle cx="483" cy="180" r="3" fill="#1e1b4b" />
          <circle cx="484" cy="178.5" r="1" fill="#ffffff" />
          {/* Cute Eyelashes */}
          <path d="M 462 177 L 460 174" stroke="#1e1b4b" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M 486 177 L 488 174" stroke="#1e1b4b" strokeWidth="1.6" strokeLinecap="round" />
          {/* Cheerful Eyebrows */}
          <path d="M 461 173 Q 466 170 470 173" stroke="#451a03" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 479 173 Q 484 170 489 173" stroke="#451a03" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Sweet Smile */}
          <path d="M 470 190 Q 475 196 480 190" stroke="#1e1b4b" strokeWidth="2.2" strokeLinecap="round" fill="none" />

          {/* Chic Bun & Wavy Hair */}
          {/* Back Bun */}
          <circle cx="475" cy="138" r="18" fill="#451a03" />
          {/* Cute Yellow Pencil tucked in bun */}
          <line x1="456" y1="146" x2="494" y2="128" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
          <polygon points="494,128 499,125 496,131" fill="#1e1b4b" />
          {/* Main Hair Volume */}
          <path
            d="M 450 176 C 445 152, 465 146, 485 148 C 504 150, 508 168, 503 182 C 496 166, 488 162, 474 163 C 460 164, 454 170, 450 176 Z"
            fill="#451a03"
          />
          {/* Side soft curls */}
          <path d="M 448 178 Q 444 196 448 206" stroke="#451a03" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M 502 178 Q 506 196 502 206" stroke="#451a03" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          {/* Soft Hair highlight */}
          <path d="M 467 154 Q 482 152 492 158" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>

        {/* --- 5. EXCHANGED OBJECT 1: Modern Laptop with Code (Traversing Top Arc) --- */}
        <g className="flying-item flying-laptop">
          {/* Laptop Base Group */}
          <g filter="url(#cardShadow)">
            {/* Screen Lid */}
            <rect x="-34" y="-28" width="68" height="46" rx="6" fill="#0f172a" stroke="#6366f1" strokeWidth="2" />
            {/* Screen Inner */}
            <rect x="-30" y="-24" width="60" height="38" rx="4" fill="url(#laptopScreenGrad)" />
            {/* Code Symbols on Screen */}
            <text x="-24" y="-10" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">&lt;/&gt;</text>
            <rect x="-5" y="-16" width="28" height="3" rx="1.5" fill="#a78bfa" />
            <rect x="-5" y="-9" width="20" height="3" rx="1.5" fill="#34d399" />
            <rect x="-24" y="-1" width="36" height="3" rx="1.5" fill="#93c5fd" />
            <rect x="-24" y="6" width="22" height="3" rx="1.5" fill="#f472b6" />
            {/* Laptop Base/Keyboard */}
            <path d="M -42 18 L 42 18 L 36 24 L -36 24 Z" fill="#cbd5e1" />
            <rect x="-10" y="20" width="20" height="2" rx="1" fill="#94a3b8" />
          </g>

          {/* Little floating code bracket chip orbiting the laptop */}
          <g className="orbit-chip" transform="translate(38, -26)">
            <rect x="-12" y="-10" width="24" height="20" rx="6" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="-7" y="4" fill="#2563eb" fontSize="11" fontWeight="bold">&#123; &#125;</text>
          </g>
        </g>

        {/* --- 6. EXCHANGED OBJECT 2: Design Tablet & Palette (Traversing Bottom Arc) --- */}
        <g className="flying-item flying-tablet">
          {/* Tablet & Artwork Group */}
          <g filter="url(#cardShadow)">
            {/* Tablet Body */}
            <rect x="-32" y="-24" width="64" height="48" rx="8" fill="#ffffff" stroke="#ec4899" strokeWidth="2" />
            {/* Screen Area */}
            <rect x="-27" y="-19" width="54" height="38" rx="5" fill="url(#tabletScreenGrad)" />
            {/* Creative Canvas: Vector Art bezier curve */}
            <path d="M -20 10 Q -5 -15 15 5 T 22 -6" stroke="#8b5cf6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Color Swatch Dots */}
            <circle cx="-18" cy="-10" r="3.5" fill="#ec4899" />
            <circle cx="-9" cy="-10" r="3.5" fill="#8b5cf6" />
            <circle cx="0" cy="-10" r="3.5" fill="#38bdf8" />
            <circle cx="9" cy="-10" r="3.5" fill="#fbbf24" />
            {/* Digital Stylus Pen */}
            <g transform="translate(18, 12) rotate(-40)">
              <rect x="-2" y="-16" width="4" height="22" rx="2" fill="#334155" />
              <polygon points="-2,6 2,6 0,11" fill="#ec4899" />
            </g>
          </g>

          {/* Floating Paint Palette orbiting the tablet */}
          <g className="orbit-chip-creative" transform="translate(-36, 18)">
            <circle cx="0" cy="0" r="14" fill="#fdf4ff" stroke="#a855f7" strokeWidth="1.5" />
            <circle cx="-5" cy="-4" r="2.5" fill="#f43f5e" />
            <circle cx="4" cy="-5" r="2.5" fill="#3b82f6" />
            <circle cx="5" cy="3" r="2.5" fill="#10b981" />
            <circle cx="-3" cy="5" r="2.5" fill="#f59e0b" />
          </g>
        </g>

        {/* --- 7. Sparkle Effects (Triggering at endpoints & intersection) --- */}
        {/* Sparkle burst near Designer's hands (where laptop arrives) */}
        <g className="sparkle-burst sparkle-burst-right" transform="translate(425, 235)">
          <path d="M 0 -12 Q 0 0 12 0 Q 0 0 0 12 Q 0 0 -12 0 Q 0 0 0 -12 Z" fill="url(#goldGrad)" />
          <circle cx="10" cy="-10" r="2" fill="#a855f7" />
          <circle cx="-12" cy="10" r="2.5" fill="#38bdf8" />
        </g>

        {/* Sparkle burst near Coder's hands (where tablet arrives) */}
        <g className="sparkle-burst sparkle-burst-left" transform="translate(195, 275)">
          <path d="M 0 -12 Q 0 0 12 0 Q 0 0 0 12 Q 0 0 -12 0 Q 0 0 0 -12 Z" fill="url(#goldGrad)" />
          <circle cx="-10" cy="-10" r="2.5" fill="#ec4899" />
          <circle cx="12" cy="10" r="2" fill="#6366f1" />
        </g>

        {/* Center Sparkle Cross-Pollination */}
        <g className="sparkle-burst sparkle-burst-center" transform="translate(310, 255)">
          <path d="M 0 -9 Q 0 0 9 0 Q 0 0 0 9 Q 0 0 -9 0 Q 0 0 0 -9 Z" fill="#ffffff" filter="url(#softGlow)" />
          <path d="M 0 -7 Q 0 0 7 0 Q 0 0 0 7 Q 0 0 -7 0 Q 0 0 0 -7 Z" fill="#818cf8" />
        </g>

        {/* --- 8. Ambient Floating Icons (Lightbulb, Book, Code Chip, Stars) --- */}
        {/* Center Floating Open Book of Knowledge */}
        <g className="ambient-float float-book" transform="translate(310, 85)">
          <g filter="url(#cardShadow)">
            {/* Book Spine & Pages */}
            <path
              d="M 0 6 C -12 -2 -24 -2 -34 4 L -34 26 C -24 20 -12 20 0 28 C 12 20 24 20 34 26 L 34 4 C 24 -2 12 -2 0 6 Z"
              fill="#ffffff"
              stroke="#818cf8"
              strokeWidth="2"
            />
            {/* Book Bookmark Ribbon */}
            <path d="M 0 6 L 0 32 L 4 28 L 8 32 L 8 7" fill="#ec4899" />
            {/* Text lines on book pages */}
            <line x1="-28" y1="10" x2="-8" y2="7" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <line x1="-28" y1="16" x2="-12" y2="13" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="7" x2="28" y2="10" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="13" x2="28" y2="16" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>

        {/* Left Side: Floating Lightbulb (Bright Ideas) */}
        <g className="ambient-float float-lightbulb" transform="translate(68, 175)">
          <circle cx="0" cy="0" r="22" fill="#fef9c3" opacity="0.4" />
          <g filter="url(#cardShadow)">
            <circle cx="0" cy="-3" r="14" fill="url(#goldGrad)" />
            <path d="M -7 6 L 7 6 L 5 13 L -5 13 Z" fill="#94a3b8" />
            <line x1="-3" y1="15" x2="3" y2="15" stroke="#64748b" strokeWidth="2" />
            {/* Glow rays */}
            <line x1="0" y1="-21" x2="0" y2="-26" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="-15" y1="-15" x2="-19" y2="-19" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="15" y1="-15" x2="19" y2="-19" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </g>

        {/* Left Side: Floating Terminal / Code Pill */}
        <g className="ambient-float float-chip" transform="translate(75, 295)">
          <rect x="-24" y="-14" width="48" height="28" rx="8" fill="#ffffff" stroke="#818cf8" strokeWidth="1.8" filter="url(#cardShadow)" />
          <text x="-16" y="4" fill="#4f46e5" fontSize="11" fontWeight="700">&lt;py/&gt;</text>
        </g>

        {/* Right Side: Floating Palette */}
        <g className="ambient-float float-palette" transform="translate(545, 175)">
          <g filter="url(#cardShadow)">
            <path
              d="M -18 0 C -18 -15, 18 -15, 18 0 C 18 10, 12 18, 0 18 C -10 18, -18 12, -18 0 Z"
              fill="#ffffff"
              stroke="#c084fc"
              strokeWidth="2"
            />
            <circle cx="-8" cy="-3" r="3.5" fill="#f43f5e" />
            <circle cx="0" cy="-7" r="3.5" fill="#38bdf8" />
            <circle cx="8" cy="-3" r="3.5" fill="#fbbf24" />
            <circle cx="0" cy="8" r="3" fill="#10b981" />
          </g>
        </g>

        {/* Right Side: Floating Design Pencil */}
        <g className="ambient-float float-pencil" transform="translate(540, 295) rotate(-35)">
          <g filter="url(#cardShadow)">
            <rect x="-6" y="-18" width="12" height="30" rx="3" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
            <polygon points="-6,12 6,12 0,22" fill="#fed7aa" />
            <polygon points="-2,19 2,19 0,22" fill="#1e1b4b" />
            <rect x="-6" y="-22" width="12" height="6" fill="#f43f5e" />
          </g>
        </g>

        {/* Floating Stars & Little Sparkles around */}
        <g className="ambient-float float-star-1" transform="translate(205, 95)">
          <path d="M 0 -8 Q 0 0 8 0 Q 0 0 0 8 Q 0 0 -8 0 Q 0 0 0 -8 Z" fill="#818cf8" />
        </g>
        <g className="ambient-float float-star-2" transform="translate(420, 95)">
          <path d="M 0 -8 Q 0 0 8 0 Q 0 0 0 8 Q 0 0 -8 0 Q 0 0 0 -8 Z" fill="#ec4899" />
        </g>
        <g className="ambient-float float-star-3" transform="translate(135, 120)">
          <circle cx="0" cy="0" r="3" fill="#fbbf24" />
        </g>
        <g className="ambient-float float-star-4" transform="translate(490, 120)">
          <circle cx="0" cy="0" r="3" fill="#a855f7" />
        </g>
        <g className="ambient-float float-star-5" transform="translate(310, 395)">
          <path d="M 0 -6 Q 0 0 6 0 Q 0 0 0 6 Q 0 0 -6 0 Q 0 0 0 -6 Z" fill="#60a5fa" />
        </g>
      </svg>

      {/* Modern Tagline Pill communicating "You teach what you know. You learn what you don't." */}
      <div className="illustration-tagline-container">
        <div className="illustration-tagline-pill">
          <div className="tagline-icon-badge">
            <ArrowLeftRight size={15} />
          </div>
          <span className="tagline-text">
            You teach what you know. <strong>You learn what you don&apos;t.</strong>
          </span>
          <Sparkles size={14} className="tagline-sparkle" />
        </div>
      </div>
    </div>
  );
}

export default SkillSwapIllustration;
