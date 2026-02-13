import React, { useEffect, useRef, useState } from 'react';

const InfoPopover = ({ text }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const toggleOpen = () => setOpen(prev => !prev);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!text) return null;

  return (
    <div className="metric-info-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="metric-info-button"
        onClick={toggleOpen}
        aria-label="Metric information"
      >
        i
      </button>
      {open && (
        <div className="metric-info-popover" role="dialog" aria-live="polite">
          {text}
        </div>
      )}
    </div>
  );
};

export default InfoPopover;
