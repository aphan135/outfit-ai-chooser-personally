// ---------- Vibe matching: turns typed words into outfit picks ----------

// Tag -> words that mean that tag. Add your own words to any list.
const VIBES = {
  gym:        ['gym', 'workout', 'training', 'exercise', 'fitness', 'sport', 'sports', 'athletic', 'lifting'],
  running:    ['run', 'running', 'jog', 'jogging', 'marathon'],
  rainy:      ['rain', 'rainy', 'raining', 'storm', 'stormy', 'wet', 'drizzle', 'umbrella'],
  casual:     ['casual', 'calm', 'chill', 'relaxed', 'everyday', 'easy', 'weekend', 'errands', 'simple', 'minimal', 'laid back', 'informal', 'unformal'],
  formal:     ['formal', 'office', 'work', 'interview', 'business', 'smart', 'professional', 'wedding', 'dressy'],
  winter:     ['winter', 'cold', 'snow', 'snowy', 'freezing', 'cozy', 'chilly'],
  summer:     ['summer', 'hot', 'warm', 'beach', 'sunny', 'vacation'],
  streetwear: ['street', 'streetwear', 'urban', 'skate', 'hype'],
  date:       ['date', 'dinner', 'night out', 'party', 'evening']
};

// Combination Vibe Presets: handles multi-style prompts like "wedding fit"
const SPECIAL_COMBOS = {
  wedding: ['formal', 'casual', 'date']
};

// Shortcut buttons shown under the box: [label shown, text sent]
const CHIPS = [
  ['Casual', 'casual'], ['Gym', 'gym'], ['Rainy', 'rainy'], ['Formal', 'formal'],
  ['Winter', 'winter'], ['Summer', 'summer'], ['Streetwear', 'streetwear'], ['Date night', 'date night'],
  ['Wedding fit', 'wedding fit']
];

// Which tags appear in the typed text?
function detectTags(text) {
  const t = ' ' + text.toLowerCase() + ' ';
  let tags = [];

  // 1. Check for special multi-vibe keywords (e.g. "wedding")
  Object.keys(SPECIAL_COMBOS).forEach(key => {
    if (new RegExp('\\b' + key + '\\b').test(t)) {
      tags.push(...SPECIAL_COMBOS[key]);
    }
  });

  // 2. Check individual vibe words
  Object.keys(VIBES).forEach(tag => {
    if (VIBES[tag].some(word => new RegExp('\\b' + word + '\\b').test(t))) {
      tags.push(tag);
    }
  });

  // Return unique tags
  return [...new Set(tags)];
}

function setHint(msg) {
  document.getElementById('vibeHint').textContent = msg;
}

// Called by Generate, Enter, and the shortcut buttons
function generateForVibe(text) {
  const tags = detectTags(text);
  activeTags = tags;   // single-slot rerolls stay inside this vibe too

  if (tags.length === 0) {
    setHint(text.trim()
      ? `I don't know "${text.trim()}" yet, so here is a random mix. Try gym, rainy, casual, formal, or wedding fit.`
      : 'Type a vibe like gym, rainy, casual, or wedding fit.');
  } else {
    setHint('Showing ' + tags.join(' + ') + ' looks.');
  }
  rerollAll();
}

// Build the shortcut buttons
const chipsEl = document.getElementById('chips');
chipsEl.innerHTML = ''; // clear old chips
CHIPS.forEach(([label, text]) => {
  const b = document.createElement('button');
  b.className = 'chip-btn';
  b.textContent = label;
  b.onclick = () => {
    document.getElementById('vibe').value = text;
    generateForVibe(text);
  };
  chipsEl.appendChild(b);
});