/**
 * Shared utility helpers used across components.
 */

/** Format a number to `decimals` decimal places with locale comma separation. */
export function fmt(value, decimals = 1) {
  if (value == null || isNaN(value)) return '—';
  return Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format rainfall value with mm unit. */
export function fmtMm(value, decimals = 1) {
  if (value == null || isNaN(value)) return '—';
  return `${fmt(value, decimals)} mm`;
}

/** Format percentage. */
export function fmtPct(value, decimals = 1) {
  if (value == null || isNaN(value)) return '—';
  const n = Number(value);
  const sign = n > 0 ? '+' : '';
  return `${sign}${fmt(n, decimals)}%`;
}

/** Season colours used consistently across charts. */
export const SEASON_COLORS = {
  winter:      '#6366f1',
  preMonsoon:  '#f59e0b',
  swMonsoon:   '#14b8a6',
  postMonsoon: '#f97316',
};

export const SEASON_NAMES = {
  winter:      'Winter',
  preMonsoon:  'Pre-Monsoon',
  swMonsoon:   'SW Monsoon',
  postMonsoon: 'Post-Monsoon',
};

/** Month short names. */
export const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/** Chart default colours. */
export const CHART_COLORS = {
  primary: '#14b8a6',
  secondary: '#3b82f6',
  accent: '#f59e0b',
  danger: '#ef4444',
  purple: '#a855f7',
};
