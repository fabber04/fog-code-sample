const NEW_COVERS_DIR = '/images/podcasts/New%20images';

/** Canonical podcast categories (slug stored in DB, name shown in UI). */
export const PODCAST_CATEGORIES = [
  { id: 'gents-empowerment', name: 'Gents Empowerment podcasts', coverFile: 'Gents Empowerment podcasts.png' },
  { id: 'ladies-empowerment', name: 'Ladies Empowerment Podcasts', coverFile: 'Ladies Empowerment Podcasts.png' },
  { id: 'wisdom-keys', name: 'Wisdom Keys', coverFile: 'Wisdom keys.jpeg' },
  { id: 'teens', name: 'Teens podcasts', coverFile: 'Teens Podcasts.jpeg' },
  { id: 'spiritual-development', name: 'Spiritual development', coverFile: 'Spiritual Development Podcasts.jpeg' },
  { id: 'personal-development', name: 'Personal Development', coverFile: 'Personal Development.jpeg' },
  { id: 'university-students', name: 'University Students podcasts', coverFile: 'University Students podcasts.jpeg' },
  { id: 'relationships', name: 'Relationship podcasts', coverFile: 'Relationship podcasts.png' },
];

/** Map legacy / alternate category values → canonical slug. */
export const CATEGORY_ALIASES = {
  'gents empowerment podcasts': 'gents-empowerment',
  'gents-empowerment': 'gents-empowerment',
  'fog-gents': 'gents-empowerment',
  'gents podcasts': 'gents-empowerment',

  'ladies empowerment podcasts': 'ladies-empowerment',
  'ladies-empowerment': 'ladies-empowerment',
  'wisdom-for-ladies': 'ladies-empowerment',
  'ladies podcasts': 'ladies-empowerment',

  'wisdom keys': 'wisdom-keys',
  'wisdom-keys': 'wisdom-keys',

  'teens podcasts': 'teens',
  teens: 'teens',
  'wisdom-for-teenagers': 'teens',
  'wisdom for teenagers': 'teens',

  'spiritual development': 'spiritual-development',
  'spiritual-development': 'spiritual-development',
  '01 spiritual growth podcasts': 'spiritual-development',

  'personal development': 'personal-development',
  'personal-development': 'personal-development',

  'university students podcasts': 'university-students',
  'university-students': 'university-students',
  'university student': 'university-students',
  'university students': 'university-students',

  'relationship podcasts': 'relationships',
  relationships: 'relationships',
  'relationships podcasts': 'relationships',
  'beyond-dating-game': 'relationships',
  'beyond the dating game': 'relationships',
};

const COVER_BY_ID = Object.fromEntries(
  PODCAST_CATEGORIES.map((c) => [c.id, c.coverFile])
);

export const DEFAULT_CATEGORY_ID = 'spiritual-development';

export function normalizeCategory(value = '') {
  if (!value) return DEFAULT_CATEGORY_ID;
  const key = value.trim().toLowerCase();
  return CATEGORY_ALIASES[key] || key;
}

export function getCategoryCoverPath(category) {
  const id = normalizeCategory(category);
  const file = COVER_BY_ID[id];
  if (!file) return null;
  return `${NEW_COVERS_DIR}/${encodeURIComponent(file)}`;
}

export function getCategoryDisplayName(category) {
  const id = normalizeCategory(category);
  const match = PODCAST_CATEGORIES.find((c) => c.id === id);
  return match ? match.name : category;
}
