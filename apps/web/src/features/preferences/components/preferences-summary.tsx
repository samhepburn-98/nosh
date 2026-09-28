import { Settings } from 'lucide-react';
import { Link } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { formatDietary } from '@/utils/format';

import { usePreferences } from '../api/get-preferences';

/**
 * The saved preferences as badges, and a way to update them. Shown under the heading of the
 * recipes that fit. Nothing with no preferences.
 */
export function PreferencesSummary() {
  const { data } = usePreferences();
  if (!data || data.dietary.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="flex flex-wrap gap-2">
        <span className="sr-only">Your preferences: </span>
        {data.dietary.map((dietary) => (
          <Badge key={dietary} variant="secondary">
            {formatDietary(dietary)}
          </Badge>
        ))}
      </p>
      <Link to={paths.preferences} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
        <Settings data-icon="inline-start" />
        Update preferences
      </Link>
    </div>
  );
}
