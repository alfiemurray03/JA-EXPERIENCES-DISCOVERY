/**
 * Admin portal theme-aware CSS class strings.
 * These use Tailwind dark: variants — they work because AdminLayout sets
 * the `dark` class on #admin-theme-root when the resolved theme is dark.
 *
 * Usage:
 *   import { adminCls } from '@/lib/admin-theme-classes';
 *   <div className={adminCls.card}>…</div>
 */

export const adminCls = {
  /** Card / panel background + border */
  card:       'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700',
  /** Page / section background (slightly off-white) */
  pageBg:     'bg-gray-50 dark:bg-slate-900',
  /** Primary text */
  text:       'text-gray-900 dark:text-white',
  /** Secondary / muted text */
  muted:      'text-gray-500 dark:text-slate-400',
  /** Very subtle / placeholder text */
  subtle:     'text-gray-400 dark:text-slate-600',
  /** Row / item background (zebra, hover, etc.) */
  rowBg:      'bg-gray-50 dark:bg-slate-700/40',
  /** Row hover */
  rowHover:   'hover:bg-gray-50 dark:hover:bg-slate-700/30',
  /** Divider / border */
  divider:    'border-gray-200 dark:border-slate-700',
  /** Stat / metric background */
  statBg:     'bg-gray-50 dark:bg-slate-700/50',
  /** Skeleton / loading pulse */
  pulse:      'bg-gray-100 dark:bg-slate-700/50',
  /** Input / form field */
  input:      'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-500',
  /** Refresh / icon button */
  iconBtn:    'text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700',
  /** Outline button (cancel / secondary) */
  outlineBtn: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700',
  /** Table header row */
  tableHead:  'bg-gray-50 border-gray-200 text-gray-500 dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-400',
  /** Select / dropdown content */
  selectContent: 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700',
  /** Select item */
  selectItem: 'text-gray-700 focus:text-gray-900 focus:bg-gray-100 dark:text-slate-300 dark:focus:text-white dark:focus:bg-slate-700',
  /** Dialog / modal */
  dialog:     'bg-white border-gray-200 text-gray-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white',
  /** Sheet / drawer */
  sheet:      'bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800',
  /** Tabs list */
  tabsList:   'bg-gray-100 border border-gray-200 dark:bg-slate-800 dark:border-slate-700',
  /** Tab trigger */
  tabsTrigger: 'text-gray-500 data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:text-slate-400 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white',
} as const;

/**
 * Plan badge styles — always use opacity variants so they work on both
 * light and dark backgrounds.
 */
export const planBadgeCls: Record<string, string> = {
  free:             'bg-gray-100 text-gray-600 border-gray-300 dark:bg-slate-600/40 dark:text-slate-300 dark:border-slate-500/30',
  personal:         'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
  standard:         'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
  professional:     'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30',
  organisation:     'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
  org_starter:      'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
  org_growth:       'bg-orange-100 text-orange-700 border-orange-300 dark:bg-amber-600/20 dark:text-amber-200 dark:border-amber-600/30',
  org_professional: 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-amber-700/20 dark:text-amber-100 dark:border-amber-700/30',
};

export const subStatusBadgeCls: Record<string, string> = {
  active:   'bg-green-100 text-green-700 border-green-300 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30',
  trialing: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
  past_due: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
  canceled: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30',
  unpaid:   'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30',
  inactive: 'bg-gray-100 text-gray-500 border-gray-300 dark:bg-slate-600/40 dark:text-slate-400 dark:border-slate-500/30',
};
