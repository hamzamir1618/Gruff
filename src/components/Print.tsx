import type { ReactNode } from 'react';
import type { Route } from '../lib/route';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "Monday 5 October 2026" */
export function printDate(d = new Date()) {
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export type Fmt = 'land' | 'port';

export interface PageProps {
  fmt: Fmt;
  /** Turn to a page of the publication on the table. */
  go: (page: number) => void;
  /** Put another publication on the table: a dish's handbill, the special number, or back to the paper. */
  nav: (r: Route) => void;
  read: (storyId: string, from: HTMLElement) => void;
}

/** Running head on the inner pages: page number, paper name, date. */
export function RunningHead({ page, title }: { page: number; title: string }) {
  return (
    <div className="running">
      <span className="r-no">{page}</span>
      <span className="r-mid"><b className="r-name">Le Gruff</b><i>{title}</i></span>
      <span className="r-date">Paris, {printDate()}</span>
    </div>
  );
}

/** A centred stack of decks under a headline, separated by short rules, as nineteenth-century papers set them. */
export function Decks({ decks }: { decks: string[] }) {
  return (
    <div className="decks">
      {decks.map((d, i) => (
        <div key={i}>
          <hr className="dash" />
          <p className={i === 0 ? 'deck1' : 'deck2'}>{d}</p>
        </div>
      ))}
      <hr className="dash" />
    </div>
  );
}

/** Body paragraphs. The first opens with an engraved initial when one is given. */
export function Body({ paras, initial }: { paras: string[]; initial?: string }) {
  return (
    <>
      {paras.map((p, i) => (
        <p key={i} className={i === 0 ? 'first' : undefined}>
          {i === 0 && initial ? (
            <>
              <img className="initial" src={initial} alt={p[0]} />
              {p.slice(1)}
            </>
          ) : p}
        </p>
      ))}
    </>
  );
}

/** A story block that opens the reading view when tapped. */
export function Readable({ id, read, className, children }: { id: string; read: PageProps['read']; className?: string; children: ReactNode }) {
  return (
    <article
      className={`readable ${className ?? ''}`}
      data-story={id}
      onClick={e => read(id, e.currentTarget)}
      role="button"
      tabIndex={0}
      aria-label="Open this story"
      onKeyDown={e => { if (e.key === 'Enter') read(id, e.currentTarget); }}
    >
      {children}
    </article>
  );
}

/** Printers' fleuron used between items. */
export const Fleuron = () => <span className="fleuron" aria-hidden="true">❦</span>;
