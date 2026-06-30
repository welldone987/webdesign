const fallbackThemeLabels = {
  chinese: '',
  english: '',
} as const;

export const themeDisplayLabels = {
  warm: { chinese: '暖', english: 'Apricity' },
  azure: { chinese: '湛', english: 'Azure' },
  bloom: { chinese: '盛', english: 'Lush' },
  umbrage: { chinese: '郁', english: 'Pall' },
} as const;

export function getThemeDisplayLabels(themeSlug: string) {
  return themeDisplayLabels[themeSlug as keyof typeof themeDisplayLabels] ?? fallbackThemeLabels;
}
