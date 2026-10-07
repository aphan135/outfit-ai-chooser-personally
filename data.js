// ---------- Color helper ----------
function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = pct < 0 ? 0 : 255, f = Math.abs(pct) / 100;
  r = Math.round((t - r) * f + r); g = Math.round((t - g) * f + g); b = Math.round((t - b) * f + b);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// ---------- Garment drawing (studio-photo look) ----------
let uid = 0;

function wrap(c, d, p = {}) {
  const i = 'g' + (++uid);
  return `<svg viewBox="0 0 64 64"><defs>
    <radialGradient id="${i}l" cx=".3" cy=".22" r="1.05">
      <stop offset="0" stop-color="${shade(c, 20)}"/><stop offset=".5" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -34)}"/>
    </radialGradient>
    <filter id="${i}n" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/>
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  .4 0 0 0 -.08"/>
    </filter>
    <filter id="${i}a" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".9"/></filter>
    <filter id="${i}b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.4"/></filter>
    <clipPath id="${i}c"><path d="${d}"/></clipPath>
  </defs>
  <path d="${d}" fill="rgba(0,0,0,.34)" filter="url(#${i}b)" transform="translate(1.2 2.6)"/>
  ${p.back || ''}
  <path d="${d}" fill="url(#${i}l)"/>
  <g clip-path="url(#${i}c)">
    <path d="${d}" fill="none" stroke="#000" stroke-width="5" opacity=".3" filter="url(#${i}b)"/>
    <g filter="url(#${i}a)">${p.folds || ''}</g>
    <rect width="64" height="64" filter="url(#${i}n)"/>
    ${p.detail || ''}
  </g>
  <path d="${d}" fill="none" stroke="rgba(0,0,0,.22)" stroke-width=".7" stroke-linejoin="round"/>
  ${p.front || ''}</svg>`;
}

const fold = (d, w = 2.6, op = .3, col = '#000') =>
  `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`;
