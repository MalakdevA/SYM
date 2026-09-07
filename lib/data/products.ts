import { PRODUCT_ARABIC_ALIASES, CATEGORY_ARABIC_ALIASES } from './searchAliases';

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  category: 'scooter' | 'bike';
  subCategory?: string;
  price: number;
  image: string;
  images: string[];
  description: string;
  capacity?: string;
  power?: string;
  speed?: string;
  cooling?: string;
  colors?: string[];
  specifications: {
    engine?: string;
    capacity?: string;
    battery?: string;
    speed?: string;
    range?: string;
    power?: string;
    torque?: string;
    brakes?: string;
    cooling?: string;
    transmission?: string;
    fuelTank?: string;
    weight?: string;
    seatHeight?: string;
    dimensions?: string;
    wheelBase?: string;
    frontSuspension?: string;
    rearSuspension?: string;
    frontTire?: string;
    rearTire?: string;
    frontBrakes?: string;
    rearBrakes?: string;
    fuelSystem?: string;
    rimMaterial?: string;
    startingSystem?: string;
    headlightSpec?: string;
    taillightSpec?: string;
    frontPositionLamp?: string;
    turningSignalLight?: string;
    emissionsStandard?: string;
    maxSpeed?: string;
    boreStroke?: string;
    compressionRatio?: string;
    idlingSpeed?: string;
    ignitionSystem?: string;
    alternator?: string;
    valveTrain?: string;
    tensioner?: string;
    frameMaterial?: string;
    clutchType?: string;
    tirePressure?: string;
    engineOilCapacity?: string;
    sparkPlug?: string;
    fuseSpec?: string;
    licenseLight?: string;
  };
  inStock: boolean;
  isNew?: boolean;
  bannerImage?: string;
  catalogPdf?: string;
  videoUrl?: string;
  images360?: string[];
}

