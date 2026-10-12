import { ITEMS, type ItemId } from '../data/copy';

/** What is on the table: today's paper (at a page), a dish's handbill, or the special number. */
export type Route =
  | { kind: 'edition'; page: number }
  | { kind: 'dish'; id: ItemId }
  | { kind: 'story' };

export function parseHash(hash = location.hash): Route {
  const h = hash.replace(/^#\/?/, '');
  const dish = h.match(/^dish\/(\w+)/);
  if (dish && ITEMS.some(i => i.id === dish[1])) return { kind: 'dish', id: dish[1] as ItemId };
  if (h === 'story') return { kind: 'story' };
  const page = h.match(/^page\/(\d)/);
  return { kind: 'edition', page: page ? Math.max(0, Number(page[1]) - 1) : 0 };
}

export function hashOf(r: Route) {
  if (r.kind === 'dish') return `#/dish/${r.id}`;
  if (r.kind === 'story') return '#/story';
  return r.page ? `#/page/${r.page + 1}` : '#/';
}

/** Publications are identified without the page, so moving within the paper does not reprint it. */
export const pubKey = (r: Route) => (r.kind === 'dish' ? `dish-${r.id}` : r.kind);

export function navigate(r: Route) {
  const h = hashOf(r);
  if (location.hash !== h && !(h === '#/' && location.hash === '')) location.hash = h;
}
