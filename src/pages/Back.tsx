import { useEffect, useState } from 'react';
import { NOTICES, PAST_ISSUES, SHOPS, isOpen } from '../data/copy';
import { RunningHead, type PageProps } from '../components/Print';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const pad = (n: number) => String(n).padStart(2, '0');

function useTonight() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  const h = now.getHours(), open = h >= 17 || h < 2;
  const t = new Date(now);
  if (open) { if (h >= 17) t.setDate(t.getDate() + 1); t.setHours(2, 0, 0, 0); } else t.setHours(17, 0, 0, 0);
  const m = Math.max(0, Math.round((t.getTime() - now.getTime()) / 60000));
  return { open, text: `${pad(Math.floor(m / 60))} h ${pad(m % 60)}` };
}

export function Back({ nav }: PageProps) {
  const tonight = useTonight();
  return (
    <div className="pg back" lang="en">
      <RunningHead page={4} title="Back Page" />
      <h2 className="banner">Where to Find Le Gruff</h2>
      <div className="b-grid">
        <figure className="b-map">
          <div className="map-wrap">
            <img src="/img/map-paris.jpg" alt="Old printed plan of Paris in twenty arrondissements" />
            {SHOPS.map((s, i) => (
              <span key={s.id} className={`pin${s.soon ? ' soon' : ''}`} style={{ left: `${s.pin[0] * 100}%`, top: `${s.pin[1] * 100}%` }}>{i + 1}</span>
            ))}
          </div>
          <figcaption>Plan of Paris in twenty arrondissements, with the counters marked. Positions approximate.</figcaption>
        </figure>

        <div className="b-mid">
          <h4 className="box-h">Opening Hours</h4>
          <table className="timetable">
            <thead><tr><th>Counter</th>{DAYS.map(d => <th key={d}>{d}</th>)}</tr></thead>
            <tbody>
              {SHOPS.map((s, i) => (
                <tr key={s.id}>
                  <td><b>{i + 1}.</b> {s.name}</td>
                  {DAYS.map(d => <td key={d}>{s.soon ? '·' : `${s.opens}–${s.closes}`}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="tt-note">Hours from 5 p.m. to 2 a.m. unless shown. The Odéon counter opens in the spring of 2027.</p>
          <ul className="addresses">
            {SHOPS.map((s, i) => {
              const open = isOpen(s);
              return (
                <li key={s.id}>
                  <b>{i + 1}. {s.name}</b>
                  <span>{s.street}, {s.district}</span>
                  <em className={s.soon ? 'soon' : open ? 'open' : 'shut'}>{s.soon ? s.soon : open ? 'Open now' : 'Closed now'}</em>
                </li>
              );
            })}
          </ul>
          <div className="notices">
            <h4 className="box-h">Notices</h4>
            {NOTICES.map(n => <p key={n.head}><b>{n.head}</b> {n.text}</p>)}
          </div>
        </div>

        <aside className="b-side">
          <div className="box-dbl tonight">
            <h4 className="box-h">Tonight</h4>
            <p>{tonight.open ? 'The counters are open. They close in' : 'The counters open in'}</p>
            <b className="cd">{tonight.text}</b>
            <p>Last orders at a quarter to two.</p>
          </div>
          <img className="newsboy" src="/img/newsboy.webp" alt="Engraving of a newsboy" />
          <p className="crier">“Get your Gruff!”</p>
          <div className="issues-list">
            <h4 className="box-h">Past Issues</h4>
            {PAST_ISSUES.map(i => <p key={i.no}><b>{i.no}</b>, {i.date}. — {i.head}.</p>)}
            <button className="pointer" onClick={() => nav({ kind: 'story' })}><img src="/img/manicule.webp" alt="" />Special number: the story of the counter</button>
          </div>
          <form className="subscribe" onSubmit={e => { e.preventDefault(); (e.currentTarget.querySelector('button') as HTMLButtonElement).textContent = 'Noted'; }}>
            <h4 className="box-h">Subscribe</h4>
            <p>The evening edition by email, once a week. No other use is made of the address.</p>
            <input id="subscribe-email" type="email" placeholder="your@address.fr" aria-label="Email address" />
            <button type="submit">Subscribe</button>
          </form>
        </aside>
      </div>
      <div className="b-foot">
        <div className="ad ad-car"><img src="/img/motorcar.webp" alt="" /><p><b>NO DELIVERIES.</b> Fries do not travel. Please eat them within ten minutes.</p></div>
        <div className="ad ad-fountain"><img src="/img/fountain.webp" alt="" /><p><b>PLACE SAINT-MICHEL.</b> The nearest counter to the Left Bank will be at the Odéon.</p></div>
        <p className="imprint">Printed by Le Gruff, 47 Rue des Martyrs, Paris. Photographs from Unsplash; engravings and paintings in the public domain. Responsible editor: the staff.</p>
      </div>
      <div className="crease" aria-hidden="true" />
    </div>
  );
}
