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

  useEffect(() => {
    const modalNode = modalContentRef.current;
    if (isOpen && modalNode) {
      // Remove any existing watermarks first to prevent duplicates
      const existingWatermarks = modalNode.querySelectorAll(
        '.chart-watermark, .chartjs-watermark, .d3-chart-watermark, .universal-chart-watermark'
      );
      existingWatermarks.forEach(watermark => {
        try { 
          watermark.remove(); 
        } catch (e) { 
          /* Ignore removal errors */ 
        }
      });
      
      // Add a single modal watermark with a slight delay to ensure content is rendered
      const timer = setTimeout(() => {
        addUniversalWatermark({ current: modalNode }, isDarkMode, {
            className: 'modal-chart-watermark',
            size: 35, // Slightly larger for modal
            position: 'bottom-right',
            margin: 15,
            opacity: isDarkMode ? 0.4 : 0.3,
            zIndex: 1001 // Higher z-index for modal
        });
      }, 200);
      
      return () => {
        clearTimeout(timer);
        if (modalNode) {
          removeUniversalWatermark({ current: modalNode }, 'modal-chart-watermark');
        }
      };
    }
  }, [isOpen, isDarkMode]);

  // Handle chart resize when modal opens
  useEffect(() => {
    if (isOpen && modalContentRef.current) {
      const timer = setTimeout(() => {
        // Trigger resize event for ECharts
        const echartsContainers = modalContentRef.current.querySelectorAll('.echarts-container');
        echartsContainers.forEach(container => {
          // Force resize of ECharts instance
          const echartsInstance = container.__echarts__;
          if (echartsInstance) {
            echartsInstance.resize();
          }
        });
      }, 300);

      return () => clearTimeout(timer);
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