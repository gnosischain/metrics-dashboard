import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import ExpandButton from './ExpandButton';

const ChartModal = ({ isOpen, onClose, title, subtitle, headerControls, children, isDarkMode = false }) => {
  const modalContentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleEscKey = (event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen && modalContentRef.current) {
      const existingWatermarks = modalContentRef.current.querySelectorAll('.chart-watermark');
      existingWatermarks.forEach(watermark => watermark.remove());
      
      const watermark = document.createElement('div');
      watermark.className = 'chart-watermark';
      modalContentRef.current.appendChild(watermark);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Use portal to render modal outside the component hierarchy
  return ReactDOM.createPortal(
    <div className="chart-modal-overlay">
      <div className={`chart-modal ${isDarkMode ? 'dark-mode' : ''}`}>
        <div className="chart-modal-header">
          <div className="chart-modal-title">
            <h2>{title}</h2>
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