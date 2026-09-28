import { NavLink } from 'react-router';

import { cn } from '@/lib/utils';

import { navItems } from './nav-items';

/** Phones only. It's sticky, not fixed, so it never covers the end of a page. */
export function TabBar() {
  return (
    <nav aria-label="Pages" className="sticky bottom-0 border-t bg-background pb-safe md:hidden">
      <ul className="grid grid-cols-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <NavLink
                to={item.href}
                end
                className="flex min-h-16 flex-col items-center justify-center gap-1 py-2 text-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                {({ isActive }) => (
                  <>
                    {/* The current page gets a green pill behind its icon and a bold label. */}
                    <span
                      className={cn(
                        'flex h-8 w-14 items-center justify-center rounded-full',
                        isActive && 'bg-primary text-primary-foreground',
                      )}
                    >
                      <Icon aria-hidden className="size-5" />
                    </span>
                    <span className={cn(isActive ? 'font-bold' : 'text-muted-foreground')}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