export const PRODUCTS: ProductItem[] = [
  {
    id: 'cruisym-400i',
    name: 'CRUiSYM 400',
    slug: 'cruisym-400i',
    category: 'scooter',
    subCategory: 'Maxi Touring',
    price: 315000,
    image: '/assets/products/cruisym-400-grey.png',
    images: [
      '/assets/products/cruisym-400-grey.png',
      '/assets/products/cruisym-400-white.png',
      '/assets/products/cruisym-400-purple.png'
    ],
    // Real 8-angle studio shoot, in angle order [0°,45°,90°,135°,180°,225°,270°,315°].
    // To add a real 360° spin for another model: drop the same 8 shots into
    // public/assets/products/360/{slug}/ using these exact filenames, then
    // add this same images360 array (with {slug} swapped) to that product —
    // no code changes needed, View360Rotator picks it up automatically.
    images360: [
      '/assets/products/360/cruisym-400i/fr.png',
      '/assets/products/360/cruisym-400i/R45.png',
      '/assets/products/360/cruisym-400i/R90.png',
      '/assets/products/360/cruisym-400i/R135.png',
      '/assets/products/360/cruisym-400i/back.png',
      '/assets/products/360/cruisym-400i/L135.png',
      '/assets/products/360/cruisym-400i/L90.png',
      '/assets/products/360/cruisym-400i/l45.png',
    ],
    description: 'The ultimate flagship maxi touring scooter featuring a powerful 400cc engine, luxury ergonomics, and dynamic styling for long-distance cruising.',
    capacity: '400 cc',
    power: '34 HP @ 7500 RPM',
    speed: '145 km/h',
    cooling: 'Liquid Cooled',
    colors: ['#71717A', '#FFFFFF', '#4C1D95'],
    catalogPdf: '/assets/docs/SYM-Cruisym-400-Official-Catalog.pdf',
    specifications: {
      dimensions: '2230 x 820 x 1360 mm',
      wheelBase: '1552 mm',
      frontSuspension: 'Telescopic Fork',
      rearSuspension: 'Dual Shock',
      frontTire: '120 / 70-15',
      rearTire: '160 / 60-14',
      frontBrakes: 'Disc Ø 288 mm + ABS',
      rearBrakes: 'Disc Ø 275 mm + ABS',
      fuelTank: '14.5 L',
      engine: '4-stroke engine, single cylinder',
      capacity: '400 c.c.',
      fuelSystem: 'E.F.I.',
      power: '25 kW / 6,750 rpm',
      torque: '37 Nm / 5,000 rpm',
      cooling: 'Liquid',
      transmission: 'C.V.T.',
    },
    bannerImage: '/assets/banners/cruisym-400-scenic-banner.png',
    inStock: true,
    isNew: true,
  },
  {
    id: 'cruisym-300',
    name: 'CRUiSYM 300',
    slug: 'cruisym-300',
    category: 'scooter',
    subCategory: 'Maxi Touring',
    price: 274900,
    image: '/assets/products/cruisym-300-red.png',
    images: [
      '/assets/products/cruisym-300-red.png',
      '/assets/products/cruisym-300-black.png',
      '/assets/products/cruisym-300-white.png',
      '/assets/products/cruisym-300-blue.png'
    ],
    description: 'SYM integrates the urban and sport appearance, combines the touring function with the adventure elements, to create the multifunctional crossover Maxi scooter-Cruisym. The beak image of the adventure bike is blended into the front design. The foldable rear view mirrors with the high power LED signal lights create the unique identity. It is the most stylish scooter you have ever seen.',
    capacity: '300 cc',
    power: '27 HP @ 7750 RPM',
    speed: '135 km/h',
    cooling: 'Liquid Cooled',
    colors: ['#18181B', '#FFFFFF', '#DC2626', '#1E40AF'],
    specifications: {
      dimensions: '2189 x 756 x 1432 mm',
      wheelBase: '1550',
      weight: '194 kg',
      frontSuspension: 'Telescopic Fork',
      rearSuspension: 'Dual Shock',
      rimMaterial: 'Aluminum/ Aluminum',
      frontTire: '120 / 70- 14',
      rearTire: '140 / 60-13',
      frontBrakes: 'Disk Ø 260mm + ABS',
      rearBrakes: 'Disk Ø 240mm + ABS',
      fuelTank: '12 L',
      seatHeight: '760 mm',
      engine: '4-stroke engine, single cylinder',
      capacity: '278.3 c.c.',
      fuelSystem: 'E.F.I.',
      power: '19.1 kW / 7500 rpm',
      torque: '26.2 Nm / 6750 rpm',
      cooling: 'Liquid',
      transmission: 'C.V.T.',
      startingSystem: 'Electrical starter',
      headlightSpec: 'LED',
      taillightSpec: 'LED',
      frontPositionLamp: 'LED',
      turningSignalLight: 'LED/ LED',
    },
    bannerImage: '/assets/banners/cruisym-300-scenic-banner.png',
    inStock: true,
    isNew: true,
  },
  {
    id: 'joymax-z-300',
    name: 'Joymax Z 300',
    slug: 'joymax-z-300',
    category: 'scooter',
    subCategory: 'Maxi Touring',
    price: 221900,
    image: '/assets/products/joyg.png',
    images: [
      '/assets/products/joyg.png',
      '/assets/products/joyb.png',
      '/assets/products/joynav.png',
      '/assets/products/joywit.png'
    ],
    // Real 8-angle studio shoot, sourced from SYM's own official product page,
    // in angle order [0°,45°,90°,135°,180°,225°,270°,315°].
    images360: [
      '/assets/products/360/joymax-z-300/fr.png',
      '/assets/products/360/joymax-z-300/R45.png',
      '/assets/products/360/joymax-z-300/R90.png',
      '/assets/products/360/joymax-z-300/R135.png',
      '/assets/products/360/joymax-z-300/back.png',
      '/assets/products/360/joymax-z-300/L135.png',
      '/assets/products/360/joymax-z-300/L90.png',
      '/assets/products/360/joymax-z-300/l45.png',
    ],
    description: 'The Joymax Z 300 is a premium maxi-scooter combining sporty aerodynamic styling with a powerful liquid-cooled 300cc engine, full LED lighting, and advanced ABS braking for an unmatched touring experience.',
    capacity: '300 cc',
    power: '19 kW @ 8000 RPM',
    speed: '> 127 km/h',
    cooling: 'Liquid Cooled',
    colors: ['#18181B', '#71717A', '#1E3A8A', '#FFFFFF'],
    specifications: {
      dimensions: '2210 x 760 x 1425 mm',
      wheelBase: '1535 mm',
      weight: '190 kg',
      frontSuspension: 'Telescope fork',
      rearSuspension: 'Dual Shock',
      rimMaterial: 'Aluminum/ Aluminum',
      frontTire: '120 / 70- 14',
      rearTire: '140 / 60-13',
      frontBrakes: 'Disk Ø 260mm + ABS',
      rearBrakes: 'Disk Ø 240mm + ABS',
      fuelTank: '12 L',
      seatHeight: '755 mm',
      engine: '4-stroke engine, single cylinder',
      capacity: '300 c.c.',
      fuelSystem: 'E.F.I.',
      power: '19 kW/ 8,000 rpm',
      torque: '26 Nm / 6,000 rpm',
      maxSpeed: '> 127 km/h',
      cooling: 'Liquid',
      transmission: 'C.V.T.',
      startingSystem: 'Electrical starter',
      headlightSpec: 'LED',
      taillightSpec: 'LED',
      frontPositionLamp: 'LED',
      turningSignalLight: 'LED',
    },
    bannerImage: '/top_banner2.png?v=5',
    inStock: true,
    isNew: true,
  },
  {
    id: 'husky-adv',
    name: 'Husky ADV 200',
    slug: 'husky-adv',
    category: 'scooter',
    subCategory: 'Power Sport ADV',
    price: 159990,
    image: '/assets/products/husky-adv-grey.png',
    images: [
      '/assets/products/husky-adv-grey.png',
      '/assets/products/husky-adv-white.png',
      '/assets/products/husky-adv-black.png',
      '/assets/products/husky-adv-gunmetal.png'
    ],
    images360: [
      '/assets/products/husky-360/RIGHT45.png',
      '/assets/products/husky-360/LEFT45.png',
      '/assets/products/husky-360/LEFTSIDE.png',
      '/assets/products/husky-360/LEFT135.png',
      '/assets/products/husky-360/back.png',
      '/assets/products/husky-360/RIGHT135.png',
      '/assets/products/husky-360/RIGHTSIDE.png',
      '/assets/products/husky-360/RIGHT45.png'
    ],
    description: 'Crossover adventure maxi-scooter with a liquid-cooled 200cc engine, patented A.L.E.H. technology, 15L fuel tank, TCS traction control, dual ABS, and 5-inch color TFT display.',
    capacity: '200 cc',
    power: '18 ps / 8000rpm',
    speed: '115 km/h',
    cooling: 'Liquid',
    colors: ['#E60012', '#18181B', '#71717A'],
    specifications: {
      dimensions: '1980 x 780 x 1225 mm',
      wheelBase: '1390 mm',
      weight: '150 kg',
      frontSuspension: 'Telescopic Fork',
      rearSuspension: 'Side Mounted Mono-Shock Absorber',
      frontTire: '120 / 70 - 13',
      rearTire: '130 / 70 - 13',
      frontBrakes: 'Disk Ø 260mm + ABS',
      rearBrakes: 'Disc Ø 230 mm + ABS',
      fuelTank: '15 L',
      seatHeight: '810 mm',
      engine: '1-cylinder, Liquid-cooled',
      capacity: '200 c.c.',
      fuelSystem: 'E.F.I.',
      power: '18 ps / 8000rpm',
      torque: '15.6 Nm / 7000 rpm',
      cooling: 'Liquid',
      transmission: 'C.V.T.',
      startingSystem: 'Electrical starter',
      headlightSpec: 'LED',
      taillightSpec: 'LED',
      frontPositionLamp: 'LED',
      turningSignalLight: 'LED',
    },
    bannerImage: '/assets/banners/husky-adv-scenic-banner.png',
    inStock: true,
    isNew: true,
  },
  {
    id: 'jet-x-200',
    name: 'Jet X 200',
    slug: 'jet-x-200',
    category: 'scooter',
    subCategory: 'Sport Urban',
    price: 129900,
    image: '/assets/products/jet-x-200-black.png',
    images: [
      '/assets/products/jet-x-200-black.png',
      '/assets/products/jet-x-200-red.png',
      '/assets/products/jet-x-200-grey.png',
      '/assets/products/jet-x-200-blue.png',
      '/assets/products/jet-x-200-white.png'
    ],
    // Real 8-angle studio shoot, sourced from SYM's own official product page,
    // in angle order [0°,45°,90°,135°,180°,225°,270°,315°].
    images360: [
      '/assets/products/360/jet-x-200/fr.png',
      '/assets/products/360/jet-x-200/R45.png',
      '/assets/products/360/jet-x-200/R90.png',
      '/assets/products/360/jet-x-200/R135.png',
      '/assets/products/360/jet-x-200/back.png',
      '/assets/products/360/jet-x-200/L135.png',
      '/assets/products/360/jet-x-200/L90.png',
      '/assets/products/360/jet-x-200/l45.png',
    ],
    description: 'Urban sport scooter with sharp aggressive styling, digital display, full LED lighting, and liquid-cooled engine.',
    capacity: '200 cc',
    power: '17.4 HP @ 8000 RPM',
    speed: '120 km/h',
    cooling: 'Liquid Cooled',
    colors: ['#18181B', '#DC2626', '#4B5563', '#1D4ED8', '#FFFFFF'],
    specifications: {
      dimensions: '2000 x 760 x 1115 mm',
      wheelBase: '1350 mm',
      frontSuspension: 'Telescope fork',
      rearSuspension: 'Dual Shock',
      rimMaterial: 'Aluminum/ Aluminum',
      frontTire: '100/90-14',
      rearTire: '110/80-14',
      frontBrakes: 'Disk Ø 260mm + CBS / ABS',
      rearBrakes: 'Disk Ø 220 mm + CBS / ABS',
      fuelTank: '7.5 L',
      seatHeight: '780 mm',
      engine: '4-stroke engine, single cylinder',
      capacity: '175 c.c.',
      fuelSystem: 'E.F.I.',
      power: '12.8 kW / 8000 rpm',
      torque: '17.4 Nm / 6000 rpm',
      cooling: 'Liquid',
      transmission: 'C.V.T.',
      startingSystem: 'Electrical starter',
      headlightSpec: 'LED',
      taillightSpec: 'LED',
      frontPositionLamp: 'LED',
      turningSignalLight: 'LED',
    },
    bannerImage: '/top_banner2.png?v=5',
    inStock: true,
  },
  {
    id: 'jet-14-evo',
    name: 'Jet 14 Evo 150',
    slug: 'jet-14-evo',
    category: 'scooter',
    subCategory: 'Modern Liquid Cooled',
    price: 127900,
    image: '/assets/products/jet14-evo-main.png',
    images: [
      '/assets/products/jet14-evo-main.png',
      '/assets/products/jet14-evo-side.png',
      '/assets/products/jet14-evo-black.png',
      '/assets/products/jet14-evo-white.png'
    ],
    images360: [
      '/assets/products/jet14evo-360/front.png',
      '/assets/products/jet14evo-360/L45.png',
      '/assets/products/jet14evo-360/leftside.png',
      '/assets/products/jet14evo-360/L135.png',
      '/assets/products/jet14evo-360/back.png',
      '/assets/products/jet14evo-360/R135.png',
      '/assets/products/jet14evo-360/rightside.png',
      '/assets/products/jet14evo-360/R45.png'
    ],
    description: 'Evolved Jet 14 with liquid cooling and under-floor fuel tank providing massive under-seat storage.',
    capacity: '150 cc',
    power: '14.3 HP @ 8000 RPM',
    speed: '112 km/h',
    cooling: 'Liquid Cooled',
    colors: ['#FFFFFF', '#374151', '#18181B'],
    specifications: {
      dimensions: '2015 x 745 x 1120 mm',
      wheelBase: '1370 mm',
      frontSuspension: 'Telescope fork',
      rearSuspension: 'Dual Shock',
      rimMaterial: 'Aluminum/ Aluminum',
      frontTire: '100/90-14',
      rearTire: '120 / 80-14',
      fuelTank: '7.2 L',
      emissionsStandard: 'Euro 5+',
      engine: '4-stroke engine, single cylinder',
      capacity: '169.0 c.c.',
      fuelSystem: 'E.F.I.',
      power: '9.0 kW / 7,500 rpm',
      torque: '12.5 kW / 6,000 rpm',
      startingSystem: 'Electrical starter',
      headlightSpec: 'LED',
      taillightSpec: 'LED',
      frontPositionLamp: 'LED',
    },
    bannerImage: '/top_banner2.png?v=5',
    inStock: true,
  },
  {
    id: 'jet-14-dd',
    name: 'Jet 14 DD 150/200',
    slug: 'jet-14-dd',
    category: 'scooter',
    subCategory: 'Urban Commuter',
    price: 107900,
    image: '/assets/products/jet14-dd-black.png',
    images: [
      '/assets/products/jet14-dd-black.png',
      '/assets/products/jet14-dd-blue.png',
      '/assets/products/jet14-dd-gray.png',
      '/assets/products/jet14-dd-white.png'
    ],
    // Official SYM Global studio rotation set for the Jet 14 E5-generation body (shared across
    // the 150/200 DD engine options — chassis/bodywork is identical, only the engine differs).
    // Source: sym-global.com/jet14-e5, in the site's own carousel data-index order (0-7).
    images360: [
      '/assets/products/360/jet-14-dd/01-left45.png',
      '/assets/products/360/jet-14-dd/02-left180.png',
      '/assets/products/360/jet-14-dd/03-left135.png',
      '/assets/products/360/jet-14-dd/04-tail.png',
      '/assets/products/360/jet-14-dd/05-right135.png',
      '/assets/products/360/jet-14-dd/06-right180.png',
      '/assets/products/360/jet-14-dd/07-right45.png',
      '/assets/products/360/jet-14-dd/08-front.png',
    ],
    description: 'Practical urban commuter featuring double disc brakes and 14-inch alloy wheels for smooth city riding.',
    capacity: '150 cc',
    power: '12.5 HP @ 8000 RPM',
    speed: '105 km/h',
    cooling: 'Air Cooled',
    colors: ['#000000', '#1E40AF', '#6B7280', '#FFFFFF'],
    specifications: {
      dimensions: '1990 x 730 x 1115 mm',
      wheelBase: '1350 mm',
      weight: '134 kg',
      seatHeight: '770 mm',
      fuelTank: '7.5 L',
      frontSuspension: 'Telescopic Fork',
      rearSuspension: 'Dual Shock Absorber',
      rimMaterial: 'Aluminum Alloy / Aluminum Alloy',
      frontTire: '100 / 90-14',
      rearTire: '110 / 80-14',
      frontBrakes: 'Wave Disc Ø 260 mm',
      rearBrakes: 'Disc Ø 220 mm (Double Disc)',
      engine: '1-Cylinder 4-Stroke 2-Valve',
      capacity: '150 cc',
      fuelSystem: 'E.F.I. / Carburetor',
      power: '12.5 HP (9.2 kW) @ 8000 RPM',
      torque: '12.5 Nm @ 6000 RPM',
      speed: '105 km/h',
      cooling: 'Air Cooled',
      transmission: 'Automatic C.V.T.',
      startingSystem: 'Electrical Starter & Kick Starter',
      headlightSpec: 'Dual Bulb 12V 35W/35W + LED Position Lamps',
      taillightSpec: 'LED Matrix Signature',
      frontPositionLamp: 'LED DRL',
      turningSignalLight: 'Standard Bulbs',
    },
    bannerImage: '/top_banner2.png?v=5',
    inStock: true,
  },
  {
    id: 'jet-4-150',
    name: 'Jet 4 150',
    slug: 'jet-4-150',
    category: 'scooter',
    subCategory: 'Sport Compact',
    price: 75900,
    image: '/assets/products/jet4-main.png',
    images: [
      '/assets/products/jet4-main.png',
      '/assets/products/jet4b.png',
      '/assets/products/red jet4.png',
      '/assets/products/white jet4 .png'
    ],
    // Reusing the Jet 14 DD rotation set at the owner's explicit request — these are real
    // SYM Global studio photos, but of the Jet 14 body, not Jet 4's own. Swap in a real
    // Jet 4 360 set (same file convention) once available.
    images360: [
      '/assets/products/360/jet-14-dd/01-left45.png',
      '/assets/products/360/jet-14-dd/02-left180.png',
      '/assets/products/360/jet-14-dd/03-left135.png',
      '/assets/products/360/jet-14-dd/04-tail.png',
      '/assets/products/360/jet-14-dd/05-right135.png',
      '/assets/products/360/jet-14-dd/06-right180.png',
      '/assets/products/360/jet-14-dd/07-right45.png',
      '/assets/products/360/jet-14-dd/08-front.png',
    ],
    description: 'Jet 4 is one of the classic SYM models. It is the commuting scooter with the sports apparel and economical price.',
    capacity: '150 cc',
    power: '10.5 HP @ 7500 RPM',
    speed: '99 km/h',
    cooling: 'Air Cooled',
    colors: ['#4B5563', '#18181B', '#DC2626', '#FFFFFF'],
    specifications: {
      dimensions: '1900 x 745 x 1110 mm',
      wheelBase: '1,320 mm',
      weight: '115 kg',
      frontSuspension: 'Telescopic Fork',
      rearSuspension: 'Single Shock',
      rimMaterial: 'Aluminum/ Aluminum',
      frontTire: '110 / 70-12',
      rearTire: '120 / 70-12',
      frontBrakes: 'Disc Ø 226 mm + CBS',
      rearBrakes: 'Drum Ø 130 mm + CBS',
      fuelTank: '6.2 L',
      engine: '4-stroke engine, single cylinder',
      capacity: '150 c.c.',
      fuelSystem: 'E.F.I.',
      power: '10.5 HP (7.7 kW) / 7500 rpm',
      torque: '11.2 Nm / 6000 rpm',
      maxSpeed: '99 km / h',
      cooling: 'AIR',
      transmission: 'C.V.T.',
      startingSystem: 'Electrical starter',
      headlightSpec: 'LED',
      taillightSpec: 'LED',
      frontPositionLamp: 'LED',
    },
    bannerImage: '/assets/banners/jet4-hero-banner.png',
    inStock: true,
  },
  {
    id: 'symphony-st-new',
    name: 'Symphony ST 200 (New)',
    slug: 'symphony-st-new',
    category: 'scooter',
    subCategory: 'Big Wheel Euro',
    price: 109900,
    image: '/assets/products/champang copy.png',
    images: [
      '/assets/products/champang copy.png',
      '/assets/products/symphony-st-new-transparent.png',
      '/assets/products/black copy.png',
      '/assets/products/blue copy.png',
      '/assets/products/silver copy.png',
      '/assets/products/5 copy.png'
    ],
    // Official SYM Global studio rotation set for Symphony ST 200.
    // Source: sym-global.com (folder 03-1-SYMPHONY-ST-E5), in the site's own carousel
    // data-index order (0-7).
    images360: [
      '/assets/products/360/symphony-st-new/01-left45.png',
      '/assets/products/360/symphony-st-new/02-left180.png',
      '/assets/products/360/symphony-st-new/03-left135.png',
      '/assets/products/360/symphony-st-new/04-back.png',
      '/assets/products/360/symphony-st-new/05-right135.png',
      '/assets/products/360/symphony-st-new/06-right180.png',
      '/assets/products/360/symphony-st-new/07-right45.png',
      '/assets/products/360/symphony-st-new/08-front.png',
    ],
    description: "The Symphony ST is one of SYM's best-selling models and a top choice among the new generation of urban scooters.",
    capacity: '200 cc',
    power: '9.0 kW (12.2 HP) @ 7500 RPM',
    speed: '110 km/h',
    cooling: 'Air Cooled',
    colors: ['#4B5563', '#18181B', '#1E3A8A', '#D97706', '#9CA3AF'],
    specifications: {
      dimensions: '2,070 x 735 x 1,190 mm',
      wheelBase: '1,385 mm',
      weight: '128 kg',
      frontSuspension: 'Telescopic Fork',
      rearSuspension: 'Dual Shock',
      rimMaterial: 'Aluminum/ Aluminum',
      frontTire: '110 / 70-16',
      rearTire: '120 / 80-14',
      frontBrakes: 'Disk Ø 260mm + ABS',
      rearBrakes: 'Disk Ø 220mm + ABS',
      fuelTank: '7 L',
      engine: '4-stroke engine, single cylinder',
      capacity: '200 c.c.',
      fuelSystem: 'E.F.I.',
      power: '9.0 kW / 7,500 rpm',
      torque: '12.5 Nm / 6,000 rpm',
      cooling: 'AIR',
      transmission: 'C.V.T.',
      startingSystem: 'Electrical starter',
      headlightSpec: 'LED',
      taillightSpec: 'LED',
      frontPositionLamp: 'LED',
    },
    bannerImage: '/top_banner2.png?v=5',
    inStock: true,
  },
  {
    id: 'fiddle-4-150',
    name: 'Fiddle 4 150',
    slug: 'fiddle-4-150',
    category: 'scooter',
    subCategory: 'Retro Luxury',
    price: 89900,
    image: '/assets/products/Fiddle 4 1.png',
    images: [
      '/assets/products/Fiddle 4 1.png',
      '/assets/products/black 0.png',
      '/assets/products/blue 0.png',
      '/assets/products/white 0.png'
    ],
    // Official SYM Global studio rotation set for the Fiddle body (folder 19-FIDDLE, shared
    // across the 50/150 engine options). Source: sym-global.com/fiddle, carousel data-index order.
    images360: [
      '/assets/products/360/fiddle-4-150/01-left45.png',
      '/assets/products/360/fiddle-4-150/02-left180.png',
      '/assets/products/360/fiddle-4-150/03-left135.png',
      '/assets/products/360/fiddle-4-150/04-back.png',
      '/assets/products/360/fiddle-4-150/05-right135.png',
      '/assets/products/360/fiddle-4-150/06-right180.png',
      '/assets/products/360/fiddle-4-150/07-right45.png',
      '/assets/products/360/fiddle-4-150/08-front.png',
    ],
    description: 'For the last decade, Fiddle has been the most loyal urban pal leading thousands of youngsters in and out cities.',
    capacity: '150 cc',
    power: '8.4 kW (11.5 HP) @ 8500 RPM',
    speed: '100 km/h',
    cooling: 'Air Cooled',
    colors: ['#4B5563', '#18181B', '#1E3A8A', '#FFFFFF'],
    specifications: {
      dimensions: '1880 x 675 x 1115 mm',
      wheelBase: '1295 mm',
      weight: '108 kg',
      frontSuspension: 'Telescopic Fork',
      rearSuspension: 'Single Shock',
      rimMaterial: 'Aluminum/ Aluminum',
      frontTire: '110/70-12',
      rearTire: '120/70-12',
      frontBrakes: 'Disk Ø 226 mm',
      rearBrakes: 'Disk Ø 220 mm + CBS',
      fuelTank: '6.2 L',
      engine: '4-stroke engine, single cylinder',
      capacity: '149.6 cc',
      fuelSystem: 'E.F.I.',
      power: '8.4 kW / 8,500 rpm',
      torque: '10.3 Nm / 6,500 rpm',
      cooling: 'AIR',
      transmission: 'C.V.T.',
      startingSystem: 'Electrical starter',
      headlightSpec: 'LED',
      frontPositionLamp: 'LED',
    },
    bannerImage: '/top_banner2.png?v=5',
    inStock: true,
  },
  {
    id: 'fiddle-3-150',
    name: 'Fiddle 3 150',
    slug: 'fiddle-3-150',
    category: 'scooter',
    subCategory: 'Classic Vintage',
    price: 89900,
    image: '/assets/products/gray.png',
    images: [
      '/assets/products/gray.png',
      '/assets/products/Fiddle 3.png',
      '/assets/products/red.png',
      '/assets/products/white.png',
      '/assets/products/yellow.png'
    ],
    // Reusing the Fiddle 4 150 rotation set at the owner's explicit request — Fiddle III has
    // no real 360 photography of its own available yet. Swap in a real set (same file
    // convention) once available.
    images360: [
      '/assets/products/360/fiddle-4-150/01-left45.png',
      '/assets/products/360/fiddle-4-150/02-left180.png',
      '/assets/products/360/fiddle-4-150/03-left135.png',
      '/assets/products/360/fiddle-4-150/04-back.png',
      '/assets/products/360/fiddle-4-150/05-right135.png',
      '/assets/products/360/fiddle-4-150/06-right180.png',
      '/assets/products/360/fiddle-4-150/07-right45.png',
      '/assets/products/360/fiddle-4-150/08-front.png',
    ],
    description: 'The elegant Fiddle III blends vintage European retro aesthetics with powerful 150cc performance and dual disc braking.',
    capacity: '150 cc',
    power: '8.0 kW (10.8 HP) @ 7500 RPM',
    speed: '98 km/h',
    cooling: 'Air Cooled',
    colors: ['#2DD4BF', '#6B7280', '#DC2626', '#FFFFFF', '#F59E0B'],
    specifications: {
      dimensions: '1,900 x 690 x 1,130 mm',
      wheelBase: '1,330 mm',
      weight: '117 kg',
      frontSuspension: 'Telescopic Fork',
      rearSuspension: 'Dual Shock Absorber',
      rimMaterial: 'Aluminum / Aluminum',
      frontTire: '110/70-12',
      rearTire: '120/70-12',
      frontBrakes: 'Disc Ø 226 mm',
      rearBrakes: 'Disc Ø 220 mm',
      fuelTank: '6.5 L',
      emissionsStandard: 'Euro 4 / Euro 5',
      engine: '1-Cylinder 4-Stroke 2-Valve E.F.I.',
      capacity: '149 cc',
      fuelSystem: 'E.F.I.',
      power: '8.0 kW / 7,500 rpm',
      torque: '10.8 Nm / 6,000 rpm',
      speed: '98 km/h',
      cooling: 'AIR',
      transmission: 'C.V.T.',
      startingSystem: 'Electrical starter',
      headlightSpec: 'Halogen / Position LED',
    },
    bannerImage: '/top_banner2.png?v=5',
    inStock: true,
  },
  {
    id: 'fiddle-2-150',
    name: 'Fiddle 2 150',
    slug: 'fiddle-2-150',
    category: 'scooter',
    subCategory: 'Vintage Scooter',
    price: 72900,
    image: '/assets/products/f1.png',
    images: [
      '/assets/products/f1.png',
      '/assets/products/f2.png',
      '/assets/products/f3.png',
      '/assets/products/f4.png',
      '/assets/products/f5.png'
    ],
    // Official SYM Global studio rotation set for Fiddle II (folder 05-FIDDLE-II).
    // Source: sym-global.com, carousel data-index order.
    images360: [
      '/assets/products/360/fiddle-2-150/01-left45.png',
      '/assets/products/360/fiddle-2-150/02-left180.png',
      '/assets/products/360/fiddle-2-150/03-left135.png',
      '/assets/products/360/fiddle-2-150/04-back.png',
      '/assets/products/360/fiddle-2-150/05-right135.png',
      '/assets/products/360/fiddle-2-150/06-right180.png',
      '/assets/products/360/fiddle-2-150/07-right45.png',
      '/assets/products/360/fiddle-2-150/08-front.png',
    ],
    description: 'The reproduction of retro elegance and its pure western classic design are embodied on Fiddle II.',
    capacity: '150 cc',
    power: '7.6 kW (10.3 HP) @ 7750 RPM',
    speed: '95 km/h',
    cooling: 'Air Cooled',
    colors: ['#FFFFFF', '#000000', '#DC2626', '#EAB308', '#6B7280'],
    specifications: {
      dimensions: '1,875 x 690 x 1,140 mm',
      wheelBase: '1,285 mm',
      weight: '103 kg',
      frontSuspension: 'Telescopic Fork',
      rearSuspension: 'Single Shock',
      rimMaterial: 'Aluminum/ Aluminum',
      frontTire: '110/70-12',
      rearTire: '120/70-12',
      frontBrakes: 'Disc Ø 190 mm',
      rearBrakes: 'Drum Ø 110mm',
      fuelTank: '5.3 L',
      emissionsStandard: 'Euro 5',
      engine: '4-stroke engine, single cylinder',
      capacity: '149.6 cc',
      fuelSystem: 'E.F.I.',
      power: '7.6 kW / 7750 rpm',
      torque: '10.0 Nm / 6000 rpm',
      speed: '95km/h',
      cooling: 'AIR',
      transmission: 'C.V.T.',
      startingSystem: 'Electrical starter',
    },
    bannerImage: '/top_banner2.png?v=5',
    inStock: true,
  },
  {
    id: 'orbit-2-150',
    name: 'Orbit II 150',
    slug: 'orbit-2-150',
    category: 'scooter',
    subCategory: 'Everyday Commuter',
    price: 62900,
    image: '/assets/products/o1.png',
    images: [
      '/assets/products/o1.png',
      '/assets/products/o2.png',
      '/assets/products/o3.png',
      '/assets/products/o4.png',
      '/assets/products/o5.png'
    ],
    description: 'The Orbit II is a practical, lightweight everyday commuter scooter designed for smooth acceleration and effortless maneuverability.',
    capacity: '150 cc',
    power: '8.4 kW (11.4 HP) @ 8500 RPM',
    speed: '99 km/h',
    cooling: 'Air Cooled',
    colors: ['#18181B', '#DC2626', '#FFFFFF', '#2563EB', '#6B7280'],
    specifications: {
      dimensions: '1,905 x 690 x 1,125 mm',
      wheelBase: '1,325 mm',
      weight: '108 kg',
      frontSuspension: 'Telescopic Fork',
      rearSuspension: 'Single Unit Swing',
      rimMaterial: 'Aluminum / Aluminum',
      frontTire: '110/70-12',
      rearTire: '120/70-12',
      frontBrakes: 'Disc Ø 226 mm',
      rearBrakes: 'Drum Ø 130 mm',
      fuelTank: '5.2 L',
      emissionsStandard: 'Euro 5',
      engine: '4-stroke engine, single cylinder',
      capacity: '124.6 c.c. / 149 c.c.',
      fuelSystem: 'E.F.I.',
      power: '8.4 kW / 8,500 rpm',
      torque: '10.3 Nm / 6,500 rpm',
      speed: '99 km/h',
      cooling: 'AIR',
      transmission: 'C.V.T.',
      startingSystem: 'Electrical starter',
    },
    bannerImage: '/top_banner2.png?v=5',
    inStock: true,
  },
  {
    id: 'orbit-3-dx-150',
    name: 'Orbit III DX 150',
    slug: 'orbit-3-dx-150',
    category: 'scooter',
    subCategory: 'Urban Sport & Commuter',
    price: 69700,
    image: '/assets/products/orbit2.png',
    images: [
      '/assets/products/orbit2.png',
      '/assets/products/orbi1.png',
      '/assets/products/orbi3.png',
      '/assets/products/orbi4.png',
      '/assets/products/orbi.png'
    ],
    // Official SYM Global studio rotation set for Orbit III (folder 08-01-Orbit-III_E5).
    // Source: sym-global.com, carousel data-index order.
    images360: [
      '/assets/products/360/orbit-3-dx-150/01-left45.png',
      '/assets/products/360/orbit-3-dx-150/02-left180.png',
      '/assets/products/360/orbit-3-dx-150/03-left135.png',
      '/assets/products/360/orbit-3-dx-150/04-back.png',
      '/assets/products/360/orbit-3-dx-150/05-right135.png',
      '/assets/products/360/orbit-3-dx-150/06-right180.png',
      '/assets/products/360/orbit-3-dx-150/07-right45.png',
      '/assets/products/360/orbit-3-dx-150/08-front.png',
    ],
    description: 'The Orbit III DX 150 combines aggressive modern styling, enhanced 150cc power, and agile urban handling. Featuring full LED positioning lighting, digital instrument cluster, USB quick charger, and spacious under-seat storage, it represents the ultimate 150cc urban sport scooter for modern riders.',
    capacity: '150 cc',
    power: '8.5 kW (11.5 HP) @ 7,500 RPM',
    speed: '105 km/h',
    cooling: 'Air Cooled',
    colors: ['#2A4B53', '#18181B', '#1E293B', '#475569', '#FFFFFF'],
    specifications: {
      dimensions: '1,900 x 690 x 1,125 mm',
      wheelBase: '1,325 mm',
      weight: '115 kg',
      frontSuspension: 'Telescopic Fork',
      rearSuspension: 'Unit Swing Arm / Dual Shock',
      rimMaterial: 'Aluminum Alloy',
      frontTire: '110/70-12',
      rearTire: '120/70-12',
      frontBrakes: 'Disc Ø 226 mm + CBS',
      rearBrakes: 'Disc Ø 130 mm / Drum',
      fuelTank: '5.2 L',
      emissionsStandard: 'Euro 5',
      engine: '4-stroke engine, single cylinder 2V SOHC',
      capacity: '150 cc',
      fuelSystem: 'E.F.I. Electronic Fuel Injection',
      power: '8.5 kW (11.5 HP) / 7,500 rpm',
      torque: '10.8 Nm / 6,000 rpm',
      speed: '105 km/h',
      cooling: 'Air Cooled',
      transmission: 'C.V.T. Automatic',
      startingSystem: 'Electrical Starter',
      headlightSpec: 'Halogen / Full LED Position Lamp',
      taillightSpec: 'LED High Visibility',
    },
    bannerImage: '/assets/banners/orbit-3-dx-banner.png',
    inStock: true,
    isNew: true,
  },
  {
    id: 'symphony-sr-150',
    name: 'Symphony SR 150',
    slug: 'symphony-sr-150',
    category: 'scooter',
    subCategory: 'Sport Scooter',
    price: 89990,
    image: '/assets/products/symphony-sr-150-new/sr-gy-7547ul.png',
    images: [
      '/assets/products/symphony-sr-150-new/sr-gy-7547ul.png',
      '/assets/products/symphony-sr-150-new/sr-gy.png',
      '/assets/products/symphony-sr-150-new/sr-s-443u.png',
      '/assets/products/symphony-sr-150-new/sr-wh.png',
      '/assets/products/symphony-sr-150-new/sr-bk.png',
      '/assets/products/symphony-sr-150-new/sr-bk-007u.png'
    ],
    images360: [
      '/assets/products/360/symphony-sr-150/01-left45.png',
      '/assets/products/360/symphony-sr-150/02-left180.png',
      '/assets/products/360/symphony-sr-150/03-left135.png',
      '/assets/products/360/symphony-sr-150/04-back.png',
      '/assets/products/360/symphony-sr-150/05-right135.png',
      '/assets/products/360/symphony-sr-150/06-right90.png',
      '/assets/products/360/symphony-sr-150/08-front.png',
      '/assets/products/360/symphony-sr-150/01-left45.png',
    ],
    description: 'Sporty urban scooter featuring bold angular body lines, high 16-inch wheels, and dual disc brakes.',
    capacity: '150 cc',
    power: '7.7 kW (10.5 HP) @ 7500 RPM',
    speed: '95 km/h',
    cooling: 'Air Cooled',
    colors: ['#3F4550', '#71717A', '#A8A9AD', '#FFFFFF', '#18181B', '#0A0A0A'],
    specifications: {
      dimensions: '1,990 x 690 x 1190 mm',
      wheelBase: '1,355 mm',
      weight: '125 kg',
      frontSuspension: 'Telescopic Fork',
      rearSuspension: 'Dual Shock',
      rimMaterial: 'Aluminum/ Aluminum',
      frontTire: '110/70-16',
      rearTire: '110/70-16',
      frontBrakes: 'Disk Ø 260mm + CBS / ABS',
      rearBrakes: 'Disk Ø 240mm + CBS / ABS',
      fuelTank: '5.4 L',
      emissionsStandard: 'Euro 4',
      engine: '1-Cylinder 4-Stroke 2-Valve',
      capacity: '149.6 cc',
      fuelSystem: 'Carburetor / E.F.I.',
      power: '7.7 kW / 7,500 rpm',
      torque: '10.2 Nm / 6,000 rpm',
      speed: '95 km/h',
      cooling: 'AIR',
      transmission: 'C.V.T.',
      startingSystem: 'Electrical starter',
      headlightSpec: 'LED',
      taillightSpec: 'LED',
      frontPositionLamp: 'LED',
    },
    bannerImage: '/assets/banners/sr-150-custom-bg.png',
    inStock: true,
  },
  {
    id: 'symphony-sr-125',
    name: 'Symphony SR 150',
    slug: 'symphony-sr-125',
    category: 'scooter',
    subCategory: 'Sport Scooter',
    price: 89990,
    // Official SYM Global data (sym-global.com/symphonysr, folder 39-SYMPHONY-SR_E5_PLUS).
    image: '/assets/products/symphony-sr-125/sr-gy-7547ul.png',
    // Owner asked to keep only white/black/gray — trimmed from the full 6-color official set.
    images: [
      '/assets/products/symphony-sr-125/sr-gy-7547ul.png',
      '/assets/products/symphony-sr-125/sr-wh.png',
      '/assets/products/symphony-sr-125/sr-bk.png'
    ],
    images360: [
      '/assets/products/360/symphony-sr-125/01-left45.png',
      '/assets/products/360/symphony-sr-125/02-left180.png',
      '/assets/products/360/symphony-sr-125/03-left135.png',
      '/assets/products/360/symphony-sr-125/04-back.png',
      '/assets/products/360/symphony-sr-125/05-right135.png',
      '/assets/products/360/symphony-sr-125/06-right90.png',
      '/assets/products/360/symphony-sr-125/08-front.png',
      '/assets/products/360/symphony-sr-125/01-left45.png',
    ],
    description: 'Sporty urban scooter featuring bold angular body lines, high 16-inch wheels, and dual disc brakes.',
    capacity: '150 cc',
    power: '8.4 kW (11.3 HP) @ 8500 RPM',
    speed: '99 km/h',
    cooling: 'Air Cooled',
    colors: ['#3F4550', '#FFFFFF', '#18181B'],
    specifications: {
      dimensions: '1,990 x 690 x 1190 mm',
      wheelBase: '1,355 mm',
      weight: '125 kg',
      frontSuspension: 'Telescopic Fork',
      rearSuspension: 'Dual Shock',
      rimMaterial: 'Aluminum/ Aluminum',
      frontTire: '110/70-16',
      rearTire: '110/70-16',
      frontBrakes: 'Disk Ø 260mm + CBS / ABS',
      rearBrakes: 'Disk Ø 240mm + CBS / ABS',
      fuelTank: '5.4 L',
      engine: '4-stroke engine, single cylinder',
      capacity: '150 c.c.',
      fuelSystem: 'E.F.I.',
      power: '8.4 kW / 8,500 rpm',
      torque: '10.3 Nm / 6,500 rpm',
      speed: '99 km/h',
      cooling: 'AIR',
      transmission: 'C.V.T.',
      startingSystem: 'Electrical starter',
      headlightSpec: 'LED',
      taillightSpec: 'LED',
      frontPositionLamp: 'LED',
    },
    bannerImage: '/assets/banners/sr-150-custom-bg.png',
    inStock: true,
  },
  {
    id: 'symphony-st-150',
    name: 'Symphony ST 150 (Old ST)',
    slug: 'symphony-st-150',
    category: 'scooter',
    subCategory: 'Classic High Wheel',
    price: 90900,
    image: '/assets/products/st5.png',
    images: [
      '/assets/products/st5.png',
      '/assets/products/st1.png',
      '/assets/products/st2.png',
      '/assets/products/st3.png',
      '/assets/products/st4.png'
    ],
    description: 'Classic Symphony ST edition offering big 16-inch alloy wheels, superior stability, and iconic SYM styling.',
    capacity: '150 cc',
    power: '7.7 kW (10.5 HP) @ 7500 RPM',
    speed: '98 km/h',
    cooling: 'Air Cooled',
    colors: ['#18181B', '#FFFFFF', '#6B7280'],
    specifications: {
      dimensions: '2,070 x 735 x 1,190 mm',
      wheelBase: '1,385 mm',
      weight: '128 kg',
      frontSuspension: 'Telescopic Fork',
      rearSuspension: 'Dual Shock',
      rimMaterial: 'Aluminum/ Aluminum',
      frontTire: '110 / 70-16',
      rearTire: '120 / 80-14',
      frontBrakes: 'Disk Ø 260mm + ABS',
      rearBrakes: 'Disk Ø 220mm + ABS',
      fuelTank: '7 L',
      emissionsStandard: 'Euro 4',
      engine: '4-stroke engine, single cylinder',
      capacity: '168.9 c.c.',
      fuelSystem: 'E.F.I.',
      power: '9.0 kW / 7,500 rpm',
      torque: '12.5 Nm / 6,000 rpm',
      speed: '105 km/h',
      cooling: 'AIR',
      transmission: 'C.V.T.',
      startingSystem: 'Electrical starter',
      headlightSpec: 'LED',
      taillightSpec: 'LED',
      frontPositionLamp: 'LED',
    },
    bannerImage: '/assets/banners/st-150-custom-bg.png',
    inStock: true,
  },
  {
    id: 'nhx-200',
    name: 'NHX 200 (Street Fighter)',
    slug: 'nhx-200',
    category: 'bike',
    subCategory: 'Naked Street Bike',
    price: 99900,
    image: '/assets/products/nhx-200-main.png',
    images: [
      '/assets/products/nhx-200-main.png',
      '/assets/products/nhx-200-black.png',
      '/assets/products/nhx-200-blue.png'
    ],
    images360: [
      '/assets/products/360/nhx-200/front.png',
      '/assets/products/360/nhx-200/l45.png',
      '/assets/products/360/nhx-200/L90.png',
      '/assets/products/360/nhx-200/L135.png',
      '/assets/products/360/nhx-200/back.png',
      '/assets/products/360/nhx-200/R135.png',
      '/assets/products/360/nhx-200/r90.png',
      '/assets/products/360/nhx-200/R45.png',
    ],
    description: 'Aggressive streetfighter naked motorcycle with 200cc liquid-cooled engine and 6-speed manual transmission.',
    capacity: '200 cc',
    power: '18.2 HP @ 8500 RPM',
    speed: '125 km/h',
    cooling: 'Liquid Cooled',
    colors: ['#18181B', '#1D4ED8', '#E60012'],
    specifications: {
      dimensions: '2020 X 745 X 1075 mm',
      wheelBase: '1380 mm',
      weight: '153 kg',
      frontSuspension: 'Telescope fork',
      rearSuspension: 'Mono Shock',
      rimMaterial: 'Aluminum/ Aluminum',
      frontTire: '110 / 70-17',
      rearTire: '130 / 70-17',
      frontBrakes: 'Disk Ø 288mm + ABS',
      rearBrakes: 'Disk Ø 222mm + ABS',
      fuelTank: '14L',
      emissionsStandard: 'Euro 5',
      engine: '4-stroke engine, single cylinder',
      capacity: '183 cc',
      fuelSystem: 'EFI',
      power: '10.5 kW / 9,250 rpm',
      torque: '11 Nm / 7,500 rpm',
      speed: '114 km/h',
      cooling: 'Liquid',
      transmission: 'gear/ 6-speed',
      startingSystem: 'Electrical starter',
      headlightSpec: 'LED',
      taillightSpec: 'LED',
      frontPositionLamp: 'LED',
      turningSignalLight: 'LED/ LED',
    },
    bannerImage: '/assets/banners/nhx-200-custom-bg.png',
    inStock: true,
  },
  {
    id: 'nht-200',
    name: 'NHT 300 (Adventure Tourer)',
    slug: 'nht-200',
    category: 'bike',
    subCategory: 'Adventure Touring Bike',
    // Verified against the official sym-global.com/symnht300 page — the pre-existing entry's
    // spec table (dimensions/brakes/tires/fuel tank) already matched this page exactly, but its
    // name, capacity, and power/torque/weight figures didn't match any official SYM source.
    // Price carried over from the prior entry — owner should confirm.
    price: 105900,
    image: '/assets/products/nht-300/BK-7c.png',
    images: [
      '/assets/products/nht-300/BK-7c.png',
      '/assets/products/nht-300/GY430C.png',
      '/assets/products/nht-300/GY7450U.png',
      '/assets/products/nht-300/WHITE.png'
    ],
    images360: [
      '/assets/products/360/nht-300/front.png',
      '/assets/products/360/nht-300/left45.png',
      '/assets/products/360/nht-300/leftside.png',
      '/assets/products/360/nht-300/LEFT135.png',
      '/assets/products/360/nht-300/back.png',
      '/assets/products/360/nht-300/right135.png',
      '/assets/products/360/nht-300/RIGHTSIDE.png',
      '/assets/products/360/nht-300/RIGHT45.png',
    ],
    description: 'Crossover adventure motorcycle with a liquid-cooled 278.3cc engine, centered suspension, front & rear disc brakes with ABS, full LED lighting, and an LCD instrument.',
    capacity: '300 cc',
    power: '18.5 kW (25.2 HP) @ 7500 RPM',
    speed: '139 km/h',
    cooling: 'Liquid Cooled',
    colors: ['#18181B', '#71717A', '#A8A9AD', '#FFFFFF'],
    specifications: {
      dimensions: '2,068 x 860 x 1,195 mm',
      wheelBase: '1,405 mm',
      weight: '166 kg',
      frontSuspension: 'Telescopic Fork',
      rearSuspension: 'Mono Shock',
      rimMaterial: 'Steel / Steel',
      frontTire: '100 / 90-19',
      rearTire: '130 / 80-17',
      frontBrakes: 'Disk Ø 288mm + ABS',
      rearBrakes: 'Disk Ø 222mm + ABS',
      fuelTank: '11 L',
      engine: '4-stroke engine, single cylinder',
      capacity: '278.3 cc',
      fuelSystem: 'EFI',
      power: '18.5 kW / 7,500 rpm',
      torque: '24 Nm / 6,000 rpm',
      maxSpeed: '139 km/h',
      cooling: 'Liquid',
      transmission: 'Gear / 6-speed',
      startingSystem: 'Electrical starter',
      headlightSpec: 'LED',
      taillightSpec: 'LED',
      frontPositionLamp: 'LED',
      turningSignalLight: 'LED/ LED',
    },
    bannerImage: '/assets/banners/nht-200-custom-bg.png',
    inStock: true,
  },
  {
    id: 'xwolf-300',
    name: 'X-Wolf 150 (Classic Commuter)',
    slug: 'xwolf-300',
    category: 'bike',
    subCategory: 'Classic Commuter Bike',
    price: 54900,
    image: '/assets/products/xw.png',
    images: [
      '/assets/products/xw.png',
      '/assets/products/xw1.png',
      '/assets/products/xw2.png',
      '/assets/products/xw3.png',
      '/assets/products/xw4.png'
    ],
    description: 'Rugged commuter motorcycle built for daily urban utility and economic rides.',
    capacity: '150 cc',
    power: '9.1 kW / 8,500 rpm',
    speed: '110 km/h',
    cooling: 'Air Cooled',
    colors: ['#18181B', '#4B5563', '#DC2626'],
    specifications: {
      dimensions: '2050 ±20 x 745 ±20 x 1100 ±20 mm',
      wheelBase: '1280 ±20 mm',
      weight: '130 kg',
      engine: '4-Stroke 1-Cylinder O.H.C.',
      capacity: '149.4 cm³',
      boreStroke: 'Φ62 × 49.5 mm',
      compressionRatio: '9.1 ±0.2 : 1',
      idlingSpeed: '1500 ±100 RPM',
      power: '9.1 kW / 8500 RPM',
      torque: '11 N.m / 8500 RPM',
      valveTrain: 'O.H.C Over Head Camshaft',
      tensioner: 'Auto-Tensioner',
      frameMaterial: 'Steel Frame',
      frontSuspension: 'Telescopic Fork',
      rearSuspension: 'Double Swing Absorbers',
      rimMaterial: 'Aluminum',
      frontTire: '18 / 19 / 19 (2.75-18)',
      rearTire: '18 / 75.2 (3.00-18)',
      frontBrakes: 'Disc Ø 240mm',
      rearBrakes: 'Drum Ø 130mm',
      fuelTank: '15 L',
      ignitionSystem: 'Transistorized Coil Ignition',
      alternator: '140W / 5000RPM',
      battery: '12V 7AH',
      headlightSpec: '12V 35W/35W',
      frontPositionLamp: '12V 5W',
      turningSignalLight: '12V 5W/21W',
      cooling: 'Air Cooled',
      transmission: 'Manual 5-Speed',
      startingSystem: 'Electrical starter & Kick starter',
    },
    bannerImage: '/assets/banners/xwolf-300-custom-bg.png',
    inStock: true,
  },
  {
    id: 'adx-300',
    name: 'ADX 300',
    slug: 'adx-300',
    category: 'scooter',
    subCategory: 'Power Sport ADV',
    // Official SYM Global data (sym-global.com/adx300). Price pending — owner will confirm.
    price: 0,
    image: '/assets/products/adx-300/BK-007U.png',
    images: [
      '/assets/products/adx-300/BK-007U.png',
      '/assets/products/adx-300/BK2593U.png',
      '/assets/products/adx-300/gy7547ul.png',
      '/assets/products/adx-300/gy008c.png',
      '/assets/products/adx-300/wh.png'
    ],
    images360: [
      '/assets/products/360/adx-300/front.png',
      '/assets/products/360/adx-300/l45.png',
      '/assets/products/360/adx-300/leftside.png',
      '/assets/products/360/adx-300/L135.png',
      '/assets/products/360/adx-300/back.png',
      '/assets/products/360/adx-300/R135.png',
      '/assets/products/360/adx-300/Rightside.png',
      '/assets/products/360/adx-300/R45.png',
    ],
    description: 'Adventure crossover maxi-scooter with a liquid-cooled 278.3cc engine, TCS traction control, BOSCH ABS, 7-inch TFT LCD instrument, and dual USB charging.',
    capacity: '300 cc',
    power: '19.0 kW (25.8 HP) @ 8000 RPM',
    speed: '130 km/h',
    cooling: 'Liquid Cooled',
    colors: ['#3F4550', '#1F2937', '#71717A', '#A8A9AD', '#FFFFFF'],
    specifications: {
      dimensions: '2185 x 810 x 1325 mm',
      wheelBase: '1510 mm',
      frontSuspension: 'Telescopic Fork',
      rearSuspension: 'Dual Shock',
      rimMaterial: 'Aluminum/ Aluminum',
      frontTire: '120/70-15',
      rearTire: '140/70-14',
      frontBrakes: 'Disk + TCS / BOSCH ABS',
      rearBrakes: 'Disk + TCS / BOSCH ABS',
      fuelTank: '16 L',
      engine: 'SOHC, 4-stroke, Liquid-cooled, single cylinder',
      capacity: '278.3 c.c.',
      fuelSystem: 'E.F.I.',
      power: '19.0 kW / 8,000 rpm',
      torque: '26.0 Nm / 6,000 rpm',
      cooling: 'Liquid',
      transmission: 'C.V.T.',
      startingSystem: 'Electrical starter',
      headlightSpec: 'LED',
      taillightSpec: 'LED',
      frontPositionLamp: 'LED',
    },
    bannerImage: '/assets/banners/adx-300-scenic-banner.png',
    inStock: true,
    isNew: true,
  }
];

