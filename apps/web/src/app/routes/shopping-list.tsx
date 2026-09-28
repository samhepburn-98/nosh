import { PageHeader } from '@/components/layout/page-header';
import { useShoppingList } from '@/features/shopping-list/api/get-shopping-list';
import { ShoppingList } from '@/features/shopping-list/components/shopping-list';

export default function ShoppingListRoute() {
  // Shares the list's query, so it's fetched once. No line while it loads or when it's empty,
  // where the list says what to do.
  const { data } = useShoppingList();
  const count = data?.items.length ?? 0;

  return (
    <>
      <title>Shopping list · Nosh</title>
      <PageHeader
        title="Shopping list"
        description={
          count > 0 &&
          `${count} ${count === 1 ? 'thing' : 'things'} for this week's meals, with amounts added up. It changes when your plan does.`
        }
      />
      <ShoppingList />
    </>
  );
}
