import { REPORT } from '../data/copy';
import { printDate, type PageProps } from '../components/Print';

// The illustrated Sunday supplement, after Le Petit Journal: one large colour plate and a narrow column.
const PLATES = {
  land: { src: '/img/plate-millet.jpg', alt: 'Painting of peasants gathering potatoes into sacks under a stormy sky', title: 'The Potato Harvest', after: 'After the painting by Jean-François Millet, 1855' },
  port: { src: '/img/plate-masson.jpg', alt: 'Painting of three women gathering potatoes into a sack at dusk', title: 'Gathering Potatoes', after: 'After the painting by Ernest Masson, 1878' },
};

export function Supplement({ fmt }: PageProps) {
  const plate = PLATES[fmt];
  return (
    <div className="pg supp" lang="en">
      <header className="s-head">
        <div className="s-left"><b className="s-name">Le Gruff</b><span>Every Sunday</span><span>Eight pages, five centimes</span></div>
        <h2 className="s-title">Illustrated Supplement</h2>
        <div className="s-right"><span>No. 47</span><span>{printDate()}</span></div>
      </header>
      <div className="s-rule" />
      <div className="s-body">
        <figure className="s-plate">
          <div className="s-frame"><img src={plate.src} alt={plate.alt} /></div>
          <figcaption>
            <b>{plate.title}</b>
            <i>{plate.after}</i>
          </figcaption>
        </figure>
        <aside className="s-side">
          <h4 className="box-h">From the field to the fryer</h4>
          <ol className="day">
            {REPORT.map(r => (
              <li key={r.h}><b>{r.h}</b><span><em>{r.title}.</em> {r.text}</span></li>
            ))}
          </ol>
          <img className="s-plant" src="/img/potato-plant.webp" alt="Engraving of a potato plant" />
          <p className="s-cap">Solanum tuberosum. From a French field guide of the last century.</p>
          <img className="s-orn" src="/img/orn-e.webp" alt="" />
        </aside>
      </div>
      <div className="crease" aria-hidden="true" />
    </div>
  );
}
