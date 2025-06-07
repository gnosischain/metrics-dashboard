import React from 'react';

/**
 * Icon component that renders SVG icons or emoji fallbacks
 * @param {Object} props - Component props
 * @param {string} props.name - Icon name based on iconClass in YAML config
 * @param {string} props.fallback - Fallback emoji or character if icon not found
 * @param {string} props.size - Size of the icon (sm, md, lg)
 * @param {string} props.color - Color of the icon (current = inherit from parent)
 * @returns {JSX.Element} SVG icon or fallback text
 */
const IconComponent = ({ name, fallback = '•', size = 'md', color = 'currentColor' }) => {
  // Size mapping
  const sizeMap = {
    sm: '16',
    md: '20',
    lg: '24',
  };
  
  const pixelSize = sizeMap[size] || '20';
  
  // Determine if name is a valid icon name or fallback to text
  const getIcon = () => {
    // Check if name is empty, use fallback
    if (!name) return <span>{fallback}</span>;
    
    // Map of icon names to SVG paths
    const icons = {
      // Theme Toggle Icons
      'sun': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      ),
      'moon': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      ),
      
      // Navigation/Dashboard icons
      'chart-line': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
      ),
      'dollar-sign': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ),
      'link': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      ),
      'globe': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      ),
      'leaf': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 4 13c0-5 7-11 10-11 4 0 7 3 7 6s-2 5-8 5c-5 0-8 3-8 7"></path>
          <path d="M4 20h8"></path>
        </svg>
      ),
      
      // Tab-specific icons
      'trending-up': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
          <polyline points="17 6 23 6 23 12"></polyline>
        </svg>
      ),
      'zap': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      ),
      'check-circle': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      ),
      'activity': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      ),
      'monitor': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      ),
      'map': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
          <line x1="8" y1="2" x2="8" y2="18"></line>
          <line x1="16" y1="6" x2="16" y2="22"></line>
        </svg>
      ),
      'search': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      ),
      'bar-chart-2': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      ),
      'file-text': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
      // Toggle icons
      'chevron-left': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      ),
      'chevron-right': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      ),
      'chevron-down': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      ),
      'chevron-up': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      ),
      'rwa': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M27,11a1,1,0,0,0,1-1V7a1,1,0,0,0-.66-.94l-11-4a1,1,0,0,0-.68,0l-11,4A1,1,0,0,0,4,7v3a1,1,0,0,0,1,1H6V24H4v2H28V24H26V11ZM6,7.7,16,4.06,26,7.7V9H6ZM18,24H14V11h4ZM8,11h4V24H8ZM24,24H20V11h4Z" transform="translate(0 0)"></path>
        </svg>
      ),
      'yield': (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={pixelSize}
            height={pixelSize}
            viewBox="0 0 64 64"
            fill="none"
            stroke={color}
            strokeWidth="3.648"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="16" cy="16" r="8" />
            <circle cx="48" cy="48" r="8" />
            <line x1="48" y1="8" x2="16" y2="56" />
        </svg>
        ),
        'flow': (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={pixelSize}
                height={pixelSize}
                viewBox="0 0 32 32"
                fill={color}
            >
                <path d="M30,30H22V22h8Zm-6-2h4V24H24Z" />
                <path d="M20,27H8A6,6,0,0,1,8,15h2v2H8a4,4,0,0,0,0,8H20Z" />
                <path d="M20,20H12V12h8Zm-6-2h4V14H14Z" />
                <path d="M24,17H22V15h2a4,4,0,0,0,0-8H12V5H24a6,6,0,0,1,0,12Z" />
                <path d="M10,10H2V2h8ZM4,8H8V4H4Z" />
            </svg>
            ),
        'fork': (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={pixelSize}
                height={pixelSize}
                viewBox="0 0 32 32"
                fill={color}
            >
                <path d="M19,2v6h2v5c0,1.103-0.897,2-2,2h-3c-0.732,0-1.409,0.212-2,0.556V8h2V2h-6v6h2v11v5h-2v6h6v-6h-2v-5
                c0-1.103,0.897-2,2-2h3c2.206,0,4-1.794,4-4V8h2V2H19z M12,4h2v2h-2V4z M14,28h-2v-2h2V28z M23,6h-2V4h2V6z" />
            </svg>
            ),



    };
    
    // Return the SVG icon if it exists, otherwise fallback
    return icons[name] || <span>{fallback}</span>;
  };
  
  return (
    <div className="icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {getIcon()}
    </div>
  );
};

export default IconComponent;