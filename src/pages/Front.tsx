import { BRIEFS, ITEMS, KITCHEN, LEAD, MARKET, PARMENTIER, SMALL_ADS, euro } from '../data/copy';
import { Body, Decks, Fleuron, Readable, printDate, type PageProps } from '../components/Print';

export function Front({ go, read, nav }: PageProps) {
  return (
    <div className="pg front" lang="en">
      <header className="top">
        <div className="ear ear-l">
          <b>The Weather</b>
          <p>Paris, this evening. Overcast, 12 degrees. Light westerly wind. Oil at 185 degrees.</p>
        </div>
        <div className="plate">
          <div className="np-pre">First year <Fleuron /> Published every evening at five o’clock</div>
          <h1 className="nameplate">Le Gruff</h1>
          <div className="np-sub">The daily journal of the frite</div>
        </div>
        <div className="ear ear-r">
          <b>Evening Edition</b>
          <p>The cone</p>
          <p className="ear-price">4,50 €</p>
        </div>
      </header>

      <div className="folio-bar">
        <span>First Year — No. 47</span>
        <span className="red">Paris, {printDate()}</span>
        <span>Offices and counter: 47 Rue des Martyrs</span>
      </div>

      <h2 className="banner">The Frites of the Rue des Martyrs</h2>

      <div className="f-grid">
        <Readable id="lead" read={read} className="c-lead">
          <h3 className="hd">{LEAD.head}</h3>
          <Decks decks={LEAD.decks} />
          <div className="body flow2">
            <Body paras={LEAD.body} initial="/img/init-s.webp" />
            <p className="jump">{LEAD.jump}</p>
          </div>
        </Readable>

        <div className="c-mid">
          <figure className="fig-lead">
            <img src={LEAD.img!.src} alt="Fries and a pot of aïoli on a newspaper" />
            <figcaption>{LEAD.img!.caption} <span>({LEAD.img!.credit}.)</span></figcaption>
          </figure>
          <Readable id="kitchen" read={read} className="c-kitchen">
            <img className="kitchen-img" src="/img/cooks.webp" alt="Engraving of cooks peeling potatoes" />
            <div className="kitchen-txt">
              <h3 className="hd sm">{KITCHEN.head}</h3>
              <p className="deck2">{KITCHEN.decks[0]}</p>
              <hr className="dash" />
              <div className="body"><Body paras={KITCHEN.body} /></div>
            </div>
          </Readable>
        </div>

        <aside className="c-menu">
          <div className="box-dbl menu-box">
            <h4 className="box-h">Today’s Menu</h4>
            <img className="orn" src="/img/orn-f.webp" alt="" />
            <ul className="carte">
              {ITEMS.map(it => (
                <li key={it.id}><button className="dish-link" onClick={() => nav({ kind: 'dish', id: it.id })}>{it.name}</button><i /><b>{euro(it.price)}</b></li>
              ))}
            </ul>
            <p className="carte-note">Sauces from 1,50. Served in paper.</p>
            <button className="pointer" onClick={() => go(1)}><img src="/img/manicule.webp" alt="" />The full menu, page 2</button>
          </div>
          <div className="market">
            <h4 className="box-h">Potato Prices</h4>
            <table>
              <tbody>
                {MARKET.map(m => (
                  <tr key={m.name}><td>{m.name}</td><td className="num">{m.price}</td><td className={`mv ${m.move.startsWith('▲') ? 'up' : m.move.startsWith('▼') ? 'dn' : ''}`}>{m.move}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="note">The kilo, at the Rungis market, this morning.</p>
          </div>
          <img className="veg" src="/img/vegetables.webp" alt="" />
        </aside>

        <aside className="c-briefs">
          <h4 className="box-h">Latest</h4>
          {BRIEFS.map(b => (
            <p className="brief" key={b.head}><b>{b.head}</b> — {b.text}</p>
          ))}
          <button className="special" onClick={() => nav({ kind: 'story' })}>
            <span className="sp-k">Special number</span>
            <b>The Story of the Counter</b>
            <span className="sp-t">Three pages, with the rules of the house. <img src="/img/manicule.webp" alt="" /></span>
          </button>
          <div className="ad ad-slab">
            <span className="a1">GRUFF</span>
            <span className="a2">Frites</span>
            <span className="a3">From 5 p.m. to 2 a.m.</span>
            <span className="a4">47, rue des Martyrs</span>
          </div>
          <div className="ad ad-chef">
            <img src="/img/chef-ad.webp" alt="" />
            <div><span className="a5">La Grande</span><span className="a6">for two, with four sauces</span><span className="a7">9,50</span></div>
          </div>
          <div className="smalls">
            {SMALL_ADS.map(a => <p key={a.lead}><b>{a.lead}</b> {a.text}</p>)}
          </div>
        </aside>
      </div>

      <Readable id="feuilleton" read={read} className="feuilleton">
        <div className="fe-title">
          <span className="fe-k">{PARMENTIER.kicker}</span>
          <b>{PARMENTIER.head}</b>
          <i>{PARMENTIER.decks[0]}</i>
          <img src="/img/potato-plant.webp" alt="" />
        </div>
        <div className="body flow-fe">
          <Body paras={PARMENTIER.body} initial="/img/init-a.webp" />
          <p className="jump">{PARMENTIER.jump}</p>
        </div>
      </Readable>
      <div className="crease" aria-hidden="true" />
    </div>
  );
}
