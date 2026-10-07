const state = {};
CATS.forEach(cat => state[cat] = { idx: 0, locked: false });
let activeTags = [];   // set by the vibe box; empty = anything goes

const isLocked = cat => state[cat].locked;

// ---------- Picking ----------
function candidates(cat) {
  const all = POOL[cat].map((_, i) => i);
  if (!activeTags.length) return all;
  const scored = POOL[cat].map((p, i) => ({ i, s: p[6].filter(t => activeTags.includes(t)).length }));
  const best = Math.max(...scored.map(x => x.s));
  return best ? scored.filter(x => x.s === best).map(x => x.i) : all;
}

// Returns true if the item changed. A locked item is NEVER changed.
function roll(cat) {
  if (isLocked(cat)) return false;
  let c = candidates(cat);
  const others = c.filter(i => i !== state[cat].idx);
  if (others.length) c = others;
  state[cat].idx = c[Math.floor(Math.random() * c.length)];
  return true;
}

// ---------- HTML pieces ----------
const current = cat => POOL[cat][state[cat].idx];

function slotInner(cat) {
  const p = current(cat);
  return `<div class="thumb">${thumb(cat, p)}</div>
    <div class="meta"><div class="cat">${cat}</div><div class="name">${p[0]}</div><div class="price">$${p[1]}</div></div>`;
}
function itemInner(cat) {
  const p = current(cat);
  return `<div class="row"><span class="cat">${cat}</span><span class="amt">$${p[1].toFixed(2)}</span></div>
    <h3>${p[0]}</h3><p>${p[2]}</p><a href="#">Buy at ${p[3]}</a>`;
}
function updateTotal() {
  const total = CATS.reduce((sum, cat) => sum + current(cat)[1], 0);
  document.getElementById('total').textContent = '$' + total.toFixed(2);
}

// Make a slot's lock button, orange button and look match its lock state
function applyLockUI(cat) {
  const slot = document.querySelector(`.slot[data-cat="${cat}"]`);
  const lockBtn = slot.querySelector('[data-lock]');
  const spinBtn = slot.querySelector('[data-roll]');
  const on = isLocked(cat);

  slot.classList.toggle('locked', on);
  lockBtn.classList.toggle('on', on);
  lockBtn.innerHTML = on ? ICONS.lockOn : ICONS.lockOff;
  lockBtn.setAttribute('aria-label', (on ? 'Unlock ' : 'Lock ') + cat);

  // Orange button: switched off while locked (same look, just can't be clicked)
  spinBtn.disabled = on;
  spinBtn.style.pointerEvents = on ? 'none' : '';
  spinBtn.style.cursor = on ? 'default' : '';
}

// ---------- Full draw (first load, or wearing a saved outfit) ----------
function render() {
  const slots = document.getElementById('slots');
  const items = document.getElementById('items');
  slots.innerHTML = ''; items.innerHTML = '';
  CATS.forEach(cat => {
    slots.insertAdjacentHTML('beforeend', `
      <div class="slot" data-cat="${cat}">
        <div class="swap">${slotInner(cat)}</div>
        <button class="round lock" data-lock="${cat}">${ICONS.lockOff}</button>
        <button class="round spin" data-roll="${cat}" aria-label="Reroll ${cat}">${ICONS.spin}</button>
      </div>`);
    items.insertAdjacentHTML('beforeend', `<div class="item" data-cat="${cat}"><div class="swap-r">${itemInner(cat)}</div></div>`);
    applyLockUI(cat);
  });
  updateTotal();
}

// ---------- Change ONE slot with a quick slide (other slots are untouched) ----------
function swapTo(cat) {
  const els = [
    document.querySelector(`.slot[data-cat="${cat}"] .swap`),
    document.querySelector(`.item[data-cat="${cat}"] .swap-r`)
  ];
  const fill = () => { els[0].innerHTML = slotInner(cat); els[1].innerHTML = itemInner(cat); updateTotal(); };

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return fill();

  const outs = els.map(e => e.animate(
    { opacity: [1, 0], transform: ['translateY(0)', 'translateY(-14px)'] },
    { duration: 90, easing: 'ease-in', fill: 'forwards' }));
  Promise.all(outs.map(a => a.finished)).then(() => {
    fill();
    outs.forEach(a => a.cancel());
    els.forEach(e => e.animate(
      { opacity: [0, 1], transform: ['translateY(14px)', 'translateY(0)'] },
      { duration: 150, easing: 'ease-out' }));
  });
}

// One item: if it's locked, nothing happens
function rerollOne(cat) {
  if (isLocked(cat)) return;
  if (roll(cat)) swapTo(cat);
}

// Every unlocked item (locked ones are skipped automatically)
function rerollAll() {
  let n = 0;
  CATS.forEach(cat => {
    if (!roll(cat)) return;
    setTimeout(() => swapTo(cat), n++ * 80);   // small stagger
  });
}

// ---------- Events ----------
const slotsEl = document.getElementById('slots');

// Guard: runs FIRST. A click on a locked slot's orange button is stopped here.
slotsEl.addEventListener('click', e => {
  const rollBtn = e.target.closest('[data-roll]');
  if (rollBtn && isLocked(rollBtn.dataset.roll)) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }
}, true);

slotsEl.addEventListener('click', e => {
  const lockBtn = e.target.closest('[data-lock]');
  const rollBtn = e.target.closest('[data-roll]');

  if (lockBtn) {
    const cat = lockBtn.dataset.lock;
    state[cat].locked = !state[cat].locked;
    applyLockUI(cat);
    return;
  }

  if (rollBtn) {
    const cat = rollBtn.dataset.roll;
    if (isLocked(cat)) return;
    rollBtn.animate({ transform: ['rotate(0)', 'rotate(360deg)'] }, { duration: 350, easing: 'ease-out' });
    rerollOne(cat);
  }
});

document.getElementById('rerollAll').onclick = rerollAll;
const vibeInput = document.getElementById('vibe');
document.getElementById('gen').onclick = () => generateForVibe(vibeInput.value);
vibeInput.addEventListener('keydown', e => { if (e.key === 'Enter') generateForVibe(vibeInput.value); });

// ---------- Start ----------
CATS.forEach(roll);
render();

// Temporary check: the browser tab should now read "Outfit Roulette (v5)".
// Once you see that, you can delete this line.
document.title = 'Outfit Roulette (v5)';