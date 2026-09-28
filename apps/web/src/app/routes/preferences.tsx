import { PageHeader } from '@/components/layout/page-header';
import { PreferencesForm } from '@/features/preferences/components/preferences-form';

export default function PreferencesRoute() {
  return (
    <>
      <title>Preferences · Nosh</title>
      <PageHeader title="Preferences" />
      <PreferencesForm />
    </>
  );
}
