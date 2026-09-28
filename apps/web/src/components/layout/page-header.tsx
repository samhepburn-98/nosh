import type { ReactNode } from 'react';

/**
 * A page's title with its one line of guidance just beneath, and the page's own action (if any) to
 * the right, lined up with the bottom of the two.
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
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
