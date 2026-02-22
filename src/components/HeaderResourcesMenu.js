import React, { useEffect, useMemo, useRef, useState, useId } from 'react';
import IconComponent from './IconComponent';

const normalizeResourceLinks = (resourceLinks = []) => {
  if (!Array.isArray(resourceLinks)) {
    return [];
  }

  return resourceLinks
    .filter((group) => group && typeof group.label === 'string' && group.label.trim())
    .map((group) => {
      const validLinks = Array.isArray(group.links)
        ? group.links
            .filter(
              (link) =>
                link &&
                typeof link.label === 'string' &&
                link.label.trim() &&
                typeof link.href === 'string' &&
                link.href.trim()
            )
            .map((link) => ({
              id: link.id,
              label: link.label.trim(),
              href: link.href.trim()
            }))
        : [];

      return {
        id: group.id,
        label: group.label.trim(),
        links: validLinks
      };
    })
    .filter((group) => group.links.length > 0);
};

const HeaderResourcesMenu = ({ resourceLinks = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuWrapperRef = useRef(null);
  const menuId = useId();

  const validResourceLinks = useMemo(
    () => normalizeResourceLinks(resourceLinks),
    [resourceLinks]
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (menuWrapperRef.current && !menuWrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (validResourceLinks.length === 0) {
    return null;
  }

  return (
    <div className="header-resources" ref={menuWrapperRef}>
      <button
        type="button"
        className="header-resources-trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <span>Resources</span>
        <IconComponent name={isOpen ? 'chevron-up' : 'chevron-down'} size="sm" />
      </button>

      {isOpen && (
        <div id={menuId} className="header-resources-menu" role="menu">
          {validResourceLinks.map((group) => (
            <section className="header-resources-group" key={group.id || group.label}>
              <h3 className="header-resources-group-label">{group.label}</h3>
              <div className="header-resources-links">
                {group.links.map((link) => (
                  <a
                    key={link.id || `${group.label}-${link.label}`}
                    className="header-resources-link"
                    href={link.href}
                    role="menuitem"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeaderResourcesMenu;
