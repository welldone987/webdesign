const fallbackThemeLabels = {
  chinese: '',
  english: '',
} as const;

export const themeDisplayLabels = {
  apricity: { chinese: '暖', english: 'Apricity' },
  azure: { chinese: '湛', english: 'Azure' },
  lush: { chinese: '盛', english: 'Lush' },
  pall: { chinese: '郁', english: 'Pall' },
} as const;

export function getThemeDisplayLabels(themeSlug: string) {
  return themeDisplayLabels[themeSlug as keyof typeof themeDisplayLabels] ?? fallbackThemeLabels;
}
