// Everything printed in Le Gruff. Sample copy: prices, figures, hours and addresses are placeholders.

export interface Story {
  id: string;
  /** Section label, as set above the headline. */
  kicker?: string;
  head: string;
  /** Stacked decks under the headline, from loudest to quietest. */
  decks: string[];
  body: string[];
  img?: { src: string; caption: string; credit?: string };
  /** Shown at the end of the column on the page (not in the reading view). */
  jump?: string;
}

export const LEAD: Story = {
  id: 'lead',
  kicker: 'Front page',
  head: 'A Frites Counter Opens at No. 47',
  decks: [
    'Potatoes from the Nord, cut by hand and fried twice in beef fat',
    'The queue reaches the Boulevard de Clichy',
  ],
  body: [
    'Since the twelfth of March, a narrow counter at No. 47 Rue des Martyrs has sold one thing: potatoes, cut into sticks and fried twice. It opens at five in the evening and closes at two in the morning.',
    'The potatoes are Bintje, grown in the Nord and delivered on Tuesdays and Fridays. They are peeled, cut to ten millimetres, rinsed twice in cold water and left to dry on cloths.',
    'The first frying, at 140 degrees, takes about eight minutes and cooks the inside. The fries then wait in wire baskets until they are ordered.',
    'The second frying, at 185 degrees, lasts ninety seconds. It is done in beef fat, which is changed every afternoon at four. The fries are salted by hand, wrapped in paper and passed across the counter.',
    'On Saturday evening the queue reached the corner of the Boulevard de Clichy. Customers questioned by this newspaper reported waiting between nine and fifteen minutes. A second fryer was installed in June.',
    'There are no tables. Most customers eat standing on the pavement or walk down towards the Square d’Anvers.',
  ],
  img: { src: '/img/ht-lead.webp', caption: 'Fig. 1. — La Classique, served with aïoli.', credit: 'Photograph by Logan Weaver' },
  jump: 'The menu, page 2.',
};

export const KITCHEN: Story = {
  id: 'kitchen',
  kicker: 'Kitchen',
  head: 'Eleven Kilogrammes Before Noon',
  decks: ['A morning in the kitchen behind the counter'],
  body: [
    'The kitchen begins at seven. Four cooks share the work: two peel, one cuts and one rinses and sorts. Pieces shorter than five centimetres are set aside and eaten by the staff.',
    'The sauces are made each day before three o’clock: an aïoli with lemon, a béarnaise, and a mayonnaise smoked over beech wood, which is made only for the weekend.',
    'The cutting is done with a hand-operated press bought second-hand from a restaurant in Lille. It cuts one potato at a time.',
  ],
  img: { src: '/img/cooks.webp', caption: 'The morning peeling. From an engraving.' },
};

export const PARMENTIER: Story = {
  id: 'feuilleton',
  kicker: 'The Gruff Serial',
  head: 'Monsieur Parmentier’s Potatoes',
  decks: ['Chapter III. — The field at Les Sablons'],
  body: [
    'In 1786 the pharmacist Antoine-Augustin Parmentier was granted a field at Les Sablons, west of Paris, to grow potatoes, a plant many Parisians still regarded as fit only for animals.',
    'According to a story told ever since, he had the field watched by guards during the day and left unguarded at night, so that people, supposing the crop to be valuable, would come and take some for themselves.',
    'Whether or not the guards were posted for this reason, the potato was eaten in Paris within a generation, and the dishes named after Parmentier are still on menus today.',
    'The fried potato came later. Street sellers on the Pont Neuf were offering fried potatoes by the middle of the nineteenth century, sold in paper cones.',
    'The sellers worked from small stoves on wheels, frying in beef or horse fat, and moved with the crowds: to the bridges by day and to the boulevards and the theatres in the evening.',
    'Their customers were mostly workmen, students and soldiers. A cone cost a sou. Cookery writers of the period mention the dish rarely, and usually without enthusiasm.',
    'In Belgium the same fried potatoes were sold from stalls at fairs and on market squares, and the habit of frying them twice, once to cook and once to colour, seems to have spread from there.',
    'By the end of the century the pommes frites had reached the menus of the brasseries, served beside a steak. The street sellers did not survive the motor car and the new regulations of the prefecture.',
    'Of the potatoes grown at Les Sablons, nothing remains. The field lies under the Bois de Boulogne and the houses of Neuilly, and the guards, if there were any, are long forgotten.',
  ],
  jump: 'To be continued.',
};

export const BRIEFS = [
  { head: 'Martyrs.', text: 'Waiting time at nine o’clock this evening: twelve minutes.' },
  { head: 'Truffle.', text: 'The Truffe & Comté returns tonight. Forty portions.' },
  { head: 'Weekend.', text: 'Smoked mayonnaise on Saturday and Sunday only.' },
  { head: 'Oil.', text: 'Changed daily at four. The used fat is collected for soap.' },
  { head: 'Notice.', text: 'The counter will close at midnight on the 31st of December.' },
];

export const MARKET = [
  { name: 'Bintje (Nord)', price: '0,92', move: '▲ 0,03' },
  { name: 'Agria', price: '0,88', move: '▼ 0,01' },
  { name: 'Charlotte', price: '1,40', move: '=' },
  { name: 'Monalisa', price: '0,85', move: '▲ 0,02' },
  { name: 'Beef fat', price: '3,10', move: '=' },
];

export const SMALL_ADS = [
  { lead: 'WANTED', text: 'potato peeler, mornings, 7 to 12. Apply at the counter.' },
  { lead: 'LOST', text: 'black umbrella, Rue des Martyrs, Saturday night. Return to the counter.' },
  { lead: 'FOR SALE', text: 'paper cones, by the thousand. Printed. Enquire within.' },
];

