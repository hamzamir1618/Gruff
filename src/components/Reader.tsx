import { useEffect, useLayoutEffect, useRef } from 'react';
import { KITCHEN, LEAD, PARMENTIER, type Story } from '../data/copy';
import { STORY_ARTICLES } from '../data/story';
import { gsap, RM } from '../lib/motion';

const STORIES: Record<string, Story> = Object.fromEntries([LEAD, KITCHEN, PARMENTIER, ...STORY_ARTICLES].map(s => [s.id, s]));

interface Props {
  open: { id: string; from: DOMRect } | null;
  onClose: () => void;
}

// A story lifted off the page: it grows out of its column until it fills the screen, set large enough to read.
export function Reader({ open, onClose }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const story = open ? STORIES[open.id] : null;

  useLayoutEffect(() => {
    if (!open || RM) return;
    closing.current = false;
    const r = open.from, p = panel.current!.getBoundingClientRect();
    const inset = `inset(${r.top - p.top}px ${p.right - r.right}px ${p.bottom - r.bottom}px ${r.left - p.left}px)`;
    gsap.timeline()
      .fromTo(root.current, { backgroundColor: 'rgba(20,14,10,0)' }, { backgroundColor: 'rgba(20,14,10,.62)', duration: 0.5 }, 0)
      .fromTo(panel.current, { clipPath: inset }, { clipPath: 'inset(0px 0px 0px 0px)', duration: 0.75, ease: 'power3.inOut' }, 0)
      .fromTo(panel.current!.querySelectorAll('.rd-in > *'), { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.04, ease: 'power2.out' }, 0.45);
  }, [open]);

  const close = () => {
    if (!open || closing.current) return;
    closing.current = true;
    if (RM) { onClose(); return; }
    const r = open.from, p = panel.current!.getBoundingClientRect();
    gsap.timeline({ onComplete: onClose })
      .to(panel.current!.querySelectorAll('.rd-in > *'), { autoAlpha: 0, duration: 0.2 }, 0)
      .to(panel.current, { clipPath: `inset(${r.top - p.top}px ${p.right - r.right}px ${p.bottom - r.bottom}px ${r.left - p.left}px)`, duration: 0.6, ease: 'power3.inOut' }, 0.1)
      .to(root.current, { backgroundColor: 'rgba(20,14,10,0)', duration: 0.4 }, 0.3);
  };

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);

  if (!open || !story) return null;
  return (
    <div className="reader" ref={root} onClick={e => { if (e.target === root.current) close(); }} role="dialog" aria-modal="true" aria-label={story.head}>
      <div className="rd-panel" ref={panel}>
        <button className="rd-close" onClick={close} aria-label="Close and return to the page">×</button>
        <div className="rd-in">
          {story.kicker && <p className="rd-k">{story.kicker}</p>}
          <h2 className="rd-h">{story.head}</h2>
          {story.decks.map((d, i) => <p key={i} className={i === 0 ? 'rd-d1' : 'rd-d2'}>{d}</p>)}
          <hr className="rd-rule" />
          <div className="rd-body">
            {story.img && (
              <figure className="rd-fig">
                <img src={story.img.src} alt="" />
                <figcaption>{story.img.caption}{story.img.credit ? ` (${story.img.credit}.)` : ''}</figcaption>
              </figure>
            )}
            {story.body.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}
