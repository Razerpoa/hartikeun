const ABBREVIATION_MAP: Record<string, string> = {
  yg: 'yang',
  ga: 'tidak',
  gk: 'tidak',
  g: 'tidak',
  bgt: 'banget',
  gw: 'saya',
  gue: 'saya',
  dgn: 'dengan',
  utk: 'untuk',
  dlm: 'dalam',
  sdh: 'sudah',
  udh: 'sudah',
  bkn: 'bukan',
  kl: 'kalau',
  klo: 'kalau',
};

export function normalizeSlang(text: string): string {
  return text.split(/(\s+)/).map(w => {
    if (/^\s+$/.test(w)) return w;

    // Step 1: Expand common Indonesian text-speak abbreviations.
    // The word is a full token from splitting on whitespace, so "ga" inside "bangga"
    // will never match (it would be the token "bangga").
    const lower = w.toLowerCase();
    const expanded = ABBREVIATION_MAP[lower];
    if (expanded) {
      w = expanded;
    }

    // If word is entirely repeated vowels (e.g., aa, aaaa, uuu)
    // Normalize to exactly 2 characters (e.g., "aa", "ee") to preserve meanings like 'aa' (kakak)
    if (/^([aeiou])\1+$/i.test(w)) {
      return w.substring(0, 2).toLowerCase();
    }

    // Otherwise:
    // 1. Collapse sequences of repeated vowels (2 or more) to 1.
    let n = w.replace(/([aeiou])\1+/gi, '$1');
    // 2. Collapse sequences of 3 or more identical consonants to 1.
    n = n.replace(/([^aeiou\s\d])\1{2,}/gi, '$1');

    return n;
  }).join('');
}

// Canonical key for fuzzy matching in cache (e.g., e/eu equivalence)
export function getCacheKey(prefix: string, lang: string, text: string, extra?: string): string {
  let canonical = text.trim().toLowerCase();

  // Normalize e/eu variations: hideung <-> hideng
  // We only do this for words > 3 chars to avoid confusing 'teh'/'teu'
  const words = canonical.split(/\s+/).map(w => {
    if (w.length > 3) {
      return w.replace(/eu/g, 'e');
    }
    return w;
  });

  canonical = words.join(' ');

  return `${prefix}:${lang}${extra ? ':' + extra : ''}:${canonical}`;
}
