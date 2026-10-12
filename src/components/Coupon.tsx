import { useRef, useState } from 'react';
import { ITEMS, SHOPS, euro } from '../data/copy';
import { useOrder } from '../lib/order';
import { gsap, RM } from '../lib/motion';

// An order form printed in the paper, to be cut out. "Cut out and send" runs the scissors round
// the dashed border, lifts the form off the page and stamps it as received.
export function Coupon() {
  const { lines, total, count, add, remove, clear, shop, setShop } = useOrder();
  const box = useRef<HTMLDivElement>(null);
  const sc = useRef<HTMLSpanElement>(null);
  const [sent, setSent] = useState(false);
  const busy = useRef(false);

  const send = () => {
    if (!count || busy.current) return;
    if (RM) { clear(); setSent(true); return; }
    busy.current = true;
    const el = box.current!, w = el.offsetWidth, h = el.offsetHeight, per = 2 * (w + h);
    // scissors travel the perimeter, clockwise from the top-left corner
    const at = (d: number) => {
      if (d < w) return { x: d, y: 0, r: 0 };
      if (d < w + h) return { x: w, y: d - w, r: 90 };
      if (d < 2 * w + h) return { x: w - (d - w - h), y: h, r: 180 };
      return { x: 0, y: h - (d - 2 * w - h), r: 270 };
    };
    const pr = { d: 0 };
    gsap.timeline({ onComplete: () => { busy.current = false; } })
      .set(sc.current, { autoAlpha: 1 })
      .to(pr, { d: per, duration: 1.6, ease: 'none', onUpdate: () => { const p = at(pr.d); gsap.set(sc.current, { x: p.x, y: p.y, rotation: p.r }); } })
      .set(sc.current, { autoAlpha: 0 })
      .to(el, { y: -26, rotation: -5, scale: 0.97, boxShadow: '0 18px 30px -12px rgba(0,0,0,.45)', duration: 0.45, ease: 'power2.out' })
      .to(el, { y: -140, x: 60, rotation: 9, autoAlpha: 0, duration: 0.55, ease: 'power2.in' })
      .call(() => { clear(); setSent(true); })
      .set(el, { clearProps: 'all' })
      .fromTo(el.querySelector('.c-stamp'), { scale: 2.6, rotation: -18 }, { scale: 1, rotation: -8, duration: 0.32, ease: 'power4.in' }, '+=0.05');
  };

  return (
    <div className="coupon" ref={box}>
      <span className="scissors" ref={sc} aria-hidden="true">✂</span>
      <span className="scissors-rest" aria-hidden="true">✂</span>
      <h4>Order Form</h4>
      <p className="c-sub">Cut out and hand in at the counter, or send it from here.</p>
      <table className="c-lines">
        <tbody>
          {ITEMS.map(it => {
            const q = lines[it.id] ?? 0;
            return (
              <tr key={it.id} className={q ? 'on' : ''}>
                <td className="c-name">{it.name}</td>
                <td className="c-q">
                  <button onClick={() => remove(it.id)} disabled={!q} aria-label={`One less ${it.name}`}>−</button>
                  <span className="c-box">{q || ''}</span>
                  <button onClick={() => add(it.id)} aria-label={`One more ${it.name}`}>+</button>
                </td>
                <td className="c-p">{q ? euro(q * it.price) : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="c-total"><span>Total</span><i /><b>{euro(total)} €</b></div>
      <label className="c-shop">
        Collect at
        <select id="pickup-counter" value={shop} onChange={e => setShop(e.target.value)}>
          {SHOPS.filter(s => !s.soon).map(s => <option key={s.id} value={s.id}>{s.name}, {s.street}</option>)}
        </select>
      </label>
      <button className="c-send" onClick={send} disabled={!count}>Cut out and send</button>
      <div className={`c-stamp${sent && !count ? ' on' : ''}`} aria-live="polite">
        <b>Received</b>
        <span>Demonstration only. Nothing was ordered.</span>
      </div>
    </div>
  );
}
