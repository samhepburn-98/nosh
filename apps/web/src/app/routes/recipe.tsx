import { ArrowLeft } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router';

import { buttonVariants } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { RecipeDetails } from '@/features/recipes/components/recipe-details';
import { cn } from '@/lib/utils';

import NotFoundRoute from './not-found';

export default function RecipeRoute() {
  const { slug = '' } = useParams();
  const location = useLocation();

  return (
    <>
      {/* A link styled as a button: Button with nativeButton={false} would announce it as a button. */}
      <Link
        to={backLink(location.state)}
        className={cn(buttonVariants({ variant: 'ghost' }), 'self-start')}
      >
        <ArrowLeft data-icon="inline-start" />
        Back
      </Link>
      <RecipeDetails slug={slug} notFound={<NotFoundRoute />} />
    </>
  );
}

/** Back to the list the recipe was opened from, with its search, or to all recipes. */
function backLink(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'back' in state) {
    const { back } = state;
    if (typeof back === 'string' && back.startsWith('/')) return back;
  }
  return paths.recipes;
}
