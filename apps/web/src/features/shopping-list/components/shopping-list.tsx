import { ShoppingBasket } from 'lucide-react';
import { Link } from 'react-router';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { paths } from '@/config/paths';

import { useShoppingList } from '../api/get-shopping-list';

/**
 * Everything the week's meals need, in one bordered list: the name on the left, the amount in
 * bold on the right. From `lg`, two columns that run A–Z down the first, then on to the second.
 */
export function ShoppingList() {
  const { data, isError, refetch } = useShoppingList();

  if (!data && !isError) {
    return (
      <div className="flex flex-col gap-2">
        <p role="status" className="sr-only">
          Loading your shopping list
        </p>
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-start gap-4">
        <Alert variant="destructive">
          <AlertTitle>We couldn't load your shopping list</AlertTitle>
          <AlertDescription>Check your connection, then try again.</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (data.items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShoppingBasket />
          </EmptyMedia>
          <EmptyTitle>
            <h2 className="text-lg">Nothing to buy yet</h2>
          </EmptyTitle>
          <EmptyDescription>
            Add some meals to your week and your list will appear here.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link to={paths.plan} className={buttonVariants()}>
            Go to your plan
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <>
      {/* The bottom line of each column would sit on the list's own border, so the wrapper clips
          the last pixel. */}
      <div className="overflow-hidden rounded-xl border">
        <ul className="-mb-px px-4 lg:columns-2 lg:gap-8">
          {data.items.map((item) => (
            <li
              key={item.name}
              className="flex break-inside-avoid items-baseline justify-between gap-4 border-b py-3"
            >
              {/* Capitalised on screen only: the name itself stays as stored. */}
              <span className="first-letter:uppercase">{item.name}</span>
              {item.amountText && <span className="shrink-0 font-bold">{item.amountText}</span>}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
