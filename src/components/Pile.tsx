import { useEffect, useRef } from 'react';
import type { PileSheet } from '../engine/Publication';

// Printed sheets left lying on the table: the older papers from the opening, and whatever was being read
// before the current publication was put down on top of it.
export function Pile({ sheets }: { sheets: PileSheet[] }) {
  return (
    <div className="pile" aria-hidden="true">
      {sheets.map(s => <PileItem key={`${s.id}-${s.canvas.width}`} s={s} />)}
    </div>
  );
}

function PileItem({ s }: { s: PileSheet }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = s.canvas;
    c.className = 'pile-img';
    el.current!.appendChild(c);
    return () => { if (c.parentNode === el.current) el.current!.removeChild(c); };
  }, [s.canvas]);
  return (
    <div
      ref={el}
      className="pile-sheet"
      style={{ left: s.rect.x, top: s.rect.y, width: s.rect.w, height: s.rect.h, transform: `translate(${s.x}px, ${s.y}px) rotate(${s.rot}rad) scale(${s.sc})` }}
    />
  );
}