export function getActiveProducts(): ProductItem[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): ProductItem | undefined {
  if (!slug) return undefined;
  const list = getActiveProducts();
  const s = slug.toLowerCase().trim();
  if (s.includes('xwolf') || s.includes('x-wolf') || s === 'xw') {
    const found = list.find((p) => p.slug.includes('xwolf') || p.id.includes('xwolf'));
    if (found) return found;
  }
  if (s.includes('nht') || s.includes('nh-t')) {
    const found = list.find((p) => p.slug.includes('nht') || p.id.includes('nht'));
    if (found) return found;
  }
  return list.find(
    (p) =>
      p.slug === slug ||
      p.id === slug ||
      p.slug.replace(/^sym-/, '') === slug.replace(/^sym-/, '') ||
      p.slug.toLowerCase().replace(/[^a-z0-9]/g, '') === s.replace(/[^a-z0-9]/g, '')
  );
}

/**
 * Relevance tiers for a single (haystack, query) pair — lower is better:
 *  0 = haystack starts with the query (e.g. "Husky" vs "hu")
 *  1 = some word inside haystack starts with the query (e.g. "SYM Husky ADV" vs "hu")
 *  2 = query merely appears somewhere inside haystack (e.g. "mechanical" vs "ha")
 *  null = no match at all
 * Tier 2 is what made short fragments (2-3 letters typed mid-word while a customer is still
 * typing a model name) match completely unrelated words anywhere they happened to contain
 * that fragment — kept here, but callers suppress it for short queries.
 */
