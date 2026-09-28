import { ShoppingList } from '@/features/shopping-list/components/shopping-list';

export default function ShoppingListRoute() {
  return (
    <>
      <title>Shopping list · Nosh</title>
      <h1 className="text-2xl">Shopping list</h1>
      <ShoppingList />
    </>
  );
}
