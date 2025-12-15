export const businessTypes = [
  { value: 'coffee_shop', label: 'Coffee Shop / Cafe', icon: '☕' },
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { value: 'food_stall', label: 'Food Stall / Warung', icon: '🏪' },
  { value: 'bakery', label: 'Bakery / Pastry', icon: '🥐' },
  { value: 'beverage_stall', label: 'Beverage Stall', icon: '🧋' },
  { value: 'dessert_shop', label: 'Dessert Shop', icon: '🍰' },
  { value: 'catering', label: 'Catering', icon: '🍱' },
  { value: 'cloud_kitchen', label: 'Cloud Kitchen', icon: '👨‍🍳' },
  { value: 'other', label: 'Other', icon: '🍴' },
] as const;

export const operatingModels = [
  { value: 'home_based', label: 'Home-based (Rumahan)' },
  { value: 'booth', label: 'Booth / Stall' },
  { value: 'cafe', label: 'Café / Shop' },
  { value: 'cloud_kitchen', label: 'Cloud Kitchen' },
];

export const teamSizes = [
  { value: 'solo', label: 'Just me' },
  { value: '2-3', label: '2-3 orang' },
  { value: '4-5', label: '4-5 orang' },
  { value: '6+', label: '6+ orang' },
];

// Extract values as a tuple for z.enum compatibility
export const businessTypeValues = [
  'coffee_shop',
  'restaurant',
  'food_stall',
  'bakery',
  'beverage_stall',
  'dessert_shop',
  'catering',
  'cloud_kitchen',
  'other',
] as const;
