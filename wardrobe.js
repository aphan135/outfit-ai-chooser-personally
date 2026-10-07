// ---------- Saved outfits: storage, panel, and buttons ----------
const STORAGE_KEY = 'outfitRoulette.saved';

const drawer   = document.getElementById('drawer');
const overlay  = document.getElementById('overlay');
const listEl   = document.getElementById('savedList');
const countEl  = document.getElementById('savedCount');

const detailsModal = document.getElementById('detailsModal');
const modalTitle   = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');
const modalWearBtn = document.getElementById('modalWearBtn');
const closeDetailsModal = document.getElementById('closeDetailsModal');

let saved = readSaved();
let currentModalOutfitId = null;

function readSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch (e) { return []; }
}
function writeSaved() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); }
  catch (e) { /* storage blocked */ }
}

function findProduct(cat, name) {
  return POOL[cat].find(p => p[0] === name);
}

function currentItems() {
  const items = {};
  CATS.forEach(cat => items[cat] = POOL[cat][state[cat].idx][0]);
  return items;
}

function flashSave(text) {
  const btn = document.getElementById('save');
  btn.lastChild.textContent = text;
  setTimeout(() => btn.lastChild.textContent = 'Save', 1200);
}

function saveOutfit() {
  const items = currentItems();
  const alreadySaved = saved.some(o => CATS.every(c => o.items[c] === items[c]));

  if (alreadySaved) {
    flashSave('Already saved');
    return;
  }

  saved.unshift({
    id: Date.now(),
    label: document.getElementById('vibe').value.trim() || 'Untitled',
    savedAt: new Date().toISOString(),
    items
  });
  writeSaved();
  renderWardrobe();
  flashSave('Saved');
}

function renderWardrobe() {
  countEl.textContent = saved.length;
  countEl.hidden = saved.length === 0;

  if (saved.length === 0) {
    listEl.innerHTML = `<p class="empty">No saved outfits yet.<br>Press <b>Save</b> on an outfit you like and it will show up here.</p>`;
    return;
  }

  listEl.innerHTML = saved.map(o => {
    let total = 0;
    const minis = CATS.map(cat => {
      const p = findProduct(cat, o.items[cat]);
      if (p) total += p[1];
      return `
        <div class="mini">
          <div class="tile">${p ? thumb(cat, p) : art(cat)}</div>
          <span title="${p ? p[0] : ''}">${p ? p[0] : 'Removed item'}</span>
        </div>`;
    }).join('');

    const date = new Date(o.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    return `
      <div class="saved-card">
        <div class="saved-top">
          <span class="saved-label">${o.label}</span>
          <span class="saved-total">$${total.toFixed(2)}</span>
        </div>
        <div class="saved-date">Saved ${date}</div>
        <div class="saved-minis">${minis}</div>
        <div class="saved-actions">
          <button class="wear" data-details="${o.id}">More details</button>
          <button class="del" data-del="${o.id}">Delete</button>
        </div>
      </div>`;
  }).join('');
}

function openWardrobe() {
  drawer.classList.add('open');
  overlay.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
}
function closeWardrobe() {
  drawer.classList.remove('open');
  overlay.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
}

// ---------- Modal logic ----------
function showDetails(id) {
  const outfit = saved.find(o => o.id === id);
  if (!outfit) return;

  currentModalOutfitId = id;
  modalTitle.textContent = `${outfit.label} Fit Details`;

  let grandTotal = 0;
  const itemsHTML = CATS.map(cat => {
    const p = findProduct(cat, outfit.items[cat]);
    if (!p) return '';
    const [name, price, desc, store, , colorHex] = p;
    grandTotal += price;

    return `
      <div class="detail-item">
        <div class="detail-thumb">${thumb(cat, p)}</div>
        <div class="detail-info">
          <div class="detail-cat">${cat}</div>
          <div class="detail-name">${name}</div>
          <div class="detail-desc">${desc}</div>
          <div class="detail-meta">
            <span><strong>Price:</strong> $${price.toFixed(2)}</span>
            <span class="swatch-wrap"><strong>Color:</strong> <span class="swatch" style="background:${colorHex}"></span></span>
            <span><strong>Store:</strong> ${store}</span>
          </div>
        </div>
      </div>`;
  }).join('');

  modalContent.innerHTML = `
    <div class="detail-list">${itemsHTML}</div>
    <div class="detail-summary">
      <span>Total Outfit Value</span>
      <strong>$${grandTotal.toFixed(2)}</strong>
    </div>`;

  detailsModal.hidden = false;
}

function hideDetails() {
  detailsModal.hidden = true;
  currentModalOutfitId = null;
}

function wearOutfit(id) {
  const outfit = saved.find(o => o.id === id);
  if (!outfit) return;

  CATS.forEach(cat => {
    const i = POOL[cat].findIndex(p => p[0] === outfit.items[cat]);
    if (i > -1) state[cat].idx = i;
    state[cat].locked = false;
  });
  render();
  hideDetails();
  closeWardrobe();
}

function deleteOutfit(id) {
  saved = saved.filter(o => o.id !== id);
  writeSaved();
  renderWardrobe();
}

// ---------- Events ----------
document.getElementById('save').onclick = saveOutfit;
document.getElementById('openWardrobe').onclick = openWardrobe;
document.getElementById('closeWardrobe').onclick = closeWardrobe;
closeDetailsModal.onclick = hideDetails;
detailsModal.onclick = e => { if (e.target === detailsModal) hideDetails(); };
overlay.onclick = () => { closeWardrobe(); hideDetails(); };

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeWardrobe();
    hideDetails();
  }
});

listEl.addEventListener('click', e => {
  const details = e.target.closest('[data-details]');
  const del     = e.target.closest('[data-del]');
  if (details) showDetails(Number(details.dataset.details));
  if (del)     deleteOutfit(Number(del.dataset.del));
});

modalWearBtn.onclick = () => {
  if (currentModalOutfitId) wearOutfit(currentModalOutfitId);
};

renderWardrobe();