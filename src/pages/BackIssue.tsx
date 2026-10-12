import { BACK_ISSUES, LEAD } from '../data/copy';
import { Body } from '../components/Print';

// An older front page, only seen spinning past in the opening.
export function BackIssue({ n }: { n: 0 | 1 }) {
  const b = BACK_ISSUES[n];
  return (
    <div className={`pg issue issue-${n}`} lang="en" aria-hidden="true">
      <div className="i-top"><span>First Year — {b.no}</span><h1 className="nameplate">Le Gruff</h1><span>Paris, {b.date}</span></div>
      <div className="folio-bar"><span>The daily journal of the frite</span><span>Five centimes</span></div>
      <h2 className="banner">{b.head}</h2>
      <p className="i-deck">{b.deck}</p>
      <div className="i-body">
        <img src={b.img} alt="" />
        <div className="body flow3"><Body paras={[...LEAD.body, ...LEAD.body.slice(0, 3)]} /></div>
      </div>
      <div className="crease" aria-hidden="true" />
    </div>
  );
}
