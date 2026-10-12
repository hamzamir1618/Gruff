import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Texture } from 'three';
import { gsap, RM, ScrollTrigger } from '../lib/motion';
import type { Fmt, PageProps } from '../components/Print';
import type { Route } from '../lib/route';
import { Paper, Sheet, webglAvailable, type Rect } from './scene';
import { capture } from './capture';

// A publication is anything printed that lies on the table and can be read: today's paper, a dish's
// handbill, the special number. Its pages are HTML; to turn or fold them, they are photographed and bent in WebGL.

export interface PubPage { name: string; render: (p: PageProps) => ReactNode }

/** A printed sheet left lying on the table, drawn under whatever is read next. */
export interface PileSheet { id: string; canvas: HTMLCanvasElement; rect: Rect; x: number; y: number; rot: number; sc: number }

export interface PublicationHandle {
  go: (page: number) => void;
  replay: () => void;
  /** Leave the current page lying on the table ('leave'), or lift it off the table ('remove'). */
  exit: (mode: 'leave' | 'remove') => Promise<PileSheet | null>;
}

interface Props {
  id: string;
  pages: PubPage[];
  /** spin: papers spin in out of the dark. drop: the sheet falls onto the table. none: it is already there. */
  intro: 'spin' | 'drop' | 'none';
  /** After the last page, fold the paper in half and lay it down. */
  ending: 'fold' | 'none';
  start: number;
  /** First thing shown in this visit: show the full printing screen. */
  firstLoad: boolean;
  printing: string;
  /** Pages photographed for the spin opening only (older papers). */
  extras?: ReactNode[];
  endcard?: (api: PublicationHandle) => ReactNode;
  addToPile: (s: PileSheet[]) => void;
  onLive: (id: string) => void;
  onPage: (page: number) => void;
  onReady: () => void;
  read: PageProps['read'];
  nav: (r: Route) => void;
  frozen: boolean;
}

const DESIGN: Record<Fmt, { w: number; h: number }> = { land: { w: 1600, h: 1000 }, port: { w: 900, h: 1400 } };

type Seg =
  | { kind: 'rest'; page: number; d: number }
  | { kind: 'turn'; from: number; d: number; angle: number; r: number }
  | { kind: 'fold'; d: number }
  | { kind: 'end'; d: number };

// turn angles and curl radii vary, so no two pages lift the same way
const ANGLES = [-0.42, 0.3, -0.18, 0.36, -0.3];
const RADII = [0.075, 0.09, 0.07, 0.085, 0.08];

function plan(n: number, ending: Props['ending']) {
  const segs: Seg[] = [{ kind: 'rest', page: 0, d: 0.6 }];
  for (let i = 0; i < n - 1; i++) {
    segs.push({ kind: 'turn', from: i, d: 1.6, angle: ANGLES[i % ANGLES.length], r: RADII[i % RADII.length] });
    segs.push({ kind: 'rest', page: i + 1, d: 0.9 });
  }
  if (ending === 'fold') segs.push({ kind: 'fold', d: 2.2 }, { kind: 'end', d: 0.5 });
  let t = 0;
  const times = segs.map(s => { const a = t; t += s.d; return { s, a, b: t }; });
  return { times, total: t };
}

// scroll distance per unit of publication time, in viewport heights
const VH_PER_UNIT = 80;

function useLayout() {
  const calc = () => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const fmt: Fmt = vw / vh >= 1 ? 'land' : 'port';
    const { w, h } = DESIGN[fmt];
    const m = Math.max(10, Math.min(28, Math.min(vw, vh) * 0.025));
    const bottom = 34; // room for the page tabs
    const s = Math.min((vw - 2 * m) / w, (vh - 2 * m - bottom) / h);
    return { vw, vh, fmt, w, h, s, left: (vw - w * s) / 2, top: m + (vh - 2 * m - bottom - h * s) / 2 };
  };
  const [L, setL] = useState(calc);
  useEffect(() => {
    let id = 0;
    const on = () => { clearTimeout(id); id = window.setTimeout(() => setL(calc()), 160); };
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('resize', on); clearTimeout(id); };
  }, []);
  return L;
}

const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

interface Engine {
  paper: Paper; turner: Sheet; spinners: Sheet[]; tex: Texture[]; extraTex: Texture[]; extraCanvases: HTMLCanvasElement[];
  st?: ScrollTrigger; time: number; page: number; dirty: boolean[];
}

