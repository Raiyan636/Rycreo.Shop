export interface RelatableItem {
  id: string;
  title?: string;
  mainProductTitle?: string;
  category?: string;
  subcategory?: string;
  tagline?: string;
  keywords?: string[];
  description?: string;
  position?: number;
  order?: number;
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'this', 'that', 'your', 'our', 'new',
  'best', 'top', 'premium', 'original', 'authentic', 'special', 'edition',
  'collection', 'drop', 'offer', 'combo', 'deal', 'free', 'gift', 'buy', 'get',
  'more', 'one', 'pre', 'order', 'preorder', 'mens', 'men', 'womens', 'women',
  'unisex', 'bangladesh', 'rycreo', 'rycreoshop', 'style', 'luxury', 'classic',
]);

// Product-type equivalence groups so similar products always cluster together first
const TYPE_GROUPS: string[][] = [
  ['watch', 'watches', 'smartwatch', 'smartwatches', 'timepiece', 'timepieces', 'chronograph', 'quartz', 'automatic', 'wristwatch', 'strap', 'ঘড়ি', 'ঘড়ি'],
  ['sunglass', 'sunglasses', 'eyewear', 'glasses', 'frame', 'chasma', 'চশমা', 'রোদচশমা'],
  ['earbud', 'earbuds', 'airpods', 'headphone', 'headphones', 'earphone', 'earphones', 'speaker', 'audio', 'tws', 'neckband', 'ইয়ারবাড'],
  ['kurta', 'panjabi', 'punjabi', 'festive', 'eid', 'mandarin', 'পাঞ্জাবি', 'পাঞ্জাবী', 'কুর্তা'],
  ['shirt', 'tshirt', 't-shirt', 'polo', 'tee', 'tees', 'drop-shoulder', 'oversized', 'hoodie', 'sweater', 'jacket', 'টি-শার্ট', 'শার্ট', 'পোলো', 'হুডি'],
  ['pant', 'pants', 'chino', 'chinos', 'cargo', 'jeans', 'denim', 'trouser', 'trousers', 'প্যান্ট', 'জিন্স'],
  ['shoe', 'shoes', 'sneaker', 'sneakers', 'loafer', 'loafers', 'boot', 'boots', 'sandal', 'footwear', 'জুতা', 'স্নিকার্স'],
  ['bag', 'bags', 'backpack', 'wallet', 'purse', 'clutch', 'handbag', 'luggage', 'ব্যাগ', 'মানিব্যাগ'],
  ['jewelry', 'jewellery', 'necklace', 'ring', 'bracelet', 'earring', 'bangle', 'pendant', 'গহনা', 'আংটি', 'ব্রেসলেট'],
  ['perfume', 'attar', 'fragrance', 'cologne', 'mist', 'body spray', 'পারফিউম', 'আতর'],
  ['electronics', 'gadget', 'gadgets', 'charger', 'powerbank', 'cable', 'wearable', 'tech', 'স্মার্ট'],
];

const normalizeToken = (str: string): string =>
  str.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, '').trim();

const extractTokens = (item: RelatableItem): Set<string> => {
  const combined = [
    item.title || '',
    item.mainProductTitle || '',
    item.category || '',
    item.subcategory || '',
    item.tagline || '',
    ...(Array.isArray(item.keywords) ? item.keywords : []),
  ]
    .join(' ')
    .toLowerCase();

  const rawWords = combined.split(/[\s,/|•&()+_-]+/);
  const tokens = new Set<string>();
  for (const w of rawWords) {
    const clean = normalizeToken(w);
    if (clean.length >= 2 && !STOP_WORDS.has(clean)) {
      tokens.add(clean);
      // Add singular stem if trailing s
      if (clean.length > 4 && clean.endsWith('s')) {
        tokens.add(clean.slice(0, -1));
      }
    }
  }
  return tokens;
};

const getMatchedTypeGroups = (tokens: Set<string>, rawText: string): Set<number> => {
  const groups = new Set<number>();
  const lower = rawText.toLowerCase();
  TYPE_GROUPS.forEach((group, idx) => {
    for (const kw of group) {
      if (tokens.has(kw) || (kw.length >= 4 && lower.includes(kw))) {
        groups.add(idx);
        break;
      }
    }
  });
  return groups;
};

export function sortRelatedItems<T extends RelatableItem>(
  source: RelatableItem,
  candidates: T[]
): T[] {
  const srcCat = normalizeToken(source.category || '');
  const srcSub = normalizeToken(source.subcategory || '');
  const srcTokens = extractTokens(source);
  const srcRawText = `${source.title || ''} ${source.mainProductTitle || ''} ${source.category || ''} ${source.subcategory || ''} ${(source.keywords || []).join(' ')}`;
  const srcGroups = getMatchedTypeGroups(srcTokens, srcRawText);

  const scored = candidates.map((cand, originalIndex) => {
    let score = 0;
    const candCat = normalizeToken(cand.category || '');
    const candSub = normalizeToken(cand.subcategory || '');
    const candTokens = extractTokens(cand);
    const candRawText = `${cand.title || ''} ${cand.mainProductTitle || ''} ${cand.category || ''} ${cand.subcategory || ''} ${(cand.keywords || []).join(' ')}`;
    const candGroups = getMatchedTypeGroups(candTokens, candRawText);

    // 1. Exact or stemmed category match
    if (srcCat && candCat) {
      if (
        srcCat === candCat ||
        srcCat.includes(candCat) ||
        candCat.includes(srcCat)
      ) {
        score += 120;
      }
    }

    // 2. Subcategory match
    if (srcSub && candSub) {
      if (srcSub === candSub || srcSub.includes(candSub) || candSub.includes(srcSub)) {
        score += 70;
      }
    }

    // 3. Same product-type semantic group (e.g., all Watches cluster together first)
    let groupMatches = 0;
    srcGroups.forEach((gIdx) => {
      if (candGroups.has(gIdx)) groupMatches += 1;
    });
    if (groupMatches > 0) {
      score += 95 * groupMatches;
    }

    // 4. Shared meaningful keyword / title tokens
    let tokenMatches = 0;
    srcTokens.forEach((tok) => {
      if (candTokens.has(tok)) tokenMatches += 1;
    });
    score += tokenMatches * 22;

    return { cand, score, originalIndex };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const posA = a.cand.position ?? a.cand.order ?? 9999;
    const posB = b.cand.position ?? b.cand.order ?? 9999;
    if (posA !== posB) return posA - posB;
    return a.originalIndex - b.originalIndex;
  });

  return scored.map((s) => s.cand);
}
