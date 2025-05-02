import React, { useEffect } from 'react';
import ExpandButton from './ExpandButton';

/**
 * Modal component for displaying charts in fullscreen
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Handler for closing the modal
 * @param {string} props.title - Chart title
 * @param {string} props.subtitle - Chart subtitle
 * @param {React.ReactNode} props.children - Chart content
 * @returns {JSX.Element|null} Modal component or null if not open
 */
const ChartModal = ({ isOpen, onClose, title, subtitle, children }) => {
  // Add keyboard handler for ESC key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      // Restore body scrolling when modal is closed
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="chart-modal-overlay">
      <div className="chart-modal">
        <div className="chart-modal-header">
          <div className="chart-modal-title">
            <h2>{title}</h2>
            {subtitle && <div className="chart-modal-subtitle">{subtitle}</div>}
          </div>
          <ExpandButton isExpanded={true} onClick={onClose} />
        </div>
        <div className="chart-modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ChartModal;