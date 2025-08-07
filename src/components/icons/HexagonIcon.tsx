import React from 'react';

interface HexagonIconProps {
  className?: string;
  size?: number;
  type?: 'btc' | 'eth' | 'icp';
}

const HexagonIcon: React.FC<HexagonIconProps> = ({ 
  className = "", 
  size = 64, 
  type = 'icp' 
}) => {
  const getTokenConfig = () => {
    switch (type) {
      case 'btc':
        return {
          color: '#FF9500',
          lightColor: '#FFB84D',
          symbol: (
            <path 
              d="M -4 -8 L -4 8 M 0 -10 L 0 10 M 0 -5 Q 6 -5 6 -2 Q 6 0 2 0 M 0 0 Q 8 0 8 3 Q 8 6 0 6" 
              stroke="white" 
              strokeWidth="1.5" 
              fill="none" 
              strokeLinecap="round"
            />
          )
        };
      case 'eth':
        return {
          color: '#627EEA',
          lightColor: '#8FA8F7',
          symbol: (
            <path 
              d="M 0 -10 L -8 0 L 0 5 L 8 0 Z M 0 -10 L 0 5" 
              fill="white" 
              stroke="white" 
              strokeWidth="0.5"
            />
          )
        };
      case 'icp':
      default:
        return {
          color: '#5DDE84',
          lightColor: '#7EE8A3',
          symbol: (
            <path 
              d="M -6 0 Q -2 -5 2 0 Q 6 5 10 0 Q 6 -5 2 0 Q -2 5 -6 0" 
              fill="white" 
              stroke="white" 
              strokeWidth="1"
            />
          )
        };
    }
  };

  const config = getTokenConfig();
  const viewBoxSize = size;
  const hexSize = size * 0.4;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} 
      xmlns="http://www.w3.org/2000/svg"
      className={`hexagon-icon ${className}`}
    >
      <defs>
        <linearGradient id={`hexGradient-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#0A2540', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: config.color, stopOpacity: 1 }} />
        </linearGradient>
        
        <filter id={`glow-${type}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Hexagon */}
      <g transform={`translate(${viewBoxSize/2}, ${viewBoxSize/2})`} className="hexagon-container">
        <polygon 
          points={`-${hexSize*0.5},-${hexSize*0.29} -${hexSize*0.25},-${hexSize*0.5} ${hexSize*0.25},-${hexSize*0.5} ${hexSize*0.5},-${hexSize*0.29} ${hexSize*0.5},${hexSize*0.29} ${hexSize*0.25},${hexSize*0.5} -${hexSize*0.25},${hexSize*0.5} -${hexSize*0.5},${hexSize*0.29}`}
          fill={`url(#hexGradient-${type})`}
          stroke="#0A2540" 
          strokeWidth="1.5" 
          filter={`url(#glow-${type})`}
        />
        
        {/* Token coin */}
        <circle cx="0" cy="0" r={hexSize*0.35} fill={config.color} opacity="0.9" />
        <circle cx="0" cy="0" r={hexSize*0.25} fill={config.lightColor} opacity="0.8" />
        
        {/* Token symbol */}
        <g transform="scale(0.8)">
          {config.symbol}
        </g>
      </g>
      
      <style>
        {`
        .hexagon-icon {
          transition: all 0.3s ease;
        }
        
        .hexagon-container {
          transition: transform 0.3s ease;
        }
        
        .hexagon-icon:hover .hexagon-container {
          transform: translate(${viewBoxSize/2}px, ${viewBoxSize/2}px) rotate(360deg) scale(1.1);
        }
        `}
      </style>
    </svg>
  );
};

export default HexagonIcon;