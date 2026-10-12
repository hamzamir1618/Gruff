import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Publication, type PileSheet, type PubPage, type PublicationHandle } from './engine/Publication';
import { Reader } from './components/Reader';
import { Pile } from './components/Pile';
import { OrderProvider, useOrder } from './lib/order';
import { hashOf, navigate, parseHash, pubKey, type Route } from './lib/route';
import { itemById, PAGE_NAMES } from './data/copy';
import { Front } from './pages/Front';
import { Carte } from './pages/Carte';
import { Supplement } from './pages/Supplement';
import { Back } from './pages/Back';
import { BackIssue } from './pages/BackIssue';
import { DishBack, DishFront } from './pages/Dish';
import { StoryCover, StoryInside, StoryLast } from './pages/Story';

const ROMAN = ['I', 'II', 'III', 'IV'];

const EDITION: PubPage[] = [
  { name: PAGE_NAMES[0], render: p => <Front {...p} /> },
  { name: PAGE_NAMES[1], render: p => <Carte {...p} /> },
  { name: PAGE_NAMES[2], render: p => <Supplement {...p} /> },
  { name: PAGE_NAMES[3], render: p => <Back {...p} /> },
];
const STORY: PubPage[] = [
  { name: 'The Shop', render: p => <StoryCover {...p} /> },
  { name: 'Potatoes, Fat, Paper', render: p => <StoryInside {...p} /> },
  { name: 'The Counter', render: p => <StoryLast {...p} /> },
];
const EXTRAS = [<BackIssue n={0} />, <BackIssue n={1} />];

