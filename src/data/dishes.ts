// What is printed on each dish's handbill. Sample data: ingredients, origins and allergens are placeholders
// to be checked against the real recipes before launch.
import type { ItemId } from './copy';

export interface DishSheet {
  tagline: string;
  /** Short line above the name on the handbill. */
  kicker: string;
  composition: { what: string; from: string }[];
  /** Declared allergens present (EU list). Empty means none of the fourteen. */
  allergens: string[];
  dietary: string;
  sauces: string[];
  note: string;
  served: string;
}

export const SHEETS: Record<ItemId, DishSheet> = {
  classique: {
    kicker: 'The first dish on the board',
    tagline: 'Fried twice in beef fat and salted by hand',
    composition: [
      { what: 'Bintje potatoes', from: 'Nord' },
      { what: 'Beef fat', from: 'Normandy' },
      { what: 'Grey sea salt', from: 'Guérande' },
    ],
    allergens: [],
    dietary: 'Fried in beef fat, so not suitable for vegetarians.',
    sauces: ['Aioli', 'Béarnaise', 'Smoked mayonnaise'],
    note: 'The dish the counter was opened for, and still the one most often ordered: about two cones in every three.',
    served: 'In a paper cone',
  },
  truffe: {
    kicker: 'Forty portions a night',
    tagline: 'Black truffle shaved to order over aged Comté',
    composition: [
      { what: 'Bintje potatoes', from: 'Nord' },
      { what: 'Beef fat', from: 'Normandy' },
      { what: 'Comté, aged 24 months', from: 'Jura' },
      { what: 'Black truffle', from: 'Périgord' },
      { what: 'Grey sea salt', from: 'Guérande' },
    ],
    allergens: ['Milk'],
    dietary: 'Contains milk. Fried in beef fat, so not suitable for vegetarians.',
    sauces: ['Aioli'],
    note: 'The truffle is shaved over the fries at the counter, after the cheese. When the forty portions are gone, the dish comes off the board until the next evening.',
    served: 'In a paper-lined basket',
  },
  poivre: {
    kicker: 'Pepper cracked every hour',
    tagline: 'Kampot pepper cracked in a mortar, with flaked salt',
    composition: [
      { what: 'Bintje potatoes', from: 'Nord' },
      { what: 'Beef fat', from: 'Normandy' },
      { what: 'Kampot black pepper', from: 'Cambodia' },
      { what: 'Flaked sea salt', from: 'Brittany' },
    ],
    allergens: [],
    dietary: 'Fried in beef fat, so not suitable for vegetarians.',
    sauces: ['Béarnaise', 'Mustard'],
    note: 'The pepper is cracked by hand at the counter once an hour, so that it is never more than an hour old when it reaches the fries.',
    served: 'On a sheet of paper',
  },
  grande: {
    kicker: 'Most often ordered after eleven',
    tagline: 'Six hundred grammes for two, with four sauces',
    composition: [
      { what: 'Bintje potatoes, 600 g', from: 'Nord' },
      { what: 'Beef fat', from: 'Normandy' },
      { what: 'Grey sea salt', from: 'Guérande' },
      { what: 'Four sauces of your choice', from: 'Made daily' },
    ],
    allergens: ['Eggs', 'Milk', 'Mustard'],
    dietary: 'Allergens depend on the sauces: aioli and mayonnaise contain eggs, béarnaise contains eggs and milk, mustard contains mustard.',
    sauces: ['Aioli', 'Béarnaise', 'Smoked mayonnaise', 'Andalouse', 'Mustard', 'Ketchup'],
    note: 'Served on a tin tray with the sauces in paper pots along one side. Most often ordered late in the evening, by two or three people standing at the ledge.',
    served: 'On a tin tray',
  },
};

export const COOKING = [
  'Peeled and cut by hand to ten millimetres in the morning.',
  'Rinsed twice in cold water and dried on cloths.',
  'First frying at 140 degrees, about eight minutes.',
  'Rested in wire baskets until ordered.',
  'Second frying at 185 degrees, ninety seconds.',
  'Salted by hand and wrapped in paper.',
];

export const EU_ALLERGENS = ['Cereals with gluten', 'Crustaceans', 'Eggs', 'Fish', 'Peanuts', 'Soya', 'Milk', 'Nuts', 'Celery', 'Mustard', 'Sesame', 'Sulphites', 'Lupin', 'Molluscs'];
