import React, { useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import ExpandButton from './ExpandButton';

const ChartModal = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  headerControls, 
  children, 
  isDarkMode = false,
  chartType,
  titleFontSize = null 
}) => {
  const modalContentRef = useRef(null);

  const handleEscKey = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscKey]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="chart-modal-overlay" onClick={onClose}>
      <div 
        className={`chart-modal ${isDarkMode ? 'dark-mode' : ''}`} 
        onClick={(e) => e.stopPropagation()}
        data-chart-type={chartType} 
      >
        <div className="chart-modal-header">
          <div className="chart-modal-title">
            <h2 style={titleFontSize ? { fontSize: titleFontSize } : {}}>
              {title}
            </h2>
            {subtitle && <div className="chart-modal-subtitle">{subtitle}</div>}
          </div>
          <div className="chart-modal-controls">
            {headerControls && <div className="chart-modal-header-controls">{headerControls}</div>}
            <ExpandButton isExpanded={true} onClick={onClose} />
          </div>
        </div>
        <div className="chart-modal-content" ref={modalContentRef} data-theme={isDarkMode ? 'dark' : 'light'}>
          {children}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default ChartModal;