import { ITEMS, euro, itemById, type ItemId } from '../data/copy';
import { COOKING, EU_ALLERGENS, SHEETS } from '../data/dishes';
import { useOrder } from '../lib/order';
import { Fleuron, printDate, type PageProps } from '../components/Print';

// A dish's handbill, printed on both sides. The front is the advertisement; the back gives the particulars.

export function DishFront({ id }: PageProps & { id: ItemId }) {
  const it = itemById(id), sh = SHEETS[id];
  const { lines, add } = useOrder();
  const q = lines[id] ?? 0;
  return (
    <div className={`pg handbill face-${it.face}`} lang="en">
      <div className="hb-frame">
        <div className="hb-top"><span>Le Gruff</span><Fleuron /><span>47 Rue des Martyrs</span><Fleuron /><span>Advertisement</span></div>
        <div className="hb-main">
          <figure className="hb-ph">
            <img src={it.img} alt={it.name} />
            <figcaption>{sh.served}. {it.portion}.</figcaption>
          </figure>
          <div className="hb-txt">
            <p className="hb-k">{sh.kicker}</p>
            <img className="hb-orn" src="/img/orn-f.webp" alt="" />
            <h1 className="hb-name">{it.name}</h1>
            <p className="hb-tag">{sh.tagline}</p>
            <div className="hb-price"><span>The portion</span><b>{euro(it.price)}</b><span>euros</span></div>
            <button className="hb-add" onClick={() => add(id)}>
              <img src="/img/manicule.webp" alt="" />
              <span>Add to the order form</span>
              {q ? <b>{q}</b> : null}
            </button>
            <p className="hb-note">{sh.note}</p>
            <p className="hb-turn">Composition and allergens overleaf. Scroll to turn the sheet.</p>
          </div>
        </div>
        <div className="hb-foot">
          <img src="/img/orn-a.webp" alt="" />
          <span>Fried to order, about six minutes. Open from 5 p.m. to 2 a.m. at the Martyrs and Oberkampf counters.</span>
        </div>
      </div>
      <div className="crease" aria-hidden="true" />
    </div>
  );
}

export function DishBack({ id, nav }: PageProps & { id: ItemId }) {
  const it = itemById(id), sh = SHEETS[id];
  const others = ITEMS.filter(i => i.id !== id);
  return (
    <div className="pg handbill-back" lang="en">
      <div className="running">
        <span className="r-no">Overleaf</span>
        <span className="r-mid"><b className="r-name">Le Gruff</b><i>{it.name}</i></span>
        <span className="r-date">Paris, {printDate()}</span>
      </div>
      <div className="hbb-grid">
        <section>
          <h4 className="box-h">Composition</h4>
          <ul className="leaders">
            {sh.composition.map(c => <li key={c.what}><span>{c.what}</span><i /><em>{c.from}</em></li>)}
          </ul>
          <h4 className="box-h sp">Allergens</h4>
          <table className="allergens">
            <tbody>
              {Array.from({ length: Math.ceil(EU_ALLERGENS.length / 2) }, (_, r) => (
                <tr key={r}>
                  {[EU_ALLERGENS[r * 2], EU_ALLERGENS[r * 2 + 1]].map(a => a && (
                    <td key={a} className={sh.allergens.includes(a) ? 'yes' : ''}><span className="mk">{sh.allergens.includes(a) ? '●' : '○'}</span>{a}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="diet">{sh.allergens.length ? sh.dietary : `None of the fourteen declared allergens. ${sh.dietary}`}</p>
          <p className="diet">Nothing but potatoes is fried in our fryers.</p>
        </section>
        <section>
          <h4 className="box-h">How it is cooked</h4>
          <ol className="steps">
            {COOKING.map(s => <li key={s}>{s}</li>)}
          </ol>
          <img className="hbb-img" src="/img/pour.webp" alt="" />
          <h4 className="box-h sp">Suggested sauces</h4>
          <p className="sauces">{sh.sauces.join(', ')}. From 1,50 € each, in paper pots.</p>
        </section>
        <section>
          <h4 className="box-h">Also at the counter</h4>
          <div className="others">
            {others.map(o => (
              <button key={o.id} className="other" onClick={() => nav({ kind: 'dish', id: o.id })}>
                <img src={o.img} alt="" />
                <span><b>{o.name}</b><em>{o.note}</em><i>{euro(o.price)} €</i></span>
              </button>
            ))}
          </div>
          <button className="pointer back-link" onClick={() => nav({ kind: 'edition', page: 1 })}>
            <img src="/img/manicule.webp" alt="" />Back to the menu, in today’s paper
          </button>
        </section>
      </div>
      <div className="crease" aria-hidden="true" />
    </div>
  );
}
