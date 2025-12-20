// Business Types with icons
export const businessTypes = [
  { value: 'beverage', label: 'Minuman (Kopi, Teh, Jus)', icon: '🥤' },
  { value: 'main_course', label: 'Makanan Utama (Nasi, Mie, Ayam)', icon: '🍛' },
  { value: 'snack', label: 'Snack & Cemilan', icon: '🍟' },
  { value: 'bakery', label: 'Bakery & Dessert', icon: '🍰' },
  { value: 'catering', label: 'Catering / Preorder', icon: '🍱' },
  { value: 'frozen', label: 'Frozen Food', icon: '🧊' },
  { value: 'mix', label: 'Mix (Makanan + Minuman)', icon: '🍽️' },
] as const;

// Operating Model Primary Options
export const operatingModels = [
  { value: 'takeaway_booth', label: 'Takeaway / Booth / Gerobak' },
  { value: 'dine_in', label: 'Dine-in (Warung / Cafe)' },
  { value: 'delivery', label: 'Delivery Platform Online' },
  { value: 'preorder', label: 'Preorder (PO)' },
  { value: 'reseller', label: 'Titip Jual / Reseller' },
  { value: 'catering_event', label: 'Catering / Event' },
] as const;

// Major Cities (MVP)
export const cities = [
  { value: 'jakarta', label: 'Jakarta' },
  { value: 'bogor', label: 'Bogor' },
  { value: 'depok', label: 'Depok' },
  { value: 'tangerang', label: 'Tangerang' },
  { value: 'bekasi', label: 'Bekasi' },
  { value: 'bandung', label: 'Bandung' },
  { value: 'surabaya', label: 'Surabaya' },
  { value: 'medan', label: 'Medan' },
  { value: 'semarang', label: 'Semarang' },
  { value: 'makassar', label: 'Makassar' },
  { value: 'yogyakarta', label: 'Yogyakarta' },
  { value: 'bali', label: 'Bali' },
];

// Days of Week
export const daysOfWeek = [
  { value: 1, label: 'Sen' },
  { value: 2, label: 'Sel' },
  { value: 3, label: 'Rab' },
  { value: 4, label: 'Kam' },
  { value: 5, label: 'Jum' },
  { value: 6, label: 'Sab' },
  { value: 7, label: 'Min' },
];

// Extract values as a tuple for z.enum compatibility
export const businessTypeValues = [
  'beverage',
  'main_course',
  'snack',
  'bakery',
  'catering',
  'frozen',
  'mix',
] as const;