export function matchTier(haystack: string, q: string): number | null {
  const h = haystack.toLowerCase();
  if (!h || !q) return null;
  if (h.startsWith(q)) return 0;
  if (h.split(/[\s\-_.()/]+/).some((w) => w.startsWith(q))) return 1;
  if (h.includes(q)) return 2;
  return null;
}

export function bestTier(haystacks: (string | undefined)[], q: string): number | null {
  let best: number | null = null;
  for (const h of haystacks) {
    if (!h) continue;
    const t = matchTier(h, q);
    if (t !== null && (best === null || t < best)) best = t;
  }
  return best;
}

export function searchProducts(query: string): ProductItem[] {
  if (!query) return [];
  const q = query.toLowerCase().trim();
  const list = getActiveProducts();
  // Short fragments (still mid-typing a name) only match on the name's/word's start —
  // "anywhere in the string" matching is reserved for queries specific enough (3+ chars)
  // that random unrelated words are unlikely to contain them by coincidence.
  const maxTier = q.length < 3 ? 1 : 2;

  const scored = list
    .map((p) => {
      const aliases = PRODUCT_ARABIC_ALIASES[p.slug] || [];
      const categoryTerms = CATEGORY_ARABIC_ALIASES.find((c) => c.category === p.category)?.terms || [];
      const tier = bestTier([p.name, p.slug, p.subCategory, p.capacity, ...aliases, ...categoryTerms], q);
      return { p, tier };
    })
    .filter((r): r is { p: ProductItem; tier: number } => r.tier !== null && r.tier <= maxTier);

  scored.sort((a, b) => a.tier - b.tier);
  return scored.map((r) => r.p);
}