function Shell() {
  const pub = useRef<PublicationHandle>(null);
  const [route, setRoute] = useState<Route>(() => parseHash());
  const routeRef = useRef(route);
  const [intro, setIntro] = useState<'spin' | 'drop' | 'none'>(() => (parseHash().kind === 'edition' ? 'spin' : 'drop'));
  const [firstLoad, setFirstLoad] = useState(true);
  const [pile, setPile] = useState<PileSheet[]>([]);
  const [page, setPage] = useState(route.kind === 'edition' ? route.page : 0);
  const [ready, setReady] = useState(false);
  const [turned, setTurned] = useState(false);
  const [reading, setReading] = useState<{ id: string; from: DOMRect } | null>(null);
  const busy = useRef(false);
  const { count } = useOrder();

  const addToPile = useCallback((sheets: PileSheet[]) => setPile(p => {
    const ids = new Set(sheets.map(s => s.id));
    const kept = p.filter(s => !ids.has(s.id));
    // older papers from the opening stay; of the rest, only the last few are left lying about
    const extras = [...kept, ...sheets].filter(s => s.id.includes('-extra-'));
    const others = [...kept, ...sheets].filter(s => !s.id.includes('-extra-')).slice(-3);
    return [...extras, ...others];
  }), []);
  // when a publication is back on the table, its old picture underneath is no longer needed
  const onLive = useCallback((id: string) => { setFirstLoad(false); setPile(p => p.filter(s => s.id !== id)); }, []);

  // moving between publications: the hash is the source of truth, so links and the back button work alike
  useEffect(() => {
    const onHash = async () => {
      const next = parseHash();
      const cur = routeRef.current;
      if (hashOf(next) === hashOf(cur) || busy.current) return;
      if (pubKey(next) === pubKey(cur)) {
        routeRef.current = next;
        if (next.kind === 'edition') pub.current?.go(next.page);
        return;
      }
      busy.current = true;
      setReading(null);
      setReady(false);
      // going back to the paper lifts the handbill or special number off it; anything else is put down on top
      const mode = next.kind === 'edition' ? 'remove' : 'leave';
      const left = await pub.current?.exit(mode);
      if (left) addToPile([left]);
      setIntro(next.kind === 'edition' && pile.some(s => s.id === 'edition') ? 'none' : 'drop');
      routeRef.current = next;
      setRoute(next);
      setPage(next.kind === 'edition' ? next.page : 0);
      busy.current = false;
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [pile, addToPile]);

  const go = useCallback((p: number) => {
    if (routeRef.current.kind === 'edition') navigate({ kind: 'edition', page: p });
    pub.current?.go(p);
  }, []);
  const onPage = useCallback((p: number) => { setPage(p); if (p > 0) setTurned(true); }, []);
  const read = useCallback((id: string, el: HTMLElement) => setReading({ id, from: el.getBoundingClientRect() }), []);

  const key = pubKey(route);
  const conf = useMemo(() => {
    if (route.kind === 'dish') {
      const id = route.id;
      return {
        pages: [
          { name: 'Front', render: p => <DishFront {...p} id={id} /> },
          { name: 'Back', render: p => <DishBack {...p} id={id} /> },
        ] as PubPage[],
        ending: 'none' as const,
        printing: `Printing the handbill for ${itemById(id).name}`,
        start: 0,
        endcard: undefined,
      };
    }
    if (route.kind === 'story') {
      return {
        pages: STORY, ending: 'fold' as const, printing: 'Printing the special number', start: 0,
        endcard: (api: PublicationHandle) => (
          <>
            <p className="e-k">End of the special number</p>
            <h2>Today’s paper is still on the table.</h2>
            <div className="e-b">
              <button onClick={() => api.replay()}>Read it again</button>
              <button className="red" onClick={() => navigate({ kind: 'edition', page: 0 })}>Today’s paper</button>
            </div>
          </>
        ),
      };
    }
    return {
      pages: EDITION, ending: 'fold' as const, printing: 'Printing the evening edition', start: route.page,
      endcard: (api: PublicationHandle) => (
        <>
          <p className="e-k">End of the evening edition</p>
          <h2>The next edition is printed tomorrow at five.</h2>
          <div className="e-b">
            <button onClick={() => api.replay()}>Read it again</button>
            <button className="red" onClick={() => navigate({ kind: 'edition', page: 1 })}>Order form, page 2</button>
          </div>
        </>
      ),
    };
  }, [key]);

  const names = conf.pages.map(p => p.name);
  const label = (i: number) => (route.kind === 'dish' ? names[i] : ROMAN[i]);

  return (
    <>
      <div className="desk" aria-hidden="true" />
      <Pile sheets={pile} />
      <Publication
        key={key}
        ref={pub}
        id={key}
        pages={conf.pages}
        intro={intro}
        ending={conf.ending}
        start={conf.start}
        firstLoad={firstLoad}
        printing={conf.printing}
        extras={key === 'edition' && intro === 'spin' ? EXTRAS : undefined}
        endcard={conf.endcard}
        addToPile={addToPile}
        onLive={onLive}
        onPage={onPage}
        onReady={() => setReady(true)}
        read={read}
        nav={navigate}
        frozen={!!reading}
      />
      <nav className={`tabs${ready ? ' on' : ''}`} aria-label="Pages">
        {names.map((n, i) => (
          <button key={n} className={page === i ? 'cur' : ''} onClick={() => go(i)} title={n}>
            <b>{label(i)}</b>{route.kind !== 'dish' && <span>{n}</span>}
          </button>
        ))}
      </nav>
      {route.kind !== 'edition' && (
        <button className={`back-tab${ready ? ' on' : ''}`} onClick={() => navigate({ kind: 'edition', page: route.kind === 'dish' ? 1 : 0 })}>
          ← {route.kind === 'dish' ? 'Back to the menu' : 'Today’s paper'}
        </button>
      )}
      <button className={`order-tab${ready ? ' on' : ''}`} onClick={() => navigate({ kind: 'edition', page: 1 })}>
        Order form{count ? <b>{count}</b> : null}
      </button>
      <div className={`hint${ready && !turned && page !== conf.pages.length ? ' on' : ''}`} aria-hidden="true">
        {route.kind === 'dish' ? 'Scroll to turn the sheet over' : 'Scroll to turn the page'}
      </div>
      <Reader open={reading} onClose={() => setReading(null)} />
    </>
  );
}

export default function App() {
  return (
    <OrderProvider>
      <Shell />
    </OrderProvider>
  );
}
