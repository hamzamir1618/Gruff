import { CHRONICLE, RULES, ST_COUNTER, ST_FAT, ST_PAPER, ST_POTATOES, ST_SHOP } from '../data/story';
import type { Story } from '../data/copy';
import { Body, Decks, Fleuron, Readable, RunningHead, printDate, type PageProps } from '../components/Print';

// The special number: a three-page feature about the counter, printed like the daily paper.

function Article({ s, read, initial, photo = true }: { s: Story; read: PageProps['read']; initial?: string; photo?: boolean }) {
  return (
    <Readable id={s.id} read={read} className="st-art">
      <p className="st-k">{s.kicker}</p>
      <h3 className="hd">{s.head}</h3>
      <Decks decks={s.decks} />
      {photo && s.img && (
        <figure className="st-fig">
          <img src={s.img.src} alt="" />
          <figcaption>{s.img.caption}</figcaption>
        </figure>
      )}
      <div className="body"><Body paras={s.body} initial={initial} /></div>
    </Readable>
  );
}

export function StoryCover({ read }: PageProps) {
  return (
    <div className="pg story story-cover" lang="en">
      <div className="sc-top">
        <span>First year</span>
        <h1 className="nameplate sm">Le Gruff</h1>
        <span>Paris, {printDate()}</span>
      </div>
      <div className="folio-bar"><span>Special number</span><span className="red">The story of the counter</span><span>Three pages</span></div>
      <h2 className="banner">How a Frites Counter Came to the Rue des Martyrs</h2>
      <p className="sc-deck">Seven months, two fryers and one dish: a history of the counter at No. 47, by the people who work there.</p>
      <div className="sc-grid">
        <figure className="sc-photo">
          <img src={ST_SHOP.img!.src} alt="A shop front on the Rue des Martyrs" />
          <figcaption>{ST_SHOP.img!.caption} ({ST_SHOP.img!.credit}.)</figcaption>
        </figure>
        <Readable id={ST_SHOP.id} read={read} className="sc-lead">
          <p className="st-k">{ST_SHOP.kicker}</p>
          <h3 className="hd">{ST_SHOP.head}</h3>
          <Decks decks={ST_SHOP.decks} />
          <div className="body flow2"><Body paras={ST_SHOP.body} initial="/img/init-t.webp" /><p className="jump">The potatoes, page 2.</p></div>
        </Readable>
        <aside className="sc-side">
          <div className="box-dbl contents">
            <h4 className="box-h">In this number</h4>
            <ul className="leaders">
              {[ST_SHOP, ST_POTATOES, ST_FAT, ST_PAPER, ST_COUNTER].map((s, i) => (
                <li key={s.id}><span>{(s.kicker ?? s.head).replace(/^./, c => c.toUpperCase())}</span><i /><em>{i === 0 ? 1 : i < 4 ? 2 : 3}</em></li>
              ))}
              <li><span>Chronicle</span><i /><em>3</em></li>
              <li><span>Rules of the house</span><i /><em>3</em></li>
            </ul>
          </div>
          <img className="sc-eiffel" src="/img/eiffel.webp" alt="" />
          <p className="sc-cap">The counter is twenty minutes on foot from the tower, uphill.</p>
        </aside>
      </div>
      <div className="crease" aria-hidden="true" />
    </div>
  );
}

export function StoryInside({ read }: PageProps) {
  return (
    <div className="pg story story-inside" lang="en">
      <RunningHead page={2} title="Special number" />
      <div className="si-grid">
        <Article s={ST_POTATOES} read={read} initial="/img/init-a.webp" />
        <Article s={ST_FAT} read={read} />
        <div className="si-col">
          <Article s={ST_PAPER} read={read} photo={false} />
          <blockquote className="pull">
            <img src="/img/orn-h.webp" alt="" />
            <p>“Nothing but potatoes goes into the fryers.”</p>
            <img className="flip" src="/img/orn-h.webp" alt="" />
          </blockquote>
          <img className="si-boy" src="/img/newsboy.webp" alt="" />
        </div>
      </div>
      <div className="crease" aria-hidden="true" />
    </div>
  );
}

export function StoryLast({ read, nav }: PageProps) {
  return (
    <div className="pg story story-last" lang="en">
      <RunningHead page={3} title="Special number" />
      <div className="sl-grid">
        <Article s={ST_COUNTER} read={read} />
        <section className="chronicle">
          <h4 className="box-h">Chronicle</h4>
          <ol>
            {CHRONICLE.map(c => <li key={c.date}><b>{c.date}</b><span>{c.text}</span></li>)}
          </ol>
          <img src="/img/fountain.webp" alt="" />
        </section>
        <aside className="rules">
          <div className="rules-box">
            <h4>Rules of the House</h4>
            <p className="rules-sub">As painted on the board behind the counter</p>
            <ol>
              {RULES.map((r, i) => <li key={r}><b>Article {i + 1}.</b> {r}</li>)}
            </ol>
            <p className="rules-end"><Fleuron />The management<Fleuron /></p>
          </div>
          <button className="pointer" onClick={() => nav({ kind: 'edition', page: 0 })}><img src="/img/manicule.webp" alt="" />Back to today’s paper</button>
          <button className="pointer" onClick={() => nav({ kind: 'edition', page: 1 })}><img src="/img/manicule.webp" alt="" />The menu and order form</button>
        </aside>
      </div>
      <div className="crease" aria-hidden="true" />
    </div>
  );
}
