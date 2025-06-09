import React, { useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import ExpandButton from './ExpandButton';
import { addUniversalWatermark, removeUniversalWatermark } from '../utils/watermarkUtils';

const ChartModal = ({ isOpen, onClose, title, subtitle, headerControls, children, isDarkMode = false }) => {
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

  // Restore and fix watermark logic for the modal view
  useEffect(() => {
    const modalNode = modalContentRef.current;
    if (isOpen && modalNode) {
      const timer = setTimeout(() => {
        const chartContainer = modalNode.querySelector('.chart-container');
        const hasZoom = chartContainer ? chartContainer.classList.contains('has-zoom') : false;

        addUniversalWatermark({ current: modalNode }, isDarkMode, {
            className: 'modal-chart-watermark',
            preventDuplicates: true,
            // Use custom styles to position correctly above the zoom bar
            customStyles: {
              bottom: hasZoom ? '40px' : '15px',
              right: '15px',
              zIndex: 1001
            }
        });
      }, 200);

      return () => {
        clearTimeout(timer);
        if (modalNode) {
          removeUniversalWatermark({ current: modalNode }, 'modal-chart-watermark');
        }
      };
    }
  }, [isOpen, isDarkMode, children]);


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
      <div className={`chart-modal ${isDarkMode ? 'dark-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
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