export const Publication = forwardRef<PublicationHandle, Props>(function Publication(props, ref) {
  const { id, pages, intro, ending, start, firstLoad, printing, extras = [], endcard, addToPile, onLive, onPage, onReady, read, nav, frozen } = props;
  const L = useLayout();
  const table = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'printing' | 'intro' | 'live' | 'static'>(RM || !webglAvailable() ? 'static' : 'printing');
  const [printed, setPrinted] = useState<string[]>([]);
  const [introKind, setIntroKind] = useState(intro);
  const { times: TIMES, total: TOTAL } = useMemo(() => plan(pages.length, ending), [pages.length, ending]);
  const END = pages.length;
  const frozenRef = useRef(frozen);
  frozenRef.current = frozen;
  const eng = useRef<Engine | null>(null);
  const api = useRef<PublicationHandle>({ go: () => {}, replay: () => {}, exit: async () => null });
  useImperativeHandle(ref, () => ({ go: p => api.current.go(p), replay: () => api.current.replay(), exit: m => api.current.exit(m) }), []);

  const go = (p: number) => api.current.go(p);
  const rect: Rect = { x: L.left, y: L.top, w: L.w * L.s, h: L.h * L.s };
  const rectRef = useRef(rect);
  rectRef.current = rect;
  const sheetsEls = () => Array.from(table.current!.querySelectorAll<HTMLElement>('.stage .sheet.page'));
  // Hidden with opacity, never visibility: visibility is inherited, so a page hidden that way would also be
  // photographed blank, and a child that sets visibility: visible would still show through.
  const show = (i: number | null) => sheetsEls().forEach((s, k) => {
    const on = k === i;
    s.style.opacity = on ? '1' : '0';
    s.style.pointerEvents = on ? '' : 'none';
  });
  const pixelRatio = () => Math.min(2.2, Math.max(1, rectRef.current.w / L.w * (window.devicePixelRatio || 1) * 1.1), 4096 / L.w);

  /* ---------------- static fallback: pages one under another ---------------- */
  useEffect(() => {
    if (phase !== 'static') return;
    const sheets = sheetsEls();
    window.scrollTo(0, 0);
    api.current.go = p => sheets[Math.min(p, pages.length - 1)]?.scrollIntoView({ block: 'start' });
    api.current.replay = () => window.scrollTo(0, 0);
    api.current.exit = async () => null;
    if (start) requestAnimationFrame(() => sheets[start]?.scrollIntoView({ block: 'start' }));
    const onScroll = () => onPage(Math.min(pages.length - 1, Math.round(window.scrollY / Math.max(1, sheets[0].offsetHeight))));
    window.addEventListener('scroll', onScroll, { passive: true });
    onLive(id);
    onReady();
    return () => window.removeEventListener('scroll', onScroll);
  }, [phase]);

  /* ---------------- printing: photograph every page ---------------- */
  useLayoutEffect(() => {
    if (phase !== 'printing') return;
    let cancelled = false;
    // nothing new shows until it has been printed, except a paper that is already lying there
    show(intro === 'none' ? start : null);
    const run = async () => {
      await Promise.race([document.fonts?.ready, new Promise(r => setTimeout(r, 2500))]);
      await Promise.all(Array.from(table.current!.querySelectorAll('img')).map(i => (i.complete ? null : new Promise(r => { i.onload = i.onerror = r; }))));
      const paper = new Paper(canvas.current!);
      paper.resize(window.innerWidth, window.innerHeight);
      const pr = pixelRatio();
      const pageEls = sheetsEls();
      const extraEls = Array.from(table.current!.querySelectorAll<HTMLElement>('.stage .sheet.extra-src'));
      // the page that is seen first is printed first
      const order = [start, ...pageEls.map((_, i) => i).filter(i => i !== start)];
      const shots: HTMLCanvasElement[] = new Array(pageEls.length);
      const extraShots: HTMLCanvasElement[] = [];
      const thumb = (c: HTMLCanvasElement) => {
        if (!firstLoad) return;
        const t = document.createElement('canvas');
        t.width = 160; t.height = Math.round(160 * c.height / c.width);
        t.getContext('2d')!.drawImage(c, 0, 0, t.width, t.height);
        setPrinted(p => [...p, t.toDataURL('image/jpeg', 0.6)]);
      };
      shots[order[0]] = await capture(pageEls[order[0]], L.w, L.h, pr); thumb(shots[order[0]]);
      for (const el of extraEls) { if (cancelled) return; const c = await capture(el, L.w, L.h, pr); extraShots.push(c); thumb(c); }
      for (const i of order.slice(1)) { if (cancelled) return; shots[i] = await capture(pageEls[i], L.w, L.h, pr); thumb(shots[i]); }
      if (cancelled) { paper.dispose(); return; }
      eng.current = {
        paper, turner: new Sheet(paper.scene),
        spinners: Array.from({ length: Math.max(1, extraShots.length + 1) }, () => new Sheet(paper.scene)),
        tex: shots.map(c => paper.texture(c)), extraTex: extraShots.map(c => paper.texture(c)), extraCanvases: extraShots,
        time: 0, page: start, dirty: pages.map(() => false),
      };
      setPhase('intro');
    };
    run().catch(err => { console.error('Could not print', id, err); setPhase('static'); });
    return () => { cancelled = true; };
  }, [phase]);

  /* ---------------- drawing one moment of the publication ---------------- */
  const draw = (time: number) => {
    const E = eng.current;
    if (!E) return;
    E.time = time;
    const r = rectRef.current;
    const at = TIMES.find(x => time >= x.a && time <= x.b) ?? TIMES[TIMES.length - 1];
    const p = clamp01((time - at.a) / (at.b - at.a));
    const end = table.current!.querySelector<HTMLElement>('.endcard');
    const T = E.turner;
    let page = 0;
    if (end) { end.style.opacity = '0'; end.style.visibility = 'hidden'; }

    if (at.s.kind === 'rest') {
      show(at.s.page);
      T.group.visible = false;
      page = at.s.page;
    } else if (at.s.kind === 'turn') {
      const s = at.s;
      show(p > 0.0005 ? s.from + 1 : s.from);
      if (p <= 0.0005) { T.group.visible = false; page = s.from; } else {
        T.group.visible = true;
        T.place(r, E.paper.view);
        T.setTexture(E.tex[s.from]);
        const R = s.r * Math.max(r.w, r.h);
        const sw = T.sweep(s.angle, R);
        T.curl(sw.from + (sw.to - sw.from) * ease(p), s.angle, R, 1);
        T.turnShadow.material.uniforms.uStrength.value = 0.6 * Math.sin(Math.min(1, p * 1.4) * Math.PI * 0.5) * (1 - smooth(0.75, 1, p));
        T.mesh.material.uniforms.uAlpha.value = 1 - smooth(0.82, 1, p);
        T.setDrop(0, 1);
        page = p > 0.55 ? s.from + 1 : s.from;
      }
    } else {
      // fold the last page in half, lower half behind, and lay it down on the table
      const q = at.s.kind === 'end' ? 1 : p;
      show(null);
      T.group.visible = true;
      T.place(r, E.paper.view);
      T.setTexture(E.tex[pages.length - 1]);
      T.mesh.material.uniforms.uAlpha.value = 1;
      T.turnShadow.material.uniforms.uStrength.value = 0;
      const f = ease(clamp01(q / 0.5));
      T.curl((r.h / 2 + 2) * (1 - f), -Math.PI / 2, Math.max(5, r.h * 0.01), -1);
      const k = ease(smooth(0.42, 1, q));
      const land = r.w > r.h, vw = E.paper.view.w, vh = E.paper.view.h;
      const sc = 1 - k * (land ? 0.42 : 0.2);
      const cx = T.group.position.x, cy = T.group.position.y;
      const tx = land ? -vw * 0.17 : 0, ty = land ? -vh * 0.02 : vh * 0.16;
      T.group.scale.set(sc, sc, 1);
      T.group.rotation.z = (land ? -0.08 : -0.04) * k;
      T.group.position.x = cx + (tx - cx) * k;
      T.group.position.y = cy + (ty - (cy + (r.h / 4) * sc)) * k;
      T.setDrop(0.55 * f, 24, 4 + 10 * k, 1 - 0.5 * f);
      if (end && q > 0.62) { end.style.visibility = 'visible'; end.style.opacity = String(smooth(0.62, 0.95, q)); }
      page = END;
    }
    E.paper.render();
    if (page !== E.page) { E.page = page; onPage(page); }
  };

  /* ---------------- arriving on the table ---------------- */
  useEffect(() => {
    if (phase !== 'intro') return;
    const E = eng.current!;
    const r = rectRef.current, view = E.paper.view;
    const cv = canvas.current!;
    const flash = table.current!.querySelector<HTMLElement>('.flash');
    document.documentElement.classList.add('locked');
    const finish = () => {
      cv.style.filter = '';
      E.spinners.forEach(S => { S.group.visible = false; });
      show(start);
      E.paper.render();
      document.documentElement.classList.remove('locked');
      setPhase('live');
    };

    if (introKind === 'none') { finish(); return; }

    let tl: gsap.core.Timeline;
    if (introKind === 'spin') {
      // older papers and then today's spin in out of the dark and land in a pile, each with a flash
      show(null);
      const poses = [
        { x: -r.w * 0.06, y: r.h * 0.05, rot: 0.07, sc: 0.94 },
        { x: r.w * 0.05, y: -r.h * 0.035, rot: -0.05, sc: 0.97 },
      ].slice(0, E.extraTex.length);
      const all = [...poses.map((P, i) => ({ ...P, tex: E.extraTex[i] })), { x: 0, y: 0, rot: 0, sc: 1, tex: E.tex[start] }];
      const lastRot = all.map(() => 0);
      tl = gsap.timeline({
        onUpdate: () => {
          const v = Math.max(...E.spinners.map((s, i) => { const d = Math.abs(s.group.rotation.z - lastRot[i]); lastRot[i] = s.group.rotation.z; return d; }));
          cv.style.filter = v > 0.02 ? `blur(${Math.min(6, v * 22).toFixed(1)}px)` : '';
          E.paper.render();
        },
        onComplete: () => {
          addToPile(E.extraCanvases.map((c, i) => ({ id: `${id}-extra-${i}`, canvas: c, rect: r, x: poses[i].x, y: -poses[i].y, rot: -poses[i].rot, sc: poses[i].sc })));
          finish();
        },
      });
      all.forEach((P, i) => {
        const S = E.spinners[i], last = i === all.length - 1;
        S.place(r, view); S.setTexture(P.tex); S.flat(); S.setDrop(0, 30, 0);
        const cx = S.group.position.x, cy = S.group.position.y;
        const o = { k: 0 };
        const t0 = 0.15 + i * 0.95;
        tl.call(() => { S.group.visible = true; }, undefined, t0)
          .fromTo(o, { k: 0 }, {
            k: 1, duration: last ? 1.5 : 1.15, ease: 'expo.out',
            onUpdate: () => {
              const k = o.k;
              S.group.rotation.z = P.rot + (1 - k) * (-6.2 - i * 0.8) * Math.PI;
              S.group.rotation.x = (1 - k) * 0.5;
              const sc = Math.max(0.001, P.sc * k);
              S.group.scale.set(sc, sc, 1);
              S.group.position.set(cx + P.x * k, cy + P.y * k, (1 - k) * 300);
              S.setDrop(0.5 * k, 30, (1 - k) * 60 + 4);
            },
          }, t0)
          .fromTo(flash, { opacity: 0.65 }, { opacity: 0, duration: 0.6, ease: 'power2.out', immediateRender: false }, t0 + (last ? 1.0 : 0.85));
      });
    } else {
      // drop: the sheet falls onto the table from above, turning slightly, and settles
      show(null);
      const S = E.spinners[0];
      S.place(r, view); S.setTexture(E.tex[start]); S.flat();
      const cx = S.group.position.x, cy = S.group.position.y;
      const o = { k: 0 };
      S.group.visible = true;
      tl = gsap.timeline({ onUpdate: () => E.paper.render(), onComplete: finish })
        .fromTo(o, { k: 0 }, {
          k: 1, duration: 1.05, ease: 'power3.out',
          onUpdate: () => {
            const k = o.k;
            S.group.position.set(cx + (1 - k) * view.w * 0.12, cy + (1 - k) * view.h * 0.95, (1 - k) * 420);
            S.group.rotation.set((1 - k) * -0.35, 0, (1 - k) * 0.32);
            const sc = 1 + (1 - k) * 0.12;
            S.group.scale.set(sc, sc, 1);
            S.setDrop(0.5 * k, 26, 4 + (1 - k) * 80);
          },
        });
    }
    const skip = () => { if (tl.isActive()) tl.progress(1); };
    window.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', skip);
    return () => { window.removeEventListener('pointerdown', skip); window.removeEventListener('keydown', skip); tl.kill(); };
  }, [phase]);

  /* ---------------- scroll turns the pages ---------------- */
  useEffect(() => {
    if (phase !== 'live') return;
    const E = eng.current!;
    const sc = scroller.current!;
    sc.style.height = `${TOTAL * VH_PER_UNIT + 100}vh`;
    const restAt = (page: number) => {
      if (page >= END) return TOTAL - 0.05;
      const t = TIMES.find(x => x.s.kind === 'rest' && x.s.page === page)!;
      return t.a + 0.02;
    };
    const proxy = { t: restAt(start) };
    const snapTo = (v: number, dir: number) => {
      const time = v * TOTAL;
      const seg = TIMES.find(x => x.s.kind !== 'rest' && x.s.kind !== 'end' && time > x.a + 0.004 && time < x.b - 0.004);
      if (!seg) return v;
      const f = (time - seg.a) / (seg.b - seg.a);
      return (dir >= 0 ? (f > 0.08 ? seg.b : seg.a) : (f < 0.92 ? seg.a : seg.b)) / TOTAL;
    };
    // open at the requested page without playing the turns on the way there
    ScrollTrigger.refresh();
    const tween = gsap.fromTo(proxy, { t: 0 }, {
      t: TOTAL, ease: 'none', immediateRender: false,
      onUpdate: () => draw(proxy.t),
      scrollTrigger: {
        trigger: sc, start: 'top top', end: 'bottom bottom', scrub: 0.7, invalidateOnRefresh: true,
        snap: import.meta.env.DEV && location.search.includes('nosnap') ? undefined
          : { snapTo: (v, self) => snapTo(v, self?.direction ?? 1), duration: { min: 0.35, max: 1.2 }, delay: 0.08, ease: 'power1.inOut' },
      },
    });
    const st = tween.scrollTrigger!;
    E.st = st;
    const startY = st.start + (restAt(start) / TOTAL) * (st.end - st.start);
    window.scrollTo(0, start ? startY : 0);
    st.update();
    st.getTween()?.progress(1);
    tween.progress(restAt(start) / TOTAL);
    draw(restAt(start));
    onLive(id);
    onReady();

    api.current.go = page => {
      const y = st.start + (restAt(Math.max(0, Math.min(END, page))) / TOTAL) * (st.end - st.start);
      gsap.to(window, { scrollTo: { y, autoKill: true }, duration: Math.min(3.2, 0.7 + Math.abs(y - window.scrollY) / 3000), ease: 'power2.inOut', overwrite: true });
    };
    api.current.replay = () => { window.scrollTo(0, 0); st.update(); draw(0); setIntroKind(intro === 'none' ? 'drop' : intro); setPhase('intro'); };
    api.current.exit = mode => new Promise(resolve => {
      const page = Math.min(E.page, pages.length - 1);
      const r = rectRef.current;
      if (mode === 'leave') {
        if (E.page >= END) { resolve(null); return; }
        resolve({ id, canvas: E.tex[page].image as HTMLCanvasElement, rect: { ...r }, x: 0, y: 0, rot: 0, sc: 1 });
        return;
      }
      // lift the sheet off the table: it rises toward the viewer and slides away
      show(null);
      const S = E.turner;
      S.group.visible = true;
      S.place(r, E.paper.view); S.setTexture(E.tex[page]); S.flat();
      S.mesh.material.uniforms.uAlpha.value = 1;
      S.turnShadow.material.uniforms.uStrength.value = 0;
      const cx = S.group.position.x, cy = S.group.position.y, view = E.paper.view;
      const o = { k: 0 };
      gsap.to(o, {
        k: 1, duration: 0.75, ease: 'power2.in',
        onUpdate: () => {
          const k = o.k;
          S.group.position.set(cx + k * view.w * 0.18, cy + k * view.h * 1.05, k * 380);
          S.group.rotation.set(k * -0.3, 0, k * -0.28);
          S.setDrop(0.5 * (1 - k), 26, 4 + k * 90);
          E.paper.render();
        },
        onComplete: () => resolve(null),
      });
    });

    const onKey = (e: KeyboardEvent) => {
      if (frozenRef.current || (e.target as HTMLElement)?.closest('input, select, textarea')) return;
      const next = ['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key);
      const prev = ['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key);
      if (!next && !prev) return;
      e.preventDefault();
      api.current.go(E.page + (next ? 1 : -1));
    };
    window.addEventListener('keydown', onKey);
    if (import.meta.env.DEV) Object.assign(window, { __edition: { TIMES, TOTAL, st, id, shots: () => E.tex.map(t => t.image as HTMLCanvasElement), texTest: (c: HTMLCanvasElement) => { const t = E.paper.texture(c); E.turner.setTexture(t); E.turner.group.visible = true; E.paper.render(); E.turner.group.visible = false; E.paper.render(); } } });

    // keep the photographs of the pages current when something on them changes (order form, clocks)
    const pageEls = sheetsEls();
    let timer = 0;
    const recapture = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(async () => {
        const i = E.dirty.findIndex(Boolean);
        if (i < 0) return;
        const atRest = TIMES.some(x => x.s.kind === 'rest' && E.time >= x.a && E.time <= x.b);
        if (!atRest) { recapture(); return; }
        E.dirty[i] = false;
        const c = await capture(pageEls[i], L.w, L.h, pixelRatio());
        E.tex[i].image = c;
        E.tex[i].needsUpdate = true;
        if (E.dirty.some(Boolean)) recapture();
      }, 700);
    };
    const obs = pageEls.map((el, i) => {
      const o = new MutationObserver(() => { E.dirty[i] = true; recapture(); });
      o.observe(el, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class', 'value'] });
      return o;
    });
    return () => {
      st.kill();
      tween.kill();
      window.removeEventListener('keydown', onKey);
      obs.forEach(o => o.disconnect());
      window.clearTimeout(timer);
    };
  }, [phase]);

  // freeze the scroll (and so the paper) while the reading view is open
  useEffect(() => { document.documentElement.classList.toggle('reading', frozen); }, [frozen]);

  // keep the WebGL view sized with the window
  useEffect(() => {
    const E = eng.current;
    if (!E) return;
    E.paper.resize(L.vw, L.vh);
    ScrollTrigger.refresh();
    draw(E.time);
  }, [L.vw, L.vh, L.s]);

  // free the GPU when this publication leaves the table
  useEffect(() => () => { eng.current?.paper.dispose(); document.documentElement.classList.remove('locked'); }, []);

  const pageProps: PageProps = { fmt: L.fmt, go, nav, read };

  return (
    <>
      <div className={`table fmt-${L.fmt} phase-${phase}`} ref={table}>
        <div className="stage" style={phase === 'static' ? undefined : { left: rect.x, top: rect.y, width: rect.w, height: rect.h }}>
          {pages.map((P, i) => (
            <div
              key={i}
              className={`sheet page fmt-${L.fmt}`}
              style={phase === 'static' ? { width: L.w, height: L.h, zoom: Math.min(1, (window.innerWidth - 48) / L.w) } : { width: L.w, height: L.h, transform: `scale(${L.s})`, zIndex: 10 - i }}
            >
              {P.render(pageProps)}
            </div>
          ))}
          {phase === 'printing' && introKind === 'spin' && extras.map((node, n) => (
            <div key={`x${n}`} className={`sheet extra-src fmt-${L.fmt}`} style={{ width: L.w, height: L.h, transform: `scale(${L.s})`, zIndex: 1, opacity: 0 }}>
              {node}
            </div>
          ))}
        </div>
        <canvas className="gl" ref={canvas} aria-hidden="true" />
        <div className="flash" aria-hidden="true" />
        {endcard && <div className="endcard">{endcard(api.current)}</div>}
        {phase === 'printing' && (firstLoad ? (
          <div className="loader">
            <p className="l-name">Le Gruff</p>
            <p className="l-msg">{printing}</p>
            <div className="l-sheets">
              {Array.from({ length: pages.length + (introKind === 'spin' ? extras.length : 0) }, (_, i) => (
                <span key={i} className={printed[i] ? 'done' : ''} style={printed[i] ? { backgroundImage: `url(${printed[i]})` } : undefined} />
              ))}
            </div>
          </div>
        ) : intro !== 'none' && <div className="printing-note">{printing}…</div>)}
      </div>
      {phase !== 'static' && <div className="scroller" ref={scroller} />}
    </>
  );
});
