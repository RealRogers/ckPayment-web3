import React from 'react';

interface SolutionIconProps {
  className?: string;
  size?: number;
}

const SolutionIcon: React.FC<SolutionIconProps> = ({ className = "", size = 512 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 512 512" 
      xmlns="http://www.w3.org/2000/svg"
      className={`solution-icon ${className}`}
    >
      <defs>
        {/* Gradient for hexagons */}
        <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#0A2540', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#1e3a8a', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#5DDE84', stopOpacity: 1 }} />
        </linearGradient>
        
        {/* Glow effect */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Shadow effect */}
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#0A2540" floodOpacity="0.3"/>
        </filter>
        
        {/* Network line gradient */}
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#5DDE84', stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: '#0A2540', stopOpacity: 0.4 }} />
        </linearGradient>
      </defs>
      
      {/* Background circle for depth */}
      <circle 
        cx="256" 
        cy="200" 
        r="120" 
        fill="none" 
        stroke="url(#lineGradient)" 
        strokeWidth="1" 
        opacity="0.3"
        strokeDasharray="5,5"
      />
      
      {/* Network connecting lines */}
      <g className="network-lines">
        <line x1="256" y1="130" x2="206" y2="220" stroke="url(#lineGradient)" strokeWidth="3" opacity="0.7" />
        <line x1="256" y1="130" x2="306" y2="220" stroke="url(#lineGradient)" strokeWidth="3" opacity="0.7" />
        <line x1="206" y1="220" x2="306" y2="220" stroke="url(#lineGradient)" strokeWidth="3" opacity="0.7" />
        
        {/* Connection nodes */}
        <circle cx="256" cy="130" r="4" fill="#5DDE84" opacity="0.8" />
        <circle cx="206" cy="220" r="4" fill="#5DDE84" opacity="0.8" />
        <circle cx="306" cy="220" r="4" fill="#5DDE84" opacity="0.8" />
      </g>
      
      {/* Top hexagon (ckBTC) */}
      <g className="hexagon-group top-hex" style={{ transformOrigin: '256px 130px' }}>
        <polygon 
          points="226,113 241,100 271,100 286,113 286,147 271,160 241,160 226,147" 
          fill="url(#hexGradient)" 
          stroke="#0A2540" 
          strokeWidth="2" 
          filter="url(#shadow)"
        />
        {/* ckBTC coin */}
        <circle cx="256" cy="130" r="18" fill="#FF9500" opacity="0.9" filter="url(#glow)" />
        <circle cx="256" cy="130" r="14" fill="#FFB84D" opacity="0.8" />
        {/* Bitcoin B symbol */}
        <path 
          d="M 248 122 L 248 138 M 252 120 L 252 140 M 252 125 Q 258 125 258 128 Q 258 130 254 130 M 252 130 Q 260 130 260 133 Q 260 136 252 136" 
          stroke="white" 
          strokeWidth="2" 
          fill="none" 
          strokeLinecap="round"
        />
      </g>
      
      {/* Bottom left hexagon (ckETH) */}
      <g className="hexagon-group left-hex" style={{ transformOrigin: '206px 220px' }}>
        <polygon 
          points="176,203 191,190 221,190 236,203 236,237 221,250 191,250 176,237" 
          fill="url(#hexGradient)" 
          stroke="#0A2540" 
          strokeWidth="2" 
          filter="url(#shadow)"
        />
        {/* ckETH coin */}
        <circle cx="206" cy="220" r="18" fill="#627EEA" opacity="0.9" filter="url(#glow)" />
        <circle cx="206" cy="220" r="14" fill="#8FA8F7" opacity="0.8" />
        {/* Ethereum diamond symbol */}
        <path 
          d="M 206 210 L 198 220 L 206 225 L 214 220 Z M 206 210 L 206 225" 
          fill="white" 
          stroke="white" 
          strokeWidth="1"
        />
      </g>
      
      {/* Bottom right hexagon (Generic/ICP token) */}
      <g className="hexagon-group right-hex" style={{ transformOrigin: '306px 220px' }}>
        <polygon 
          points="276,203 291,190 321,190 336,203 336,237 321,250 291,250 276,237" 
          fill="url(#hexGradient)" 
          stroke="#0A2540" 
          strokeWidth="2" 
          filter="url(#shadow)"
        />
        {/* Generic/ICP coin */}
        <circle cx="306" cy="220" r="18" fill="#5DDE84" opacity="0.9" filter="url(#glow)" />
        <circle cx="306" cy="220" r="14" fill="#7EE8A3" opacity="0.8" />
        {/* ICP infinity symbol */}
        <path 
          d="M 298 220 Q 302 215 306 220 Q 310 225 314 220 Q 310 215 306 220 Q 302 225 298 220" 
          fill="white" 
          stroke="white" 
          strokeWidth="1.5"
        />
      </g>
      
      {/* Central connection point */}
      <circle 
        cx="256" 
        cy="183" 
        r="6" 
        fill="#5DDE84" 
        opacity="0.6" 
        filter="url(#glow)"
        className="central-node"
      />
      
      <style>
        {`
        .solution-icon {
          transition: all 0.3s ease;
        }
        
        .hexagon-group {
          transition: transform 0.3s ease;
        }
        
        .solution-icon:hover .hexagon-group {
          animation: subtle-spin 4s linear infinite;
        }
        
        .solution-icon:hover .top-hex {
          animation-delay: 0s;
        }
        
        .solution-icon:hover .left-hex {
          animation-delay: 0.5s;
        }
        
        .solution-icon:hover .right-hex {
          animation-delay: 1s;
        }
        
        .solution-icon:hover .network-lines {
          opacity: 1;
          animation: pulse 2s ease-in-out infinite;
        }
        
        .solution-icon:hover .central-node {
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes subtle-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        `}
      </style>
    </svg>
  );
};

export default SolutionIcon;