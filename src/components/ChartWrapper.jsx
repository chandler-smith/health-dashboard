import { useRef } from 'react';

const SCROLL_THRESHOLD = 8; // px of vertical movement = treat as scroll

export default function ChartWrapper({ children, height }) {
  const ref = useRef(null);
  const startY = useRef(null);

  function onTouchStart(e) {
    startY.current = e.touches[0].clientY;
    if (ref.current) ref.current.style.pointerEvents = '';
  }

  function onTouchMove(e) {
    if (startY.current === null) return;
    const dy = Math.abs(e.touches[0].clientY - startY.current);
    if (dy > SCROLL_THRESHOLD && ref.current) {
      ref.current.style.pointerEvents = 'none';
    }
  }

  function onTouchEnd() {
    startY.current = null;
    // Restore after a tick so the chart tooltip can clear itself
    setTimeout(() => {
      if (ref.current) ref.current.style.pointerEvents = '';
    }, 50);
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div ref={ref} style={{ height }}>
        {children}
      </div>
    </div>
  );
}
