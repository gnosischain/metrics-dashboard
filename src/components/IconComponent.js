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
      'user': (
        <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
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
        'validator': (
            <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} 
                viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" 
                strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 12 15 15 10"></polyline>
            </svg>
          ),

        'gauge': (
            <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize}
                viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 14a9 9 0 1 0-18 0" />
              <path d="M12 14l4-4" />
              <circle cx="12" cy="14" r="2" />
              <line x1="7" y1="14" x2="7" y2="14" />
              <line x1="17" y1="14" x2="17" y2="14" />
            </svg>
          ),
        // Circles brand — official Favicon from aboutcircles.com, wrapped in a rounded
        // square container to match the Gnosis App icon treatment.
        'circles': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" role="img" aria-label="Circles">
            <image href="/imgs/brand/circles.png" x="2" y="2" width="20" height="20"></image>
          </svg>
        ),
        'bot': (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={pixelSize}
            height={pixelSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            role="img"
            aria-label="Bot"
          >
            {/* Antenna */}
            <path d="M12 2v2.5" />
            <circle cx="12" cy="1.5" r="1" fill={color} stroke="none" />

            {/* Bigger head */}
            <rect x="3" y="6" width="18" height="14" rx="5" ry="5" />

            {/* Ears */}
            <path d="M2 13h1" />
            <path d="M21 13h1" />

            {/* Larger eyes */}
            <circle cx="9" cy="13" r="1.5" />
            <circle cx="15" cy="13" r="1.5" />

            {/* Bigger smile */}
            <path d="M8 16s2 2.5 4 2.5 4-2.5 4-2.5" />
          </svg>
        ),
        'wallet': (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={pixelSize}
            height={pixelSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            role="img"
            aria-label="Wallet"
          >
            {/* Wallet body */}
            <rect x="3" y="7" width="18" height="12" rx="3" ry="3" />

            {/* Top slot seam */}
            <path d="M6 10h9" />

            {/* Side pocket/closure area */}
            <path d="M15 11h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4z" />

            {/* Button/fastener */}
            <circle cx="18" cy="14" r="1" />
          </svg>
        ),

        'transaction': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Transaction">
            {/* Left-to-right transfer */}
            <path d="M3 7h13" />
            <polyline points="13 3 17 7 13 11" />
            {/* Right-to-left transfer */}
            <path d="M21 17H8" />
            <polyline points="11 21 7 17 11 13" />
          </svg>
        ),

        'gas-usage': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Gas usage">
            {/* Flame */}
            <path d="M12 2c3 4 6 6.5 6 10a6 6 0 1 1-12 0c0-2.5 1.2-4.3 3-6" />
            {/* Small gauge tick to suggest “usage” */}
            <path d="M12 14l2.5-2.5" />
          </svg>
        ),

        'coins': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Stack of coins, outline only for monochrome */}
            <ellipse cx="8" cy="6" rx="4" ry="2"></ellipse>
            <path d="M4 6v4c0 1.1 1.8 2 4 2s4-.9 4-2V6"></path>
            <path d="M4 10v4c0 1.1 1.8 2 4 2s4-.9 4-2v-4"></path>
            <ellipse cx="16" cy="10" rx="4" ry="2"></ellipse>
            <path d="M12 10v4c0 1.1 1.8 2 4 2s4-.9 4-2v-4"></path>
          </svg>
        ),

          'users': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Two user silhouettes, outline only for monochrome */}
            <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        ),

        'wallets': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Wallets">
            {/* Back wallet */}
            <rect x="5" y="6" width="14" height="10" rx="3" ry="3" />
            {/* Front wallet, slightly offset */}
            <rect x="3" y="8" width="14" height="10" rx="3" ry="3" />
            {/* Button on front pocket */}
            <circle cx="13" cy="13" r="1" />
          </svg>
        ),

        'blob': (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={pixelSize}
            height={pixelSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            role="img"
            aria-label="Blob"
          >
            {/* Blob outline */}
            <path
              d="M6 19c-.8-4.6 3-13 6-13s6.8 8.4 6 13c-.4 2.3-2.2 3-6 3s-5.6-.7-6-3z"
              fill="none"
            />
            {/* Eyes */}
            <ellipse cx="10" cy="13.2" rx="1" ry="1.6" fill={color} stroke="none" />
            <ellipse cx="14" cy="13.2" rx="1" ry="1.6" fill={color} stroke="none" />
          </svg>
        ),

        'stopwatch': (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={pixelSize}
            height={pixelSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            role="img"
            aria-label="Stopwatch"
          >
            {/* Stem + knob */}
            <line x1="12" y1="3" x2="12" y2="5" />
            <rect x="10" y="1" width="4" height="2" rx="0.5" />

            {/* Side buttons */}
            <path d="M5.5 6.5l2 2" />
            <path d="M18.5 6.5l-2 2" />

            {/* Body */}
            <circle cx="12" cy="13" r="8" />

            {/* Hands */}
            <line x1="12" y1="13" x2="12" y2="8" />     {/* minute hand */}
            <line x1="12" y1="13" x2="15" y2="15" />     {/* second hand */}
          </svg>
        ),

        'bridge': (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={pixelSize}
            height={pixelSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            role="img"
            aria-label="Bridge"
          >
            {/* Pylons */}
            <path d="M3 18V8" />
            <path d="M21 18V8" />
            {/* Deck */}
            <path d="M3 18h18" />
            {/* Suspension cables */}
            <path d="M3 8C6 4 9 4 12 8" />
            <path d="M12 8C15 4 18 4 21 8" />
            {/* Hangers */}
            <path d="M6 18V11" />
            <path d="M9 18V10" />
            <path d="M15 18V10" />
            <path d="M18 18V11" />
          </svg>
        ),

        'token-dot': (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={pixelSize}
            height={pixelSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            role="img"
            aria-label="Token Flow"
          >
            {/* left chevron < */}
            <polyline points="7 8 3 12 7 16" />
            {/* token (dot) */}
            <circle cx="12" cy="12" r="2" fill={color} stroke="none" />
            {/* right chevron > */}
            <polyline points="17 8 21 12 17 16" />
          </svg>
        ),

        'lending': (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={pixelSize}
            height={pixelSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            role="img"
            aria-label="Lending"
          >
            {/* Bidirectional exchange: lending and borrowing */}
            {/* Left side: arrow pointing right (deposits/lending out) */}
            <path d="M3 12h5" />
            <polyline points="6 9 8 12 6 15" />
            {/* Center: coin/circle representing the pool */}
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
            {/* Right side: arrow pointing left (borrowing in) */}
            <path d="M21 12h-5" />
            <polyline points="18 9 16 12 18 15" />
          </svg>
        ),

        'pool': (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={pixelSize}
            height={pixelSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            role="img"
            aria-label="Pool"
          >
            {/* Two overlapping circles representing token pair in a liquidity pool */}
            <circle cx="9" cy="12" r="5"></circle>
            <circle cx="15" cy="12" r="5"></circle>
          </svg>
        ),

        // Gnosis Pay brand — official Framer-hosted glyph wrapped in the same dark
        // rounded container that Gnosis App and Circles use for brand consistency.
        'credit-card': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" role="img" aria-label="Gnosis Pay">
            <image href="/imgs/brand/gnosis-pay.png" x="2" y="2" width="20" height="20"></image>
          </svg>
        ),
        'gnosis-pay': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Credit card">
            <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
            <line x1="6" y1="15" x2="10" y2="15" />
          </svg>
        ),

        'gift': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Gift">
            <polyline points="20 12 20 22 4 22 4 12"></polyline>
            <rect x="2" y="7" width="20" height="5"></rect>
            <line x1="12" y1="22" x2="12" y2="7"></line>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
          </svg>
        ),

        // Gnosis App brand — the official glyph (shipped under
        // /imgs/brand/gnosis-app.png) wrapped in the Gnosis-blue rounded
        // square container that the app icon uses everywhere.
        'gnosis-app': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" role="img" aria-label="Gnosis App">
            <image href="/imgs/brand/gnosis-app.png" x="2" y="2" width="20" height="20"></image>
          </svg>
        ),

        // Savings xDAI tab — vault icon (dollar-mark + circle) rendered in the
        // same sharp-stroked vector style as the Yields / Lending sibling icons.
        'savings': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Savings xDAI">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M15 8.5a4 4 0 0 0-3.5-1.5c-1.9 0-3 1-3 2.5 0 3 6.5 1.5 6.5 4.5 0 1.5-1.2 2.5-3 2.5A4 4 0 0 1 8.5 15"></path>
            <line x1="12" y1="6" x2="12" y2="18"></line>
          </svg>
        ),

        // Swap / Exchange — two arrows pointing in opposite directions.
        'exchange': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Exchange">
            <polyline points="17 1 21 5 17 9"></polyline>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
            <polyline points="7 23 3 19 7 15"></polyline>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
          </svg>
        ),

        // Piggy bank — classic side-view piggy with coin slot.
        'piggy-bank': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Piggy Bank">
            <path d="M19 10c0-4-3-7-8-7s-8 3-8 7c0 2 1 3.5 2 4.5V18h3v-2h6v2h3v-3.5c1-1 2-2.5 2-4.5Z"></path>
            <line x1="10" y1="8" x2="14" y2="8"></line>
            <circle cx="15.5" cy="10.5" r="0.5" fill={color}></circle>
            <path d="M19 10h2"></path>
          </svg>
        ),

        // Vault / safe door — for GP Wallets tab.
        'vault': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Vault">
            <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
            <circle cx="12" cy="12" r="4"></circle>
            <line x1="12" y1="8" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="16" y2="12"></line>
          </svg>
        ),

        // Shopping cart — marketplace.
        'shopping-cart': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Shopping Cart">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        ),

        'swap': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 3l4 4-4 4"></path>
            <path d="M20 7H4"></path>
            <path d="M8 21l-4-4 4-4"></path>
            <path d="M4 17h16"></path>
          </svg>
        ),

        'cow-protocol': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" role="img" aria-label="CoW Protocol">
            <image href="/imgs/brand/cowprotocol.svg" x="2" y="2" width="20" height="20"></image>
          </svg>
        ),

        'bar-chart': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
        ),

        'panel-left': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
        ),

        // Liquidity / pools — teardrop.
        'droplet': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Droplet">
            <path d="M12 2.5S5 9.5 5 14a7 7 0 0 0 14 0c0-4.5-7-11.5-7-11.5z"></path>
          </svg>
        ),

        // Minting — claw hammer.
        'hammer': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Hammer">
            <path d="M14 3l7 7-2.5 2.5-7-7z"></path>
            <path d="M11.5 5.5l-8 8a2.83 2.83 0 1 0 4 4l8-8"></path>
          </svg>
        ),

        // Minting — pickaxe (Circles Minters tab).
        'pickaxe': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Pickaxe">
            <path d="M14.531 12.469 6.619 20.38a1 1 0 1 1-3-3l7.912-7.912"></path>
            <path d="M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393"></path>
            <path d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4z"></path>
            <path d="M19.686 8.314a12.5 12.5 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.319"></path>
          </svg>
        ),

        // Network / graph — connected nodes.
        'network': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Network">
            <circle cx="5" cy="6" r="2"></circle>
            <circle cx="19" cy="6" r="2"></circle>
            <circle cx="12" cy="18" r="2"></circle>
            <path d="M7 6h10"></path>
            <path d="M6.2 7.7l4.8 8.6"></path>
            <path d="M17.8 7.7L13 16.3"></path>
          </svg>
        ),

        // Refresh / migration — circular arrow.
        'rotate': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Rotate">
            <polyline points="21 4 21 10 15 10"></polyline>
            <path d="M18.4 15a8 8 0 1 1-1.9-8.3L21 10"></path>
          </svg>
        ),

        // Shuffle — crossing arrows.
        'shuffle': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Shuffle">
            <polyline points="16 3 21 3 21 8"></polyline>
            <line x1="4" y1="20" x2="21" y2="3"></line>
            <polyline points="21 16 21 21 16 21"></polyline>
            <line x1="15" y1="15" x2="21" y2="21"></line>
            <line x1="4" y1="4" x2="9" y2="9"></line>
          </svg>
        ),

        // Target / attribution — concentric rings.
        'target': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Target">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
        ),

        // Book / glossary — open book.
        'book-open': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Book">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        ),

        // Mobile / app — smartphone.
        'mobile': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Mobile">
            <rect x="6" y="2" width="12" height="20" rx="2" ry="2"></rect>
            <line x1="11" y1="18" x2="13" y2="18"></line>
          </svg>
        ),

        // Treasury / institution — landmark.
        'landmark': (
          <svg xmlns="http://www.w3.org/2000/svg" width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Landmark">
            <line x1="3" y1="22" x2="21" y2="22"></line>
            <line x1="6" y1="18" x2="6" y2="11"></line>
            <line x1="10" y1="18" x2="10" y2="11"></line>
            <line x1="14" y1="18" x2="14" y2="11"></line>
            <line x1="18" y1="18" x2="18" y2="11"></line>
            <polygon points="12 2 21 7 3 7"></polygon>
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