export type ItemId = 'classique' | 'truffe' | 'poivre' | 'grande';

export interface Item {
  id: ItemId;
  name: string;
  note: string;
  portion: string;
  price: number;
  img: string;
  /** Wood type the advertisement is set in. */
  face: 'slab' | 'rye' | 'gothic' | 'standard';
}

export const ITEMS: Item[] = [
  { id: 'classique', name: 'La Classique', note: 'Sea salt. Served in a paper cone.', portion: 'Cone, 250 g', price: 4.5, img: '/img/ht-m-classique.webp', face: 'slab' },
  { id: 'truffe', name: 'Truffe & Comté', note: 'Black truffle, Comté aged twenty-four months.', portion: 'Basket, 250 g', price: 7.9, img: '/img/ht-m-truffe.webp', face: 'gothic' },
  { id: 'poivre', name: 'Poivre Noir', note: 'Kampot pepper, flaked salt.', portion: 'Paper, 250 g', price: 5.2, img: '/img/ht-m-poivre.webp', face: 'rye' },
  { id: 'grande', name: 'La Grande', note: 'For two. Four sauces of your choice.', portion: 'Tray, 600 g', price: 9.5, img: '/img/ht-m-grande.webp', face: 'standard' },
];

export const itemById = (id: ItemId) => ITEMS.find(i => i.id === id)!;
export const euro = (v: number) => v.toFixed(2).replace('.', ',');

export const SAUCES = [
  { name: 'AIOLI.', text: 'Garlic, lemon, olive oil. Made daily.', price: '1,50' },
  { name: 'BÉARNAISE.', text: 'Tarragon, shallot, clarified butter.', price: '1,50' },
  { name: 'SMOKED MAYONNAISE.', text: 'Smoked over beech. Saturday and Sunday.', price: '1,80' },
  { name: 'ANDALOUSE.', text: 'Tomato and sweet pepper.', price: '1,50' },
  { name: 'MUSTARD.', text: 'Dijon, whole grain.', price: '1,50' },
  { name: 'KETCHUP.', text: 'From the bottle. On request.', price: '0,80' },
];

export const LETTER = {
  q: 'Sir, — Why are your fries wrapped in newspaper? — A reader, 11th arrondissement.',
  a: 'The paper takes up the steam and keeps the fries crisp for about ten minutes. We print it ourselves, without ink on the inner side.',
};

export const REPORT = [
  { h: '6 h', title: 'Harvest', text: 'Bintje potatoes are lifted from sandy soil near Lille.' },
  { h: '8 h', title: 'Delivery', text: 'Two deliveries a week. Nothing is kept more than four days.' },
  { h: '10 h', title: 'Cutting', text: 'Cut by hand to ten millimetres, rinsed twice, left to dry.' },
  { h: '13 h', title: 'Sauces', text: 'Aïoli, béarnaise and mayonnaise are made the same day.' },
  { h: '17 h', title: 'First frying', text: 'Eight minutes at 140 degrees, in beef fat.' },
  { h: '21 h', title: 'Second frying', text: 'Ninety seconds at 185 degrees. Salted, wrapped, handed over.' },
];

export interface Shop {
  id: string;
  name: string;
  street: string;
  district: string;
  opens: number;
  closes: number;
  soon?: string;
  /** Position on the printed plan, as fractions of its width and height. */
  pin: [number, number];
}

export const SHOPS: Shop[] = [
  { id: 'martyrs', name: 'Martyrs', street: '47, rue des Martyrs', district: '9e', opens: 17, closes: 2, pin: [0.475, 0.33] },
  { id: 'oberkampf', name: 'Oberkampf', street: '112, rue Oberkampf', district: '11e', opens: 18, closes: 2, pin: [0.615, 0.46] },
  { id: 'odeon', name: 'Odéon', street: 'Carrefour de l’Odéon', district: '6e', opens: 17, closes: 2, soon: 'Spring 2027', pin: [0.455, 0.6] },
];

export function isOpen(s: Shop, d = new Date()) {
  if (s.soon) return false;
  const h = d.getHours() + d.getMinutes() / 60;
  return s.closes < s.opens ? h >= s.opens || h < s.closes : h >= s.opens && h < s.closes;
}

export const PAST_ISSUES = [
  { no: 'No 1', date: '12 March', head: 'Frites counter opens on the Rue des Martyrs' },
  { no: 'No 13', date: '6 June', head: 'Queue reaches forty metres' },
  { no: 'No 22', date: '18 June', head: 'Second fryer installed' },
  { no: 'No 38', date: '2 September', head: 'Oberkampf counter opens' },
];

export const NOTICES = [
  { head: 'DELIVERY.', text: 'There is none. Fries do not travel well, and we would rather you ate them within ten minutes.' },
  { head: 'GROUPS.', text: 'Orders of more than ten cones should be placed one hour ahead, at the counter.' },
  { head: 'ODÉON.', text: 'A third counter will open at the Carrefour de l’Odéon in the spring of 2027.' },
];

export const BACK_ISSUES = [
  { no: 'No 1', date: 'Thursday 12 March 2026', head: 'Frites Counter Opens on the Rue des Martyrs', deck: 'One fryer, one menu, open from five in the evening', img: '/img/ht-storefront.webp' },
  { no: 'No 13', date: 'Saturday 6 June 2026', head: 'Queue Reaches Forty Metres', deck: 'A second fryer is to be installed next week', img: '/img/ht-rooftops.webp' },
];

export const PAGE_NAMES = ['Front Page', 'The Menu', 'Illustrated Supplement', 'Back Page'];
