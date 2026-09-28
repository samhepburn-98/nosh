import { Link } from 'react-router';

import { paths } from '@/config/paths';
import { formatDietaryList } from '@/utils/format';

import { usePreferences } from '../api/get-preferences';

/** "Showing dairy-free recipes · Change", above a list of recipes. Nothing with no preferences. */
export function PreferencesSummary() {
  const { data } = usePreferences();
  if (!data || data.dietary.length === 0) return null;

  return (
    <p className="text-muted-foreground">
      Showing {formatDietaryList(data.dietary)} recipes ·{' '}
      <Link to={paths.preferences} className="text-foreground underline underline-offset-4">
        Change<span className="sr-only"> your preferences</span>
      </Link>
    </p>
  );
}
