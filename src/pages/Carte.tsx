import { ITEMS, LETTER, SAUCES, euro, type Item } from '../data/copy';
import { RunningHead, type PageProps } from '../components/Print';
import { useOrder } from '../lib/order';
import { Coupon } from '../components/Coupon';

function Dish({ it, nav }: { it: Item; nav: PageProps['nav'] }) {
  const { lines, add } = useOrder();
  const q = lines[it.id] ?? 0;
  return (
    <article className={`dish face-${it.face}`}>
      <button className="dish-open" onClick={() => nav({ kind: 'dish', id: it.id })} aria-label={`${it.name}: composition and allergens`}>
        <img className="dish-ph" src={it.img} alt={it.name} />
        <h3 className="dish-name">{it.name}</h3>
      </button>
      <p className="dish-note">{it.note}</p>
      <div className="dish-row"><span className="portion">{it.portion}</span><b className="dish-price">{euro(it.price)}</b></div>
      <button className="dish-add" onClick={() => add(it.id)}>
        <img src="/img/manicule.webp" alt="" />
        Add to the order form{q ? ` (${q})` : ''}
      </button>
    </article>
  );
}

export function Carte({ nav }: PageProps) {
  return (
    <div className="pg carte" lang="en">
      <RunningHead page={2} title="The Menu" />
      <div className="carte-head">
        <h2 className="banner">The Counter Menu</h2>
        <p className="banner-sub">Prices are net. Every portion is fried when it is ordered, which takes about six minutes.</p>
      </div>
      <div className="c2-grid">
        <section className="bill">
          <img className="orn-wide" src="/img/orn-c.webp" alt="" />
          <div className="dishes">
            {ITEMS.map(it => <Dish key={it.id} it={it} nav={nav} />)}
          </div>
          <img className="orn-wide flip" src="/img/orn-c.webp" alt="" />
        </section>
        <aside className="c2-side">
          <div className="classifieds">
            <h4 className="box-h">Small Advertisements — Sauces</h4>
            {SAUCES.map(s => (
              <p className="cl" key={s.name}><b>{s.name}</b> {s.text} <span>{s.price}</span></p>
            ))}
            <img className="pour" src="/img/pour.webp" alt="" />
          </div>
          <div className="letter">
            <h4 className="box-h">Letters to the Editor</h4>
            <p><i>{LETTER.q}</i></p>
            <p>{LETTER.a}</p>
          </div>
          <Coupon />
        </aside>
      </div>
      <div className="c2-foot">
        <div className="ad ad-veg"><img src="/img/vegetables.webp" alt="" /><p><b>BINTJE FROM THE NORD.</b> Delivered on Tuesdays and Fridays. Kept no longer than four days.</p></div>
        <div className="ad ad-oven"><img src="/img/oven.webp" alt="" /><p><b>A SECOND FRYER</b> was installed in June. Waiting times have fallen by a third.</p></div>
        <div className="ad ad-cook"><img src="/img/cook-woman.webp" alt="" /><p><b>WANTED.</b> A cook for the morning shift, 7 to 12. Apply at the counter.</p></div>
      </div>
      <div className="crease" aria-hidden="true" />
    </div>
  );
}
