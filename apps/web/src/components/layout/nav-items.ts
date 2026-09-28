import { BookOpen, CalendarDays, Settings, ShoppingBasket, type LucideIcon } from 'lucide-react';

import { paths } from '@/config/paths';

export type NavItem = { label: string; href: string; icon: LucideIcon };

/** The three places, in the bottom tab bar below `md` and the top bar from `md`. */
export const navItems: NavItem[] = [
  { label: 'Plan', href: paths.plan, icon: CalendarDays },
  { label: 'Recipes', href: paths.recipes, icon: BookOpen },
  { label: 'Shopping list', href: paths.shoppingList, icon: ShoppingBasket },
];

/** Always in the top bar: an icon button below `md`, a labelled link from `md`. */
export const preferencesNavItem: NavItem = {
  label: 'Preferences',
  href: paths.preferences,
  icon: Settings,
};