const hi = (d, w = 2.2, op = .35) => fold(d, w, op, '#fff');
const ln = (c, d, n = -30, w = .9, extra = '') =>
  `<path d="${d}" fill="none" stroke="${shade(c, n)}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
const stitch = (c, d) => ln(c, d, -28, .7, 'stroke-dasharray="1.4 1.2" opacity=".8"');
const OUT = 'stroke="rgba(0,0,0,.28)" stroke-width=".8"';

const BODY = 'M24 8L8 16L6 47L14 48L17 28L18 57H46L47 28L50 48L58 47L56 16L40 8C39 14 36 16 32 16C28 16 25 14 24 8Z';
const HOOD = c => `<path d="M22 8C21 15 26 21 32 21C38 21 43 15 42 8C39 13 36 16 32 16C28 16 25 13 22 8Z" fill="${shade(c, -16)}" ${OUT}/>
  <path d="M25 10C26 15 29 18 32 18C35 18 38 15 39 10C37 13 35 14 32 14C29 14 27 13 25 10Z" fill="${shade(c, -52)}"/>`;
const SLEEVE_FOLDS = fold('M10 24C13 30 13 38 11 44', 2.6, .26) + fold('M54 24C51 30 51 38 53 44', 2.6, .26);
const TORSO_FOLDS = fold('M23 28C25 38 24 48 21 56', 3, .3) + fold('M41 28C39 38 41 48 44 56', 3, .28) + hi('M29 26C31 34 30 44 30 53', 3, .22);

const SHAPES = {
  cap: c => wrap(c, 'M14 41C14 22 25 14 37 14C49 14 56 26 56 41Z', {
    back: `<path d="M4 45C4 42 10 40 16 40L56 41L56 44C40 49 14 50 4 45Z" fill="${shade(c, -26)}" ${OUT}/>`,
    folds: hi('M20 30C22 23 28 18 34 17', 2.6, .42) + fold('M46 22C52 28 54 34 55 40', 3.4, .3) + fold('M14 41H56', 3.4, .38),
    detail: ln(c, 'M37 14C31 23 29 32 29 41M37 14C46 22 49 32 51 41M37 14C38 24 39 33 39 41', -34, .7),
    front: `<circle cx="37" cy="14" r="1.7" fill="${shade(c, -14)}" ${OUT}/>` }),

  beanie: c => wrap(c, 'M13 46C13 26 21 13 32 13C43 13 51 26 51 46Z', {
    folds: hi('M20 26C22 19 27 15 32 15', 2.8, .4) + fold('M47 28C50 34 50 40 50 45', 3.4, .3),
    detail: ln(c, 'M18 20V46M23 16V46M28 14V46M33 13V46M38 14V46M43 16V46M48 20V46', -22, 1, 'opacity=".7"'),
    front: `<path d="M10 42H54V53C54 55 52 56 50 56H14C12 56 10 55 10 53Z" fill="${shade(c, -8)}" ${OUT}/>` +
      ln(c, 'M15 43V55M20 43V55M25 43V55M30 43V55M35 43V55M40 43V55M45 43V55M50 43V55', -30, 1, 'opacity=".7"') +
      `<path d="M10 42H54" stroke="rgba(0,0,0,.35)" stroke-width="1.6" opacity=".5"/>` }),

  bucket: c => wrap(c, 'M17 41C17 24 23 15 32 15C41 15 47 24 47 41C42 44 22 44 17 41Z', {
    back: `<path d="M5 43C5 38 19 37 32 37C45 37 59 38 59 43C59 49 45 51 32 51C19 51 5 49 5 43Z" fill="${shade(c, -22)}" ${OUT}/>`,
    folds: hi('M22 30C23 23 27 18 31 17', 2.4, .4) + fold('M43 24C46 30 46 36 46 40', 3, .3),
    detail: ln(c, 'M17 33H47', -20, 2.4) + stitch(c, 'M17 36H47') }),

  tee: c => wrap(c, 'M22 8L8 15L13 27L20 24V56H44V24L51 27L56 15L42 8C40 12 36 14 32 14C28 14 24 12 22 8Z', {
    folds: TORSO_FOLDS + fold('M13 26C16 25 19 25 21 24', 2.4, .3) + fold('M51 26C48 25 45 25 43 24', 2.4, .3) + hi('M16 18L11 24', 2, .3),
    detail: stitch(c, 'M11 21.5L17.5 25.5') + stitch(c, 'M53 21.5L46.5 25.5') + stitch(c, 'M20 53.5H44'),
    front: `<path d="M22 8C24 14 28 17 32 17C36 17 40 14 42 8C38 10.5 36 11 32 11C28 11 26 10.5 22 8Z" fill="${shade(c, -50)}"/>` +
      `<path d="M22 8C24 14 28 17 32 17C36 17 40 14 42 8" fill="none" stroke="${shade(c, -16)}" stroke-width="2.2" stroke-linecap="round"/>` +
      `<path d="M23.5 9.4C25.5 14.5 28.5 16 32 16C35.5 16 38.5 14.5 40.5 9.4" fill="none" stroke="rgba(255,255,255,.22)" stroke-width=".6"/>` }),

  hoodie: c => wrap(c, BODY, {
    folds: TORSO_FOLDS + SLEEVE_FOLDS + fold('M18 52H46', 3, .3),
    detail: ln(c, 'M21 41H43L45 52H19Z', -32, .9) + ln(c, 'M6.5 43L14 44.5M57.5 43L50 44.5', -30, 1.6) + ln(c, 'M18 54H46', -30, 1.6),
    front: HOOD(c) + ln(c, 'M29 20V31M35 20V31', 55, 1.2) + `<circle cx="29" cy="31.5" r=".9" fill="${shade(c, 50)}"/><circle cx="35" cy="31.5" r=".9" fill="${shade(c, 50)}"/>` }),

  jacket: c => wrap(c, BODY, {
    folds: TORSO_FOLDS + SLEEVE_FOLDS + hi('M22 24L20 46', 3, .26),
    detail: ln(c, 'M32 21V57', -42, 1) + ln(c, 'M32 21V57', 40, 2, 'stroke-dasharray="1 1.2" opacity=".6"') + ln(c, 'M36 34L45 36M28 34L19 36', -36, .9) + ln(c, 'M6.5 43L14 44.5M57.5 43L50 44.5', -30, 1.6),
    front: HOOD(c) }),

  suit: c => wrap(c, 'M22 8L8 16L6 47L14 48L17 28L18 57H46L47 28L50 48L58 47L56 16L40 8Z', {
    folds: TORSO_FOLDS + SLEEVE_FOLDS,
    detail: ln(c, 'M22 8L32 32L42 8', -50, 1.2) + ln(c, 'M18 32H28M36 32H46', -40, 1) + `<circle cx="30" cy="38" r="1" fill="#111"/><circle cx="30" cy="44" r="1" fill="#111"/>`,
    front: `<path d="M26 8L32 24L38 8Z" fill="#ffffff"/>` + `<path d="M30 14L32 28L34 14Z" fill="#a81c1c"/>` }),

  shirt: c => wrap(c, 'M24 8L8 16L6 47L14 48L17 28L18 57H46L47 28L50 48L58 47L56 16L40 8L32 14Z', {
    folds: TORSO_FOLDS + SLEEVE_FOLDS,
    detail: ln(c, 'M32 21V57', -28, 1) + [30, 38, 46, 53].map(y => `<circle cx="34.5" cy="${y}" r=".9" fill="${shade(c, -45)}"/>`).join('') + ln(c, 'M6.5 43L14 44.5M57.5 43L50 44.5', -30, 1.6),
    front: `<path d="M24 8L32 21L27 20L21 11Z M40 8L32 21L37 20L43 11Z" fill="${shade(c, 12)}" ${OUT}/>` +
      `<path d="M26 10L32 15L38 10L32 13Z" fill="${shade(c, -45)}" opacity=".6"/>` }),

  pants: c => wrap(c, 'M18 6H46L50 58H34L32 27L30 58H14Z', {
    folds: fold('M24 30C23 40 22 48 21 56', 3, .3) + fold('M40 30C41 40 42 48 43 56', 3, .3) + fold('M31 28L30.5 56', 2.2, .22) +
      hi('M24 12C26 20 27 24 29 27', 2.4, .3) + hi('M40 12C38 20 37 24 35 27', 2.4, .22) + fold('M19 33C23 36 27 36 30 35', 2.2, .22) + fold('M45 33C41 36 37 36 34 35', 2.2, .22),
    detail: `<path d="M18 6H46L46.4 11.5H17.6Z" fill="${shade(c, -16)}"/>` + ln(c, 'M32 11.5V27', -38, .9) + ln(c, 'M19.5 14C22 21 25 24 29 26M44.5 14C42 21 39 24 35 26', -38, .9) +
      ln(c, 'M29 11L28 19M35 11L36 19', -50, 1.1) + stitch(c, 'M14.8 54.5H30.1M34 54.5H49.8') }),

  shorts: c => wrap(c, 'M16 10H48L53 44H35L32 28L29 44H11Z', {
    folds: fold('M22 24C21 31 20 37 19 43', 3, .3) + fold('M42 24C43 31 44 37 45 43', 3, .3) + hi('M21 17C23 22 26 26 29 28', 2.4, .3),
    detail: `<path d="M16 10H48L48.4 15.5H15.6Z" fill="${shade(c, -16)}"/>` + ln(c, 'M32 15.5V28', -38) + ln(c, 'M17 18C20 25 25 28 29 29M47 18C44 25 39 28 35 29', -38) +
      ln(c, 'M29 15L28 23M35 15L36 23', -50, 1.1) + stitch(c, 'M11.5 41H29M35 41H52.5') }),

  sneaker: c => wrap(c, 'M6 44C6 38 8 35 13 34L21 33C24 32 26 29 28 26H37C38 32 42 35 48 37C56 39 61 41 61 44Z', {
    back: `<path d="M5 44H61V48C61 50.5 59 52 56.5 52H9.5C7 52 5 50.5 5 48Z" fill="#f1ede4" ${OUT}/>
      <path d="M5 48H61" stroke="rgba(0,0,0,.18)" stroke-width=".8"/><path d="M6 46H60" stroke="rgba(255,255,255,.7)" stroke-width=".7"/>`,
    folds: hi('M15 37C19 34 24 33 28 32', 2, .5) + hi('M44 38C50 39 55 40 58 42', 1.8, .5) + fold('M28 42C34 43 42 43 47 41', 2.4, .28) + fold('M8 41C12 40 16 40 20 40', 2, .22),
    detail: `<path d="M47 36C55 38 61 40 61 44H45C46 41 47 39 47 36Z" fill="${shade(c, 14)}"/><path d="M6 38H13V44H6Z" fill="${shade(c, -16)}" opacity=".7"/>` +
      ln(c, 'M28 30L36 32M30 33L38 35M33 36L41 38', 85, 1.3) + stitch(c, 'M24 41H44'),
    front: `<path d="M28 26H37L36 29H27Z" fill="${shade(c, -14)}" ${OUT}/>` }),

  boot: c => wrap(c, 'M14 8H36L37 29C38 33 45 35 52 38C58 40 61 43 61 47H9V32C9 29 13 28 14 25Z', {
    back: `<path d="M7 46H61V52C61 53 60 54 59 54H9C8 54 7 53 7 52Z" fill="#2b2622" ${OUT}/>`,
    folds: hi('M17 12L18 28', 3, .36) + fold('M33 12L34 28', 3, .26) + fold('M12 44H58', 2.6, .3) + hi('M42 38C48 40 54 42 58 44', 1.8, .4),
    detail: ln(c, 'M14 14H36', -32, 1) + stitch(c, 'M10 41H56') + ln(c, 'M18 41V47', -32) + ln(c, 'M36 31C38 34 44 36 50 38', -28, 1) }),
};

const DEFAULT_SHAPE = { hat: 'cap', top: 'tee', bottom: 'pants', shoes: 'sneaker' };
function art(cat, color = '#9a978e', shape) {
  return SHAPES[shape || DEFAULT_SHAPE[cat]](color);
}

// ---------- Button icons ----------
const ICONS = {
  lockOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/></svg>',
  lockOn:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  spin:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/></svg>'
};

const CATS = ['hat', 'top', 'bottom', 'shoes'];

// ---------- Products ----------
const COLORS = {
  black: '#1a1a1a', white: '#ffffff', grey: '#8d8d8d', charcoal: '#44464b', navy: '#1d2a40',
  blue: '#2f5d9e', 'light-blue': '#8fb8de', green: '#2f6b4f', olive: '#6b6f45', tan: '#c8b08a',
  cream: '#ece3cf', brown: '#6b4a2f', burgundy: '#6e2233', red: '#b8352c', orange: '#d9722b',
  yellow: '#e0b422', pink: '#d98ca0'
};

const STYLES = {
  hat: [
    ['Silk Bowtie & Pocket Square', 'cap', 45, 'Matching formal bowtie and pocket square set.', 'formal wedding date', 'black navy burgundy charcoal red'],
    ['Classic Silk Necktie', 'cap', 40, '100% woven silk tie for formal suits.', 'formal wedding date', 'navy black burgundy charcoal blue'],
    ['Wool Flat Cap', 'cap', 38, 'Classic wool-blend flat cap.', 'formal date winter casual', 'grey brown navy charcoal black olive'],
    ['Fine Knit Beanie', 'beanie', 30, 'Smooth fine-gauge knit beanie.', 'formal date winter', 'charcoal navy black cream burgundy'],
    ['Dad Cap', 'cap', 22, 'Washed cotton twill cap with a curved visor.', 'casual streetwear summer date', 'navy black tan olive white burgundy cream green'],
    ['Sport Cap', 'cap', 26, 'Breathable quick-dry cap with a sweatband.', 'gym running summer', 'black white navy grey red blue green']
  ],
  top: [
    ['Tailored Suit Jacket', 'suit', 240, 'Two-button wool-blend suit jacket with notch lapels.', 'formal wedding date', 'navy black charcoal blue grey burgundy'],
    ['Double-Breasted Blazer', 'suit', 260, 'Classic double-breasted blazer with brass-tone buttons.', 'formal wedding date', 'navy charcoal black'],
    ['Tuxedo Jacket', 'suit', 320, 'Formal tuxedo jacket with satin peak lapels.', 'formal wedding', 'black navy white'],
    ['Oxford Shirt', 'shirt', 58, 'Crisp cotton oxford with a button-down collar.', 'formal date casual wedding', 'white light-blue navy pink cream grey'],
    ['Poplin Dress Shirt', 'shirt', 64, 'Smooth poplin shirt with a spread collar.', 'formal date wedding', 'white light-blue pink cream black'],
    ['Classic Tee', 'tee', 29, 'Soft cotton crew-neck tee.', 'casual summer streetwear date', 'white black navy grey olive cream tan burgundy green']
  ],
  bottom: [
    ['Tailored Suit Trousers', 'pants', 120, 'Matching flat-front suit trousers with a pressed crease.', 'formal wedding date', 'navy black charcoal blue grey burgundy'],
    ['Tuxedo Trousers', 'pants', 140, 'Formal wool trousers with a satin side stripe.', 'formal wedding', 'black navy'],
    ['Dress Trousers', 'pants', 85, 'Tailored trousers with a clean crease.', 'formal date wedding', 'charcoal navy black grey tan olive'],
    ['Wool Trousers', 'pants', 98, 'Warm wool-blend trousers.', 'formal winter date wedding', 'charcoal grey brown navy'],
    ['Relaxed Chino', 'pants', 58, 'Garment-dyed cotton chino with a straight leg.', 'casual summer date', 'tan navy olive cream grey black burgundy'],
    ['Straight Jeans', 'pants', 72, 'Mid-weight denim in a straight fit.', 'casual streetwear date winter', 'blue black grey navy light-blue']
  ],
  shoes: [
    ['Leather Oxford Shoes', 'boot', 160, 'Polished cap-toe leather dress Oxfords.', 'formal wedding date', 'black brown burgundy'],
    ['Leather Derby Shoes', 'boot', 145, 'Classic open-laced leather dress shoes.', 'formal wedding date', 'black brown tan'],
    ['Leather Penny Loafers', 'boot', 135, 'Hand-stitched leather dress loafers.', 'formal date casual wedding', 'black brown burgundy tan'],
    ['Chelsea Boot', 'boot', 140, 'Leather boot with elastic side panels.', 'formal winter date wedding', 'black brown tan burgundy charcoal'],
    ['Leather Court Sneaker', 'sneaker', 95, 'Clean leather low-top sneaker.', 'casual formal date', 'white black cream navy']
  ]
};

const titleCase = s => s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
const POOL = {};
CATS.forEach(cat => {
  POOL[cat] = STYLES[cat].flatMap(([style, shape, price, desc, vibes, colors]) =>
    colors.split(' ').map(col => [
      `${titleCase(col)} ${style}`, price, desc, 'Your Store',
      `images/${cat}-${col}-${style.toLowerCase().replace(/[^a-z]+/g, '-')}.jpg`,
      COLORS[col], vibes.split(' '), shape
    ]));
});

const USE_PHOTOS = false;

function thumb(cat, p) {
  const [name, , , , src, color, , shape] = p;
  if (!USE_PHOTOS) return art(cat, color, shape);
  return `<img src="${src}" alt="${name}" loading="lazy" onerror="this.outerHTML = art('${cat}', '${color}', '${shape}')">`;
}