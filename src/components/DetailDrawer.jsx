import { useEffect, useRef, useState } from 'react';

// Locks body scroll without jumping to top, preserving current scroll position
function lockScroll() {
  const scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
  document.body.dataset.scrollY = scrollY;
}

function unlockScroll() {
  const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  delete document.body.dataset.scrollY;
  window.scrollTo(0, scrollY);
}

const SWIPE_CLOSE_THRESHOLD = 80; // px dragged down to trigger close

export default function DetailDrawer({ open, onClose, children }) {
  const drawerRef = useRef(null);
  const [dragY, setDragY] = useState(0);
  const touchStartY = useRef(null);
  const dragging = useRef(false);

  useEffect(() => {
    if (!open) return;
    lockScroll();
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => {
      unlockScroll();
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // Reset drag state when drawer closes
  useEffect(() => {
    if (!open) setDragY(0);
  }, [open]);

  function onTouchStart(e) {
    // Only start drag if touch begins on the handle area or near the top of the drawer
    touchStartY.current = e.touches[0].clientY;
    dragging.current = true;
  }

  function onTouchMove(e) {
    if (!dragging.current || touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) {
      setDragY(delta);
      // Prevent page scroll while dragging drawer down
      e.preventDefault();
    }
  }

  function onTouchEnd() {
    if (dragY >= SWIPE_CLOSE_THRESHOLD) {
      onClose();
    } else {
      setDragY(0);
    }
    dragging.current = false;
    touchStartY.current = null;
  }

  if (!open) return null;

  const opacity = Math.max(0, 1 - dragY / 300);

  return (
    <>
      <div
        className="drawer-overlay"
        style={{ opacity }}
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        className="drawer"
        role="dialog"
        aria-modal="true"
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragY === 0 ? 'transform 280ms cubic-bezier(0.32, 0.72, 0, 1)' : 'none',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Handle doubles as close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            padding: '12px 0 4px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            minHeight: 44,
          }}
        >
          <span
            style={{
              display: 'block',
              width: 36,
              height: 4,
              borderRadius: 2,
              background: 'var(--border-card)',
            }}
          />
        </button>

        <div className="drawer-content">
          {children}
        </div>
      </div>
    </>
  );
}
