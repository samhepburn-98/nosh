import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

import { PageHeader } from '@/components/layout/page-header';
import { buttonVariants } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { RecipeForm } from '@/features/recipes/components/recipe-form';
import { cn } from '@/lib/utils';

export default function NewRecipeRoute() {
  const navigate = useNavigate();

  return (
    <>
      <title>New recipe · Nosh</title>
      <Link to={paths.recipes} className={cn(buttonVariants({ variant: 'ghost' }), 'self-start')}>
        <ArrowLeft data-icon="inline-start" />
        Back
      </Link>
      <PageHeader
        title="New recipe"
        description="Add a recipe of your own. You can plan it and shop for it like any other."
      />
      <RecipeForm
        // Replaces the form in the history, so going back from the new recipe skips it.
        onSaved={(recipe) =>
          void navigate(paths.recipe(recipe.slug), {
            replace: true,
            state: { back: paths.recipes },
          })
        }
      />
    </>
  );
}
