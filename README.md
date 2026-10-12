# Le Gruff

Front end for GRUFF, set as a nineteenth-century Paris evening paper lying on a café table. Scrolling turns the pages. Each turn is a real paper bend rendered in WebGL, not a flip of a flat card.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks, then builds to dist/
npm run preview    # serves the production build
```

Dev only: add `?nosnap` to the URL to turn off snapping, so you can stop part-way through a turn.

## Screens

Everything is a printed thing on the same table. The URL hash says which one, so links and the browser's back button work.

| URL | What is on the table |
| --- | --- |
| `#/` or `#/page/2`… | Today's paper, four pages: front page, menu and order form, illustrated supplement, back page |
| `#/dish/classique`, `truffe`, `poivre`, `grande` | A dish's handbill. Front: the advertisement, price and "add to order". Back (scroll to turn it over): composition with origins, the fourteen allergens, how it is cooked, suggested sauces, the other dishes |
| `#/story` | The special number: three pages on the shop, the potatoes, the fat, the paper, the counter, a chronicle and the rules of the house. Ends with the same fold as the paper |

Moving between them: opening a handbill or the special number drops the new sheet onto the table, with the page you were reading left lying underneath. Going back to the paper lifts the handbill off and away, showing the paper still there. Dishes open from the front-page menu box, the menu page photos and names, and the back of every handbill. The special number opens from a box on the front page and from the back page.

`src/engine/Publication.tsx` is the shared engine (printing, arrival, page turns, fold, leaving). `src/App.tsx` routes between publications and keeps the pile. Dish data is in `src/data/dishes.ts` and the special number's copy in `src/data/story.ts`; both are placeholders, and the allergen list in particular must be checked against the real recipes.

## How it works

1. **Printing.** Each page is ordinary HTML and CSS, laid out at a fixed design size (1600×1000 on wide screens, 900×1400 on tall ones) and scaled onto the table. On load, every page and the two back issues are photographed into canvases with `html-to-image`; the browser renders them itself, so the pictures match the DOM. The loading screen shows the sheets as they come off.
2. **Opening.** The two back issues and today's front page spin in out of the dark as textured planes in WebGL, with motion blur and a press-camera flash, and come to rest in a pile. The pile is then handed back to the DOM.
3. **Turning.** A scroll-scrubbed timeline drives everything, and every frame is a pure function of the scroll position (`draw()` in `src/engine/Publication.tsx`), so scrolling back reverses exactly. During a turn, the page's picture is mapped onto a finely divided plane wrapped round a moving cylinder (`src/engine/scene.ts`). The back of the sheet shows the ink faintly through, mirrored, and the page underneath gets a soft shadow from the curl. Each turn lifts at a different angle. After the last page, the paper folds in half, lower half behind, and is laid on the pile.
4. **Reading.** At rest, the page is live HTML. Tap a story and it lifts off the page into a reading view set at a readable size. The order form on page 2 is live too, and page pictures are retaken whenever something on them changes.

| Path | What |
| --- | --- |
| `src/engine/Publication.tsx` | Layout, printing, opening, the scroll timeline and `draw()`, snapping, keyboard, page pictures kept current |
| `src/engine/scene.ts` | three.js scene; the paper shader (curl, fold-behind, show-through, lighting) and its shadows |
| `src/engine/capture.ts` | Photographs a page element into a canvas |
| `src/pages/` | Front page, La Carte (menu and order form), Supplément illustré, Dernière page, and the back issues |
| `src/components/` | Print helpers (decks, initials, running heads), the order coupon, the reading view |
| `src/data/copy.ts` | Every word printed, the menu, sauces, hours and addresses (sample data) |
| `src/styles/paper.css` | The typesetting of the pages |
| `src/styles/app.css` | Table, loader, tabs, reading view, static fallback |
| `public/img/` | Halftone-screened photographs, the supplement plates, engravings and ornaments, the table, the paper grain |
| `public/fonts/` | Self-hosted fonts, so page pictures render with the right type |

## Language and type

The paper is printed in English. Only the nameplate (*Le Gruff*), the dish names and the street names stay French.


UnifrakturMaguntia for the nameplate. Old Standard TT for headlines, decks and small caps. League Gothic for banner headlines. Libre Caslon Text for body text. Alfa Slab One and Rye only inside advertisements, as wood type.

## Motion inventory

- **Printing screen:** the six sheets appear as they are photographed.
- **Opening:** two back issues and today's paper spin in with motion blur and land in a pile, each with a flash (at least 0.85 s apart).
- **Page turns (I → II → III → IV):** a curl that starts at a corner and rolls the sheet over toward the left, at a different angle each time. The paper's back shows the ink through, and the page below darkens near the curl.
- **Fold:** after the last page, the lower half folds away behind. The paper shrinks onto the pile, and a closing card offers to read again or go to the order form.
- **Reading view:** a story grows out of its column to fill the screen, and shrinks back on close (Esc, ×, or click outside).
- **Order form:** "Cut out and send" runs scissors round the dashed border, lifts the form off the page, and stamps it *Reçu*.
- **Keyboard:** arrow keys, Page Up/Down and Space turn one page. The tabs at the bottom jump to a page.

With `prefers-reduced-motion: reduce`, or without WebGL, there is no printing step and no opening: the pages sit one under another as plain HTML.

## Placeholders to replace

- All copy, prices, sauces, hours, addresses and figures in `src/data/copy.ts`.
- Photographs are Unsplash stock, processed into halftone screens; credits are in `public/img/CREDITS.json`. GRUFF's own photographs should replace them.
- The supplement plate is a public-domain painting printed onto the page: Millet's *The Potato Harvest* (1855) on wide screens, Ernest Masson's *Les Ramasseuses de pommes de terre* (1878) on tall ones.
- Engravings, ornaments, initials and the plan of Paris are public domain or CC0 (via Openverse). Map pin positions are approximate.
- Ordering is front end only. "Cut out and send" sends nothing.
