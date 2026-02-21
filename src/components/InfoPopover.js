import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const InfoPopover = ({ text }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const reactId = useId();
  const popoverId = useMemo(
    () => `metric-info-popover-${reactId.replace(/[:]/g, '')}`,
    [reactId]
  );

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
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popoverId}
      >
        i
      </button>
      {open && (
        <div
          id={popoverId}
          className="metric-info-popover"
          role="dialog"
          aria-live="polite"
        >
          <div className="metric-info-popover-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {text}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoPopover;
