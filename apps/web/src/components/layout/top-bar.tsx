import { Link, NavLink } from 'react-router';

import logoMark from '@/assets/logo-mark.png';
import logoWordmark from '@/assets/logo-wordmark.png';
import { paths } from '@/config/paths';
import { cn } from '@/lib/utils';

import { navItems, preferencesNavItem, type NavItem } from './nav-items';

export function TopBar() {
  return (
    <header className="bg-header text-header-foreground">
      <div className="mx-auto flex h-18 max-w-5xl items-center justify-between px-4">
        {/* The logo is 30px tall, leaving the "O"-width clear space around it (docs/plan.md §5). The
            mark sits close to the wordmark, so the two read as one logo. */}
        <Link
          to={paths.plan}
          className="flex h-11 items-center gap-1.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <img src={logoMark} alt="" width={27} height={30} className="h-7.5 w-auto" />
          <img src={logoWordmark} alt="Nosh" width={81} height={30} className="h-7.5 w-auto" />
        </Link>
        <nav aria-label="Main" className="flex h-full items-center gap-1">
          {navItems.map((item) => (
            <TopBarLink key={item.href} item={item} className="hidden md:flex" />
          ))}
          <TopBarLink item={preferencesNavItem} labelClassName="sr-only md:not-sr-only" />
        </nav>
      </div>
    </header>
  );
}

function TopBarLink({
  item,
  className,
  labelClassName,
}: {
  item: NavItem;
  className?: string;
  labelClassName?: string;
}) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.href}
      // Only Plan ("/") matches exactly, so Recipes stays marked on a recipe page.
      end={item.href === paths.plan}
      className={({ isActive }) =>
        cn(
          // The current page is marked by weight and a green bar along the bottom edge, not just colour.
          'flex h-full min-w-11 items-center justify-center gap-2 border-y-4 border-transparent px-3 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ring',
          isActive
            ? 'border-b-primary font-bold text-header-foreground'
            : 'text-header-muted hover:text-header-foreground',
          className,
        )
      }
    >
      <Icon aria-hidden className="size-5" />
      <span className={labelClassName}>{item.label}</span>
    </NavLink>
  );
}
