import { MapPinOff } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { paths } from '@/config/paths';

export default function NotFoundRoute() {
  return (
    <Empty>
      <title>Page not found · Nosh</title>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MapPinOff />
        </EmptyMedia>
        <EmptyTitle>
          <h1 className="text-xl">We can't find that page</h1>
        </EmptyTitle>
        <EmptyDescription>The link may be old, or the address may have a typo.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button nativeButton={false} render={<Link to={paths.plan} />}>
          Go to your plan
        </Button>
      </EmptyContent>
    </Empty>
  );
}
