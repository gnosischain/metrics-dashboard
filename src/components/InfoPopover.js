import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const VIEWPORT_MARGIN = 12;
const POPOVER_GAP = 8;
const CONTAINER_MARGIN = 12;
const MIN_POPOVER_WIDTH = 160;
const DEFAULT_POPOVER_WIDTH = 360;
const MAX_POPOVER_WIDTH = 720;

const InfoPopover = ({ text }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: DEFAULT_POPOVER_WIDTH,
    visibility: 'hidden',
    placement: 'bottom'
  });
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);
  const reactId = useId();
  const canUseDom = typeof document !== 'undefined' && Boolean(document.body);
  const popoverId = useMemo(
    () => `metric-info-popover-${reactId.replace(/[:]/g, '')}`,
    [reactId]
  );

  const updatePopoverPosition = useCallback(() => {
    if (!buttonRef.current || !popoverRef.current) {
      return;
    }

    const anchorContainer = buttonRef.current.closest('.metric-card, .chart-modal, .minimal-widget-container');
    const containerRect = anchorContainer?.getBoundingClientRect?.() || null;
    const triggerRect = buttonRef.current.getBoundingClientRect();

    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportMaxWidth = Math.max(MIN_POPOVER_WIDTH, viewportWidth - (VIEWPORT_MARGIN * 2));
    const containerMaxWidth = containerRect
      ? Math.max(0, containerRect.width - (CONTAINER_MARGIN * 2))
      : viewportMaxWidth;
    const hardMaxWidth = Math.max(
      0,
      Math.min(MAX_POPOVER_WIDTH, viewportMaxWidth, containerMaxWidth || viewportMaxWidth)
    );
    const safeHardMaxWidth = hardMaxWidth > 0 ? hardMaxWidth : Math.min(DEFAULT_POPOVER_WIDTH, viewportMaxWidth);
    const minimumWidth = Math.min(MIN_POPOVER_WIDTH, safeHardMaxWidth);
    const resolvedWidth = Math.max(minimumWidth, Math.min(DEFAULT_POPOVER_WIDTH, safeHardMaxWidth));

    popoverRef.current.style.width = `${Math.round(resolvedWidth)}px`;
    const popoverRect = popoverRef.current.getBoundingClientRect();

    let placement = 'bottom';
    const spaceBelow = viewportHeight - triggerRect.bottom - VIEWPORT_MARGIN;
    const spaceAbove = triggerRect.top - VIEWPORT_MARGIN;

    if (
      spaceBelow < popoverRect.height + POPOVER_GAP &&
      spaceAbove >= popoverRect.height + POPOVER_GAP
    ) {
      placement = 'top';
    }

    let left = triggerRect.right - popoverRect.width;
    let minLeft = VIEWPORT_MARGIN;
    let maxLeft = Math.max(minLeft, viewportWidth - VIEWPORT_MARGIN - popoverRect.width);
    if (containerRect) {
      minLeft = Math.max(minLeft, containerRect.left + CONTAINER_MARGIN);
      maxLeft = Math.min(maxLeft, containerRect.right - CONTAINER_MARGIN - popoverRect.width);
    }
    if (maxLeft < minLeft) {
      maxLeft = minLeft;
    }
    left = Math.min(Math.max(left, minLeft), maxLeft);

    let top = placement === 'bottom'
      ? triggerRect.bottom + POPOVER_GAP
      : triggerRect.top - popoverRect.height - POPOVER_GAP;
    const minTop = VIEWPORT_MARGIN;
    const maxTop = Math.max(minTop, viewportHeight - VIEWPORT_MARGIN - popoverRect.height);
    top = Math.min(Math.max(top, minTop), maxTop);

    setPosition({
      top,
      left,
      width: popoverRect.width,
      visibility: 'visible',
      placement
    });
  }, []);

  const toggleOpen = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        setPosition((current) => ({ ...current, visibility: 'hidden' }));
      }
      return next;
    });
  };

  useLayoutEffect(() => {
    if (!open) return;

    const frameId = window.requestAnimationFrame(() => {
      updatePopoverPosition();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [open, text, updatePopoverPosition]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      const target = event.target;
      if (wrapperRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    const handleReposition = () => {
      updatePopoverPosition();
    };

    window.addEventListener('resize', handleReposition);
    document.addEventListener('scroll', handleReposition, true);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleReposition);
      document.removeEventListener('scroll', handleReposition, true);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, updatePopoverPosition]);

  if (!text) return null;

  return (
    <div className="metric-info-wrapper" ref={wrapperRef}>
      <button
        ref={buttonRef}
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
      {open && canUseDom && createPortal(
        <div
          id={popoverId}
          ref={popoverRef}
          className="metric-info-popover"
          role="dialog"
          aria-live="polite"
          data-placement={position.placement}
          style={{
            top: `${Math.round(position.top)}px`,
            left: `${Math.round(position.left)}px`,
            width: `${Math.round(position.width)}px`,
            visibility: position.visibility
          }}
        >
          <div className="metric-info-popover-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {text}
            </ReactMarkdown>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default InfoPopover;
