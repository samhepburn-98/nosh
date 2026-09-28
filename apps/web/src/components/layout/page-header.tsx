import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * A page's title with its one line of guidance just beneath, and the page's own action (if any).
 * - On phones, the action sits beside the title, and the line runs the full width underneath.
 * - From sm, the title and line sit together on the left, and the action is on the right, lined up
 *   with the bottom of the two.
 */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-fill-fit items-center gap-x-4 gap-y-1">
      <h1 className="col-start-1 row-start-1 text-2xl">{title}</h1>
      {action && (
        <div className={cn('col-start-2 row-start-1', description && 'sm:row-span-2 sm:self-end')}>
          {action}
        </div>
      )}
      {description && (
        <p className="col-span-2 row-start-2 text-muted-foreground sm:col-span-1">{description}</p>
      )}
    </div>
  );
}
