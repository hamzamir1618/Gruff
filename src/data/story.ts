// The special number: the story of the counter. Sample copy; dates and details are placeholders
// to be replaced with GRUFF's own history.
import type { Story } from './copy';

export const ST_SHOP: Story = {
  id: 'st-shop',
  kicker: 'The shop',
  head: 'Four Metres Wide, No Kitchen',
  decks: ['How a key cutter’s became a frites counter'],
  body: [
    'For thirty years No. 47 Rue des Martyrs was a key cutter’s. When the lease came up in the winter of 2025, the shop was four metres wide, eleven deep, and had a sink, a workbench and a cellar.',
    'There was no kitchen. The first months went on building one in the cellar: a ventilation duct up the back of the building, a cold room for the potatoes, and a stone floor that could be washed down every night.',
    'The workbench was kept. It is now the counter, and the key cutter’s sign still hangs in the cellar above the cutting press.',
    'The shop opened on the twelfth of March 2026 with one fryer, one dish and a hand-painted board. The first evening it sold a hundred and twelve cones.',
  ],
  img: { src: '/img/ht-storefront.webp', caption: 'The street front, Rue des Martyrs.', credit: 'Photograph by Camille Brodard' },
};

export const ST_POTATOES: Story = {
  id: 'st-potatoes',
  kicker: 'The potatoes',
  head: 'Eleven Varieties Tried, One Kept',
  decks: ['Why the counter uses only Bintje from the Nord'],
  body: [
    'Before the shop opened, eleven varieties were fried side by side, twice each, over three weeks. Most were too waxy and went limp within minutes of leaving the fat. Some coloured too fast.',
    'Bintje, an old Dutch variety grown widely in the north of France and in Belgium, was the only one that stayed crisp for ten minutes in paper and kept a soft centre.',
    'The potatoes come from two farms near Lille. They are delivered on Tuesdays and Fridays and kept no longer than four days, in the dark, at eight degrees. Colder than that, and the starch turns to sugar and the fries burn.',
  ],
  img: { src: '/img/ht-potatoes.webp', caption: 'Bintje, as delivered.' },
};

export const ST_FAT: Story = {
  id: 'st-fat',
  kicker: 'The fat',
  head: 'Beef Fat, Changed Every Day at Four',
  decks: ['The old way, and the reason for it'],
  body: [
    'The fries are cooked in beef fat, as they were by the street sellers of the last century. It gives a firmer crust than oil and a taste that oil does not.',
    'The fat is changed completely every afternoon at four, before the first frying. The used fat is collected twice a week by a soap maker in Montreuil.',
    'Nothing but potatoes goes into the fryers. There is no fish, no meat and no batter, so the fat tastes of nothing but itself.',
  ],
  img: { src: '/img/ht-fryer.webp', caption: 'The first frying, at 140 degrees.' },
};

export const ST_PAPER: Story = {
  id: 'st-paper',
  kicker: 'The paper',
  head: 'Why the Fries Come Wrapped in This Newspaper',
  decks: ['Le Gruff is printed to be eaten from'],
  body: [
    'Fried potatoes have been sold in paper cones in Paris for as long as they have been sold at all. Newspaper takes up the steam and keeps the fries crisp, where a closed box makes them soft.',
    'Old newspaper is no longer allowed near food, so the counter prints its own. Le Gruff is printed once a week on uncoated paper, with food-safe ink and nothing on the inner side, and every cone is wrapped in it.',
    'Customers began keeping the sheets. The evening edition you are reading is the same paper, put online.',
  ],
};

export const ST_COUNTER: Story = {
  id: 'st-counter',
  kicker: 'The counter',
  head: 'No Tables, No Delivery',
  decks: ['What the counter does not do, and why'],
  body: [
    'There are no tables at either counter. Fries are best in the ten minutes after they leave the fat, and most customers eat them standing on the pavement or walking towards the Square d’Anvers.',
    'For the same reason there is no delivery. A cone carried across Paris in a closed bag arrives soft, and the counter would rather not sell it at all.',
    'Orders can be sent ahead and collected at the counter. Groups of more than ten are asked to give an hour’s notice.',
  ],
};

export const STORY_ARTICLES = [ST_SHOP, ST_POTATOES, ST_FAT, ST_PAPER, ST_COUNTER];

export const CHRONICLE = [
  { date: 'Winter 2025', text: 'Lease taken on No. 47, a former key cutter’s.' },
  { date: '12 March 2026', text: 'The counter opens. A hundred and twelve cones sold.' },
  { date: '6 June 2026', text: 'The queue reaches forty metres on a Saturday night.' },
  { date: '18 June 2026', text: 'A second fryer is installed.' },
  { date: '2 September 2026', text: 'A second counter opens on the Rue Oberkampf.' },
  { date: 'Spring 2027', text: 'A third counter, at the Carrefour de l’Odéon.' },
];

export const RULES = [
  'Nothing is frozen.',
  'Potatoes are cut on the morning they are fried.',
  'The fat is changed every day at four.',
  'Nothing but potatoes goes in the fryers.',
  'Salt is added by hand, after frying.',
  'Fries are served in paper, never in a box.',
  'If a batch is not right, it is thrown away.',
